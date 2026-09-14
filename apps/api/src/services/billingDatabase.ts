import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "../lib/supabase.js";
import type { HoloPlan } from "../billing/plans.js";

function dbOrThrow() {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase is required for billing");
  return db;
}

export async function getBillingSummary(userId: string) {
  const db = dbOrThrow();
  const [wallet, payments, refunds, subscription] = await Promise.all([
    db.from("wallets").select("balance_seconds,updated_at").eq("user_id", userId).maybeSingle(),
    db.from("payments").select("id,order_id,plan_id,order_name,amount_krw,credit_seconds,currency,status,method,approved_at,created_at,updated_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    db.from("refund_requests").select("id,order_id,reason,requested_amount_krw,status,created_at,updated_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
    db.from("subscriptions").select("id,plan_id,status,current_period_start,current_period_end,next_charge_at,created_at,updated_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (wallet.error) throw wallet.error;
  if (payments.error) throw payments.error;
  if (refunds.error) throw refunds.error;
  if (subscription.error) throw subscription.error;
  return {
    wallet: wallet.data ?? { balance_seconds: 0 },
    payments: payments.data ?? [],
    refundRequests: refunds.data ?? [],
    subscription: subscription.data ?? null,
  };
}

export async function ensureBillingCustomer(userId: string) {
  const db = dbOrThrow();
  const existing = await db.from("billing_customers").select("user_id,toss_customer_key").eq("user_id", userId).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data?.toss_customer_key) return existing.data;

  // Toss recommends an unpredictable customerKey. Do not derive it from email/phone/member ID.
  const tossCustomerKey = `holo_${randomUUID()}`;
  const created = await db.from("billing_customers").insert({
    user_id: userId,
    toss_customer_key: tossCustomerKey,
  }).select("user_id,toss_customer_key").single();
  if (created.error) throw created.error;
  return created.data;
}

export async function createPendingPayment(userId: string, plan: HoloPlan) {
  const db = dbOrThrow();
  const orderId = `HOLO_${Date.now()}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const row = {
    user_id: userId,
    order_id: orderId,
    plan_id: plan.id,
    order_name: plan.orderName,
    amount_krw: plan.amountKrw,
    credit_seconds: plan.creditSeconds,
    currency: "KRW",
    status: "READY",
  };
  const result = await db.from("payments").insert(row).select("*").single();
  if (result.error) throw result.error;
  return result.data;
}

export async function getPaymentForUser(userId: string, orderId: string) {
  const db = dbOrThrow();
  const result = await db.from("payments").select("*").eq("user_id", userId).eq("order_id", orderId).maybeSingle();
  if (result.error) throw result.error;
  return result.data;
}

export async function getPaymentByOrderId(orderId: string) {
  const db = dbOrThrow();
  const result = await db.from("payments").select("*").eq("order_id", orderId).maybeSingle();
  if (result.error) throw result.error;
  return result.data;
}

export async function markPaymentFailed(userId: string, orderId: string, code?: string, message?: string) {
  const db = dbOrThrow();
  const result = await db.from("payments").update({
    status: "FAILED",
    failure_code: code ?? null,
    failure_message: message ?? null,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId).eq("order_id", orderId).select("*").maybeSingle();
  if (result.error) throw result.error;
  return result.data;
}

export async function markPaymentFromToss(userId: string, orderId: string, payment: any) {
  const db = dbOrThrow();
  const result = await db.from("payments").update({
    payment_key: payment?.paymentKey ?? null,
    status: payment?.status ?? "DONE",
    method: payment?.method ?? null,
    approved_at: payment?.approvedAt ?? null,
    toss_payload: payment ?? {},
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId).eq("order_id", orderId).select("*").single();
  if (result.error) throw result.error;
  return result.data;
}

export async function syncPaymentFromToss(orderId: string, payment: any) {
  const db = dbOrThrow();
  const result = await db.from("payments").update({
    payment_key: payment?.paymentKey ?? null,
    status: payment?.status ?? null,
    method: payment?.method ?? null,
    approved_at: payment?.approvedAt ?? null,
    toss_payload: payment ?? {},
    updated_at: new Date().toISOString(),
  }).eq("order_id", orderId).select("*").maybeSingle();
  if (result.error) throw result.error;
  return result.data;
}

export async function grantPaymentCredits(userId: string, payment: any) {
  const db = dbOrThrow();
  const seconds = Number(payment?.credit_seconds || 0);
  if (!seconds) return null;

  // Idempotency: one payment grant per order.
  const existing = await db.from("holo_credit_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("reference_type", "payment")
    .eq("reference_id", String(payment.order_id))
    .eq("kind", "grant")
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data;

  const wallet = await db.from("wallets").select("balance_seconds").eq("user_id", userId).single();
  if (wallet.error) throw wallet.error;
  const nextBalance = Number(wallet.data?.balance_seconds || 0) + seconds;

  const updated = await db.from("wallets").update({
    balance_seconds: nextBalance,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId).select("balance_seconds,updated_at").single();
  if (updated.error) throw updated.error;

  const tx = await db.from("holo_credit_transactions").insert({
    user_id: userId,
    amount_seconds: seconds,
    kind: "grant",
    reference_type: "payment",
    reference_id: String(payment.order_id),
    note: `${payment.plan_id} payment credit grant`,
    metadata: { payment_id: payment.id, order_id: payment.order_id },
  }).select("*").single();
  if (tx.error) throw tx.error;

  return { transaction: tx.data, wallet: updated.data };
}

export async function createRefundRequest(userId: string, orderId: string, reason: string) {
  const db = dbOrThrow();
  const payment = await getPaymentForUser(userId, orderId);
  if (!payment) throw new Error("payment_not_found");
  const result = await db.from("refund_requests").insert({
    user_id: userId,
    payment_id: payment.id,
    order_id: orderId,
    reason,
    status: "REQUESTED",
  }).select("*").single();
  if (result.error) throw result.error;
  return result.data;
}

export async function recordWebhookEvent(transmissionId: string | null, eventType: string | null, orderId: string | null, payload: any) {
  const db = dbOrThrow();
  const result = await db.from("payment_webhook_events").upsert({
    transmission_id: transmissionId || randomUUID(),
    event_type: eventType,
    order_id: orderId,
    payload: payload ?? {},
  }, { onConflict: "transmission_id", ignoreDuplicates: true }).select("id").maybeSingle();
  if (result.error) throw result.error;
  return result.data;
}
