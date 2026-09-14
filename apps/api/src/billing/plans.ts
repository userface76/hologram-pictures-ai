export type HoloPlanId = "starter" | "creator50" | "pro";

export type HoloPlan = {
  id: HoloPlanId;
  name: string;
  amountKrw: number;
  creditSeconds: number;
  billingCycle: "one_time_month_pack";
  orderName: string;
};

// Server-authoritative commercial catalog. The frontend may display the same values,
// but payment preparation and credit grants MUST use this server copy.
export const HOLO_PLANS: Record<HoloPlanId, HoloPlan> = {
  starter: {
    id: "starter",
    name: "STARTER",
    amountKrw: 29_000,
    creditSeconds: 150,
    billingCycle: "one_time_month_pack",
    orderName: "HOLO STARTER",
  },
  creator50: {
    id: "creator50",
    name: "CREATOR 50",
    amountKrw: 79_000,
    creditSeconds: 500,
    billingCycle: "one_time_month_pack",
    orderName: "HOLO CREATOR 50",
  },
  pro: {
    id: "pro",
    name: "PRO",
    amountKrw: 169_000,
    creditSeconds: 900,
    billingCycle: "one_time_month_pack",
    orderName: "HOLO PRO",
  },
};

export function getHoloPlan(id: string): HoloPlan | null {
  return Object.prototype.hasOwnProperty.call(HOLO_PLANS, id)
    ? HOLO_PLANS[id as HoloPlanId]
    : null;
}

export function publicHoloPlans() {
  return Object.values(HOLO_PLANS).map(({ id, name, amountKrw, creditSeconds, orderName }) => ({
    id,
    name,
    amountKrw,
    creditSeconds,
    orderName,
  }));
}
