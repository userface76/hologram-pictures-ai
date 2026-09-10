import type { RenderJob, VideoIntent } from "../core/types.js";
import { getSupabaseAdmin } from "../lib/supabase.js";

export async function createProject(plan: VideoIntent) {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.from("projects").insert({
    title: plan.title,
    status: "active",
    selected_model: plan.model,
    user_request: plan.userRequest,
    metadata: {
      aspect_ratio: plan.aspectRatio,
      duration: plan.duration,
      resolution: plan.resolution,
      audio: plan.audio,
      style: plan.style ?? null,
      scenes: plan.scenes,
    },
  }).select("id,title,status,created_at").single();
  if (error) throw error;
  return data;
}

export async function upsertRenderJob(job: RenderJob) {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.from("render_jobs").upsert({
    id: job.id,
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

export async function getRenderJob(id: string): Promise<RenderJob | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data, error } = await db.from("render_jobs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
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

export async function createVideoRecord(job: RenderJob, plan?: VideoIntent) {
  const db = getSupabaseAdmin();
  if (!db || !job.storageUrl) return null;
  const { data, error } = await db.from("videos").upsert({
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

export async function listProjects(limit = 30) {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db.from("projects").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listVideos(limit = 30) {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db.from("videos").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}
