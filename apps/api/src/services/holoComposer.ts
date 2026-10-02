import type { ComposerJob, ComposerSpec } from "../composer/types.js";

const BASE_URL = String(process.env.HOLO_COMPOSER_URL || "").replace(/\/$/, "");
const API_KEY = String(process.env.HOLO_COMPOSER_API_KEY || "");
const RENDER_PATH = process.env.HOLO_COMPOSER_RENDER_PATH || "/render";
const STATUS_PATH = process.env.HOLO_COMPOSER_STATUS_PATH || "/jobs";

export function isHoloComposerConfigured() {
  return Boolean(BASE_URL);
}

function headers() {
  const value: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) value.Authorization = `Bearer ${API_KEY}`;
  return value;
}

function normalizeStatus(value: unknown): ComposerJob["status"] {
  const status = String(value || "").toLowerCase();
  if (["completed", "complete", "succeeded", "success", "done"].includes(status)) return "completed";
  if (["failed", "error", "cancelled", "canceled"].includes(status)) return "failed";
  if (["processing", "running", "rendering", "in_progress"].includes(status)) return "processing";
  return "queued";
}

function outputUrlOf(data: any) {
  return data?.outputUrl || data?.output_url || data?.videoUrl || data?.video_url || data?.result?.url || data?.result?.video_url;
}

export async function createComposerJob(spec: ComposerSpec): Promise<ComposerJob> {
  if (!isHoloComposerConfigured()) {
    const error = new Error("HOLO Composer is not configured");
    (error as any).statusCode = 503;
    (error as any).code = "composer_not_configured";
    throw error;
  }

  const response = await fetch(`${BASE_URL}${RENDER_PATH}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ spec }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || data?.message || `composer_http_${response.status}`);
    (error as any).statusCode = response.status;
    (error as any).code = "composer_create_failed";
    (error as any).details = data;
    throw error;
  }

  const taskId = String(data?.id || data?.job_id || data?.request_id || data?.task_id || "");
  if (!taskId) {
    const error = new Error("Composer render endpoint did not return a job id");
    (error as any).statusCode = 502;
    (error as any).code = "composer_job_id_missing";
    throw error;
  }

  const now = new Date().toISOString();
  return {
    id: taskId,
    providerTaskId: taskId,
    status: normalizeStatus(data?.status),
    progress: Number(data?.progress || 0),
    createdAt: now,
    updatedAt: now,
    outputUrl: outputUrlOf(data),
    spec,
  };
}

export async function getComposerJob(job: ComposerJob): Promise<ComposerJob> {
  if (!isHoloComposerConfigured()) return job;
  const taskId = job.providerTaskId || job.id;
  const response = await fetch(`${BASE_URL}${STATUS_PATH}/${encodeURIComponent(taskId)}`, {
    headers: headers(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ...job,
      updatedAt: new Date().toISOString(),
      ...(response.status >= 400 && response.status < 500
        ? { status: "failed" as const, error: data?.error || data?.message || `composer_http_${response.status}` }
        : {}),
    };
  }

  return {
    ...job,
    status: normalizeStatus(data?.status),
    progress: Number(data?.progress ?? job.progress ?? 0),
    outputUrl: outputUrlOf(data) || job.outputUrl,
    error: data?.error || undefined,
    updatedAt: new Date().toISOString(),
  };
}
