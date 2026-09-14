import { Router } from "express";
import {
  getPaymentByOrderId,
  recordWebhookEvent,
  syncPaymentFromToss,
} from "../services/billingDatabase.js";
import { isTossConfigured, queryTossPaymentByOrderId } from "../services/tossPayments.js";

export const tossWebhookRouter = Router();

tossWebhookRouter.post("/toss", async (req, res) => {
  const payload: any = req.body || {};
  const eventType = String(payload.eventType || payload.type || "PAYMENT_EVENT");
  const orderId = String(payload.orderId || payload.data?.orderId || "").trim();
  const transmissionId = String(req.header("tosspayments-webhook-transmission-id") || "").trim() || null;

  try {
    await recordWebhookEvent(transmissionId, eventType, orderId || null, payload);

    // General Toss payment webhooks do not provide a universal signature that can be
    // trusted for payment state. Re-query Toss on the server before changing our DB.
    if (orderId && isTossConfigured()) {
      const local = await getPaymentByOrderId(orderId);
      if (local) {
        const verified = await queryTossPaymentByOrderId(orderId);
        await syncPaymentFromToss(orderId, verified);
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Toss webhook handling failed", error);
    // Non-2xx lets Toss retry delivery according to its webhook retry policy.
    res.status(500).json({ ok: false });
  }
});
