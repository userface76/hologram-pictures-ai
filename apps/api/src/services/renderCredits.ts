import { randomUUID } from "node:crypto";
import type { VideoIntent } from "../core/types.js";
import { getSupabaseAdmin } from "../lib/supabase.js";

export class HoloCreditError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, code = "credit_error", statusCode = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = "HoloCreditError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function isTrue(value: string | undefined) {
  return String(value || "").toLowerCase() === "true";
}

export function isRenderCreditEnforced() {
  // Demo renders never consume paid credits. Production enforcement is explicitly opt-in
  // so deploying code before migration 005 is applied cannot lock users out.
  return isTrue(process.env.HOLO_CREDITS_ENFORCED) && !isTrue(process.env.DEMO_VIDEO_MODE || "true");
}

export function estimateRenderCredits(plan: Pick<VideoIntent, "duration" | "resolution">) {
  const duration = Math.max(4, Math.min(15, Math.round(Number(plan.duration) || 4)));
  const is2k = String(plan.resolution || "").toUpperCase().includes("2K");
  const multiplier = is2k ? 1.7 : 1;
  return {
    durationSeconds: duration,
    resolution: is2k ? "2K" : "768P",
    multiplier,
    credits: Math.max(1, Math.ceil(duration * multiplier)),
  };
}

function dbOrThrow() {
  const db = getSupabaseAdmin();
  if (!db) throw new HoloCreditError("Supabase is required for HOLO credits.", "credits_database_unavailable", 503);
  return db;
}

export async function reserveRenderCredits(userId: string, plan: VideoIntent) {
  const estimate = estimateRenderCredits(plan);
  if (!isRenderCreditEnforced()) return { enforced: false, estimate, reservationId: null, wallet: null };

  const db = dbOrThrow();
  const reservationId = randomUUID();
  const { data, error } = await db.rpc("reserve_holo_credits", {
    p_user_id: userId,
    p_reservation_id: reservationId,
    p_amount_seconds: estimate.credits,
    p_model: plan.model,
    p_resolution: estimate.resolution,
    p_duration_seconds: estimate.durationSeconds,
    p_metadata: {
      title: plan.title,
      aspect_ratio: plan.aspectRatio,
      audio: plan.audio,
      credit_multiplier: estimate.multiplier,
    },
  });
  if (error) throw new HoloCreditError(error.message, "credit_reservation_failed", 503, { dbCode: error.code });

  const result = (data || {}) as Record<string, any>;
  if (!result.ok) {
    throw new HoloCreditError(
      `영상 생성에 필요한 크레딧이 부족합니다. 필요 ${estimate.credits} · 보유 ${Number(result.balance_seconds || 0)}`,
      "insufficient_credits",
      402,
      {
        requiredCredits: estimate.credits,
        availableCredits: Number(result.balance_seconds || 0),
        reservedCredits: Number(result.reserved_seconds || 0),
        resolution: estimate.resolution,
        durationSeconds: estimate.durationSeconds,
      },
    );
  }

  return {
    enforced: true,
    estimate,
    reservationId,
    wallet: {
      balanceSeconds: Number(result.balance_seconds || 0),
      reservedSeconds: Number(result.reserved_seconds || 0),
    },
  };
}

export async function linkRenderCreditReservation(userId: string, reservationId: string | null, renderJobId: string) {
  if (!reservationId || !isRenderCreditEnforced()) return null;
  const db = dbOrThrow();
  const { data, error } = await db.rpc("link_holo_credit_reservation_job", {
    p_user_id: userId,
    p_reservation_id: reservationId,
    p_render_job_id: renderJobId,
  });
  if (error) throw new HoloCreditError(error.message, "credit_link_failed", 503, { renderJobId });
  return data;
}

export async function releaseRenderCreditReservation(userId: string, reservationId: string | null) {
  if (!reservationId || !isRenderCreditEnforced()) return null;
  const db = dbOrThrow();
  const { data, error } = await db.rpc("release_holo_credit_reservation", {
    p_user_id: userId,
    p_reservation_id: reservationId,
  });
  if (error) throw new HoloCreditError(error.message, "credit_release_failed", 503);
  return data;
}

export async function settleRenderCreditsForJob(userId: string, renderJobId: string) {
  if (!isRenderCreditEnforced()) return null;
  const db = dbOrThrow();
  const { data, error } = await db.rpc("settle_holo_credits_for_job", {
    p_user_id: userId,
    p_render_job_id: renderJobId,
  });
  if (error) throw new HoloCreditError(error.message, "credit_settle_failed", 503, { renderJobId });
  return data;
}

export async function releaseRenderCreditsForJob(userId: string, renderJobId: string) {
  if (!isRenderCreditEnforced()) return null;
  const db = dbOrThrow();
  const { data, error } = await db.rpc("release_holo_credits_for_job", {
    p_user_id: userId,
    p_render_job_id: renderJobId,
  });
  if (error) throw new HoloCreditError(error.message, "credit_release_failed", 503, { renderJobId });
  return data;
}
