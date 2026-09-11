import type { ImageRole, RenderJob, VideoIntent } from "../core/types.js";
import { getSupabaseAdmin } from "../lib/supabase.js";

export async function ensureUserAccount(userId: string, email?: string | null) {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const { error: profileError } = await db.from("profiles").upsert({
    user_id: userId,
    email: email ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (profileError) throw profileError;

  const { error: walletError } = await db.from("wallets").upsert({
    user_id: userId,
  }, { onConflict: "user_id", ignoreDuplicates: true });
  if (walletError) throw walletError;

  return true;
}

export async function getAccountSummary(userId: string) {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const [{ data: profile, error: profileError }, { data: wallet, error: walletError }] = await Promise.all([
    db.from("profiles").select("user_id,email,display_name,role,status,created_at,updated_at").eq("user_id", userId).maybeSingle(),
    db.from("wallets").select("balance_usd,updated_at").eq("user_id", userId).maybeSingle(),
  ]);
  if (profileError) throw profileError;
  if (walletError) throw walletError;
  return { profile, wallet };
}

function projectRow(userId: string, plan: VideoIntent) {
  return {
    user_id: userId,
    title: plan.title,
    status: "active",
    selected_model: plan.model,
    user_request: plan.userRequest,
    first_frame_url: plan.firstFrameImageUrl ?? null,
    reference_image_url: plan.referenceImageUrl ?? null,
    last_frame_url: plan.lastFrameImageUrl ?? null,
    metadata: {
      aspect_ratio: plan.aspectRatio,
      duration: plan.duration,
      resolution: plan.resolution,
      audio: plan.audio,
      style: plan.style ?? null,
      first_frame_url: plan.firstFrameImageUrl ?? null,
      reference_image_url: plan.referenceImageUrl ?? null,
      last_frame_url: plan.lastFrameImageUrl ?? null,
      source_image_url: plan.sourceImageUrl ?? null,
      source_image_role: plan.sourceImageRole ?? null,
      scenes: plan.scenes,
    },
  };
}

export async function createProject(userId: string, plan: VideoIntent) {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const row = projectRow(userId, plan);
  let result = await db.from("projects").insert(row).select("id,user_id,title,status,created_at").single();

  // Allows the app to keep working before migration 003 is manually applied in Supabase.
  if (result.error && String(result.error.message || "").includes("first_frame_url")) {
    const { first_frame_url: _first, reference_image_url: _reference, last_frame_url: _last, ...legacyRow } = row;
    result = await db.from("projects").insert(legacyRow).select("id,user_id,title,status,created_at").single();
  }

  if (result.error) throw result.error;
  return result.data;
}

export async function upsertRenderJob(userId: string, job: RenderJob) {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.from("render_jobs").upsert({
    id: job.id,
    user_id: userId,
    project_id: job.projectId ?? null,
    provider: job.provider,
    model: job.model,
    provider_task_id: job.providerTaskId ?? null,
    status: job.status,
    progress: job.progress,
    prompt: job.prompt,
    error: job.error ?? null,
    source_url: job.sourceUrl ?? null,
    storage_url: job.storageUrl ?? null,
    updated_at: new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getRenderJob(userId: string, id: string): Promise<RenderJob | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.from("render_jobs").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id ?? undefined,
    projectId: data.project_id ?? undefined,
    provider: data.provider,
    model: data.model,
    providerTaskId: data.provider_task_id ?? undefined,
    status: data.status,
    progress: data.progress ?? 0,
    prompt: data.prompt,
    error: data.error ?? undefined,
    sourceUrl: data.source_url ?? undefined,
    storageUrl: data.storage_url ?? undefined,
    outputUrl: data.storage_url ?? data.source_url ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at ?? undefined,
  } as RenderJob;
}

export async function createVideoRecord(userId: string, job: RenderJob, plan?: VideoIntent) {
  const db = getSupabaseAdmin();
  if (!db || !job.storageUrl) return null;
  const { data, error } = await db.from("videos").upsert({
    user_id: userId,
    render_job_id: job.id,
    project_id: job.projectId ?? null,
    provider: job.provider,
    model: job.model,
    prompt: job.prompt,
    duration: plan?.duration ?? null,
    aspect_ratio: plan?.aspectRatio ?? null,
    resolution: plan?.resolution ?? null,
    audio: plan?.audio ?? null,
    source_url: job.sourceUrl ?? null,
    storage_url: job.storageUrl,
  }, { onConflict: "render_job_id" }).select().single();
  if (error) throw error;
  return data;
}

export async function recordAsset(
  userId: string,
  asset: { key: string; url: string | null; size?: number; contentType?: string },
  originalName?: string,
  role?: ImageRole,
) {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const row = {
    user_id: userId,
    object_key: asset.key,
    public_url: asset.url,
    original_name: originalName ?? null,
    content_type: asset.contentType ?? null,
    size_bytes: asset.size ?? null,
    role: role ?? null,
  };
  let result = await db.from("assets").insert(row).select().single();

  // Backward-compatible until migration 003 is applied.
  if (result.error && String(result.error.message || "").includes("role")) {
    const { role: _role, ...legacyRow } = row;
    result = await db.from("assets").insert(legacyRow).select().single();
  }

  if (result.error) throw result.error;
  return result.data;
}

export async function listProjects(userId: string, limit = 30) {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db.from("projects").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listVideos(userId: string, limit = 30) {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db.from("videos").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listAssets(userId: string, limit = 50) {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db.from("assets").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}
