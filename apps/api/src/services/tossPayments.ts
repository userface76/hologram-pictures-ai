const TOSS_API_BASE = "https://api.tosspayments.com";

function secretKey() {
  const key = (process.env.TOSS_SECRET_KEY || "").trim();
  if (!key) throw new Error("TOSS_SECRET_KEY is not configured");
  return key;
}

function authorizationHeader() {
  return `Basic ${Buffer.from(`${secretKey()}:`).toString("base64")}`;
}

async function tossRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${TOSS_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: authorizationHeader(),
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error: any = new Error(data?.message || `Toss Payments API error (${response.status})`);
    error.code = data?.code || "TOSS_API_ERROR";
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export function isTossConfigured() {
  return Boolean((process.env.TOSS_SECRET_KEY || "").trim());
}

export function isTossBillingChargeEnabled() {
  return (process.env.TOSS_BILLING_ENABLED || "false").trim().toLowerCase() === "true";
}

export async function confirmTossPayment(input: {
  paymentKey: string;
  orderId: string;
  amount: number;
  idempotencyKey?: string;
}) {
  return tossRequest("/v1/payments/confirm", {
    method: "POST",
    headers: input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : undefined,
    body: JSON.stringify({
      paymentKey: input.paymentKey,
      orderId: input.orderId,
      amount: input.amount,
    }),
  });
}

/**
 * Exchanges the one-time authKey returned by requestBillingAuth() for a billingKey.
 * The billingKey is server-only and must never be returned to browser code.
 */
export async function issueTossBillingKey(input: {
  authKey: string;
  customerKey: string;
  idempotencyKey?: string;
}) {
  return tossRequest("/v1/billing/authorizations/issue", {
    method: "POST",
    headers: input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : undefined,
    body: JSON.stringify({
      authKey: input.authKey,
      customerKey: input.customerKey,
    }),
  });
}

export async function queryTossPaymentByOrderId(orderId: string) {
  return tossRequest(`/v1/payments/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
}

export async function cancelTossPayment(input: {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: number;
  idempotencyKey?: string;
}) {
  return tossRequest(`/v1/payments/${encodeURIComponent(input.paymentKey)}/cancel`, {
    method: "POST",
    headers: input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : undefined,
    body: JSON.stringify({
      cancelReason: input.cancelReason,
      ...(input.cancelAmount ? { cancelAmount: input.cancelAmount } : {}),
    }),
  });
}
