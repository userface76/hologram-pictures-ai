import crypto from "node:crypto";
import type { VideoProvider } from "./types.js";
import type { RenderJob, VideoIntent } from "../core/types.js";

type HiggsfieldResponse = {
  status?: string;
  request_id?: string;
  status_url?: string;
  cancel_url?: string;
  video?: { url?: string } | string;
  output?: any;
  error?: any;
  message?: string;
};

function credentials() {
  return (
    process.env.HIGGSFIELD_API_KEY ||
    process.env.HF_CREDENTIALS ||
    process.env.HF_KEY ||
    ""
  ).trim();
}

function baseUrl() {
  return (process.env.HIGGSFIELD_API_BASE || "https://api.higgsfield.ai").replace(/\/$/, "");
}

function normalizeResolution(_value: string) {
  // Seedance 2.5 currently exposes 480p and 720p through Higgsfield.
  return "720p";
}

function normalizeRatio(value: string) {
  const allowed = new Set(["16:9", "4:3", "1:1", "3:4", "9:16", "21:9"]);
  return allowed.has(value) ? value : "16:9";
}

function normalizeDuration(value: number) {
  return Math.max(4, Math.min(30, Math.round(value || 5)));
}

function statusToJobStatus(value?: string): RenderJob["status"] {
  const status = String(value || "").toLowerCase();
  if (status === "completed" || status === "succeeded" || status === "success") return "completed";
  if (status === "failed" || status === "nsfw" || status === "cancelled" || status === "canceled") return "failed";
  if (status === "queued" || status === "pending") return "queued";
  return "processing";
}

function progressFor(value?: string) {
  const status = String(value || "").toLowerCase();
  if (status === "queued" || status === "pending") return 15;
  if (status === "in_progress" || status === "processing" || status === "running") return 60;
  if (status === "completed" || status === "succeeded" || status === "success") return 100;
  return 0;
}

function videoUrl(data: HiggsfieldResponse) {
  if (typeof data.video === "string") return data.video;
  if (data.video?.url) return data.video.url;
  if (data.output?.video?.url) return data.output.video.url;
  if (typeof data.output?.video === "string") return data.output.video;
  if (data.output?.url) return data.output.url;
  return undefined;
}

function errorMessage(status: number, data: HiggsfieldResponse) {
  const message =
    data?.error?.message ||
    data?.error ||
    data?.message ||
    JSON.stringify(data);

  if (status === 401 || status === 403) {
    return "Higgsfield API 인증에 실패했습니다. Railway의 HIGGSFIELD_API_KEY 값을 확인해 주세요.";
  }
  if (status === 402 || String(message).toLowerCase().includes("balance")) {
    return "Higgsfield API 잔액이 부족합니다. Higgsfield Billing에서 잔액을 충전해 주세요.";
  }
  if (status === 429) {
    return "Higgsfield API 동시 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.";
  }
  return `Higgsfield create failed (${status}): ${String(message)}`;
}

function buildRequest(plan: VideoIntent) {
  const first =
    plan.firstFrameImageUrl ||
    (plan.sourceImageRole === "first_frame" ? plan.sourceImageUrl : undefined);
  const last =
    plan.lastFrameImageUrl ||
    (plan.sourceImageRole === "last_frame" ? plan.sourceImageUrl : undefined);
  const reference =
    plan.referenceImageUrl ||
    (plan.sourceImageRole === "reference_image" ? plan.sourceImageUrl : undefined);

  const common = {
    prompt: plan.refinedPrompt,
    duration: normalizeDuration(plan.duration),
    resolution: normalizeResolution(plan.resolution),
    output_format: "mp4",
    generate_audio: Boolean(plan.audio),
  };

  // START/END frames have the strongest continuity semantics, so they take precedence.
  if (first) {
    return {
      endpoint: process.env.HIGGSFIELD_SEEDANCE_IMAGE_PATH || "/bytedance/seedance-2.5/image-to-video",
      body: {
        ...common,
        image_url: first,
        ...(last ? { end_image_url: last } : {}),
      },
    };
  }

  // A reference image, or an END-only image, is treated as reference guidance.
  if (reference || last) {
    const imageUrls = [reference, last].filter(Boolean) as string[];
    return {
      endpoint: process.env.HIGGSFIELD_SEEDANCE_REFERENCE_PATH || "/bytedance/seedance-2.5/reference-to-video",
      body: {
        ...common,
        image_urls: imageUrls,
        aspect_ratio: normalizeRatio(plan.aspectRatio),
      },
    };
  }

  return {
    endpoint: process.env.HIGGSFIELD_SEEDANCE_TEXT_PATH || "/bytedance/seedance-2.5/text-to-video",
    body: {
      ...common,
      aspect_ratio: normalizeRatio(plan.aspectRatio),
    },
  };
}

