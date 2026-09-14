import { Router } from "express";
import { z } from "zod";
import { getHoloPlan, publicHoloPlans } from "../billing/plans.js";
import {
  createPendingPayment,
  createRefundRequest,
  ensureBillingCustomer,
  getBillingSummary,
  getPaymentForUser,
  grantPaymentCredits,
  markPaymentFailed,
  markPaymentFromToss,
} from "../services/billingDatabase.js";
import { confirmTossPayment, isTossConfigured } from "../services/tossPayments.js";

export const paymentsRouter = Router();

function userIdOf(req: any) {
  const id = req.authUser?.id;
  if (!id) throw new Error("Authenticated user id is missing");
  return String(id);
}

paymentsRouter.get("/billing/plans", (_req, res) => {
  res.json({ plans: publicHoloPlans(), tossConfigured: isTossConfigured() });
});

paymentsRouter.get("/billing/summary", async (req, res, next) => {
  try { res.json({ billing: await getBillingSummary(userIdOf(req)) }); }
  catch (error) { next(error); }
});

const prepareSchema = z.object({ planId: z.string().min(1).max(40) });

paymentsRouter.post("/payments/prepare", async (req, res, next) => {
  try {
    const userId = userIdOf(req);
    const input = prepareSchema.parse(req.body);
    const plan = getHoloPlan(input.planId);
    if (!plan) return res.status(404).json({ error: "plan_not_found" });
    if (!isTossConfigured()) return res.status(503).json({ error: "toss_not_configured" });

    const [customer, payment] = await Promise.all([
      ensureBillingCustomer(userId),
      createPendingPayment(userId, plan),
    ]);

    res.status(201).json({
      checkout: {
        orderId: payment.order_id,
        orderName: payment.order_name,
        amount: { value: payment.amount_krw, currency: "KRW" },
        customerKey: customer.toss_customer_key,
        planId: payment.plan_id,
        creditSeconds: payment.credit_seconds,
      },
    });
  } catch (error) { next(error); }
});

const confirmSchema = z.object({
  paymentKey: z.string().min(1).max(300),
  orderId: z.string().min(6).max(64),
  amount: z.coerce.number().int().positive(),
});

paymentsRouter.post("/payments/confirm", async (req, res, next) => {
  try {
    const userId = userIdOf(req);
    const input = confirmSchema.parse(req.body);
    const pending = await getPaymentForUser(userId, input.orderId);
    if (!pending) return res.status(404).json({ error: "payment_not_found" });
    if (Number(pending.amount_krw) !== input.amount) {
      return res.status(409).json({ error: "payment_amount_mismatch" });
    }

    if (pending.status === "DONE" && pending.payment_key === input.paymentKey) {
      const credit = await grantPaymentCredits(userId, pending);
      return res.json({ payment: pending, credit, alreadyConfirmed: true });
    }

    const tossPayment = await confirmTossPayment({
      paymentKey: input.paymentKey,
      orderId: input.orderId,
      amount: Number(pending.amount_krw),
      idempotencyKey: String(pending.id),
    });

    const saved = await markPaymentFromToss(userId, input.orderId, tossPayment);
    const credit = tossPayment?.status === "DONE" ? await grantPaymentCredits(userId, saved) : null;
    res.json({ payment: saved, credit, toss: { status: tossPayment?.status, method: tossPayment?.method } });
  } catch (error: any) {
    try {
      const userId = userIdOf(req);
      const parsed = confirmSchema.safeParse(req.body);
      if (parsed.success) await markPaymentFailed(userId, parsed.data.orderId, error?.code, error?.message);
    } catch {}
    next(error);
  }
});

const failSchema = z.object({
  orderId: z.string().min(6).max(64),
  code: z.string().max(120).optional(),
  message: z.string().max(500).optional(),
});

paymentsRouter.post("/payments/fail", async (req, res, next) => {
  try {
    const userId = userIdOf(req);
    const input = failSchema.parse(req.body);
    const payment = await markPaymentFailed(userId, input.orderId, input.code, input.message);
    res.json({ payment });
  } catch (error) { next(error); }
});

const refundSchema = z.object({ reason: z.string().min(2).max(500) });

paymentsRouter.post("/payments/:orderId/refund-request", async (req, res, next) => {
  try {
    const userId = userIdOf(req);
    const input = refundSchema.parse(req.body);
    const request = await createRefundRequest(userId, req.params.orderId, input.reason);
    res.status(201).json({ refundRequest: request });
  } catch (error) { next(error); }
});