function newJob(plan: VideoIntent): RenderJob {
  return {
    id: crypto.randomUUID(),
    provider: "higgsfield",
    model: "higgsfield-seedance-2.5",
    status: "queued",
    progress: 5,
    createdAt: new Date().toISOString(),
    prompt: plan.refinedPrompt,
  };
}

export const higgsfieldSeedance25Provider: VideoProvider = {
  id: "higgsfield-seedance-2.5",
  displayName: "Higgsfield · Seedance 2.5",

  async create(plan) {
    const job = newJob(plan);
    const key = credentials();
    if (!key) throw new Error("HIGGSFIELD_API_KEY is not configured");

    const request = buildRequest(plan);
    const res = await fetch(`${baseUrl()}${request.endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${key}`,
      },
      body: JSON.stringify(request.body),
    });

    const data = (await res.json()) as HiggsfieldResponse;
    if (!res.ok) throw new Error(errorMessage(res.status, data));

    const requestId = data.request_id;
    if (!requestId) {
      throw new Error(`Higgsfield did not return request_id: ${JSON.stringify(data)}`);
    }

    const mappedStatus = statusToJobStatus(data.status);
    const sourceUrl = videoUrl(data);
    return {
      ...job,
      status: mappedStatus,
      progress: Math.max(job.progress, progressFor(data.status)),
      providerTaskId: String(requestId),
      ...(sourceUrl ? { sourceUrl, outputUrl: sourceUrl } : {}),
      ...(mappedStatus === "failed"
        ? { error: String(data?.error?.message || data?.error || data?.message || data.status || "Higgsfield generation failed") }
        : {}),
      updatedAt: new Date().toISOString(),
    };
  },

  async status(job) {
    const key = credentials();
    if (!key) throw new Error("HIGGSFIELD_API_KEY is not configured");
    if (!job.providerTaskId) return job;

    const res = await fetch(
      `${baseUrl()}/requests/${encodeURIComponent(job.providerTaskId)}/status`,
      {
        headers: {
          Authorization: `Key ${key}`,
        },
      },
    );

    const data = (await res.json()) as HiggsfieldResponse;
    if (!res.ok) throw new Error(errorMessage(res.status, data));

    const mappedStatus = statusToJobStatus(data.status);
    const sourceUrl = videoUrl(data);

    if (mappedStatus === "completed") {
      if (!sourceUrl) {
        return {
          ...job,
          status: "processing",
          progress: Math.max(job.progress, 90),
          updatedAt: new Date().toISOString(),
        };
      }
      return {
        ...job,
        status: "completed",
        progress: 100,
        sourceUrl,
        outputUrl: sourceUrl,
        updatedAt: new Date().toISOString(),
      };
    }

    if (mappedStatus === "failed") {
      return {
        ...job,
        status: "failed",
        progress: 0,
        error: String(data?.error?.message || data?.error || data?.message || data.status || "Higgsfield generation failed"),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      ...job,
      status: mappedStatus === "queued" ? "queued" : "processing",
      progress: Math.max(job.progress, progressFor(data.status)),
      updatedAt: new Date().toISOString(),
    };
  },
};
