import crypto from "node:crypto";
import type { VideoProvider } from "./types.js";
import type { RenderJob, VideoIntent } from "../core/types.js";

function newJob(plan: VideoIntent): RenderJob {
  return {
    id: crypto.randomUUID(),
    provider: "minimax",
    model: "minimax-h3",
    status: "queued",
    progress: 5,
    createdAt: new Date().toISOString(),
    prompt: plan.refinedPrompt,
  };
}

function baseUrl() {
  return (process.env.MINIMAX_API_BASE || "https://api.minimax.io").replace(/\/$/, "");
}

function normalizeResolution(value: string) {
  return String(value).toUpperCase().includes("2K") ? "2K" : "768P";
}

function normalizeRatio(value: string) {
  const allowed = new Set(["adaptive", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"]);
  return allowed.has(value) ? value : "16:9";
}

function mapProgress(status: string) {
  if (status === "queued") return 15;
  if (status === "running") return 55;
  if (status === "succeeded") return 100;
  return 0;
}

export const minimaxH3Provider: VideoProvider = {
  id: "minimax-h3",
  displayName: "MiniMax H3",

  async create(plan) {
    const job = newJob(plan);
    const demo = (process.env.DEMO_VIDEO_MODE || "true").toLowerCase() === "true";
    const token = process.env.MINIMAX_API_KEY;
    if (demo || !token) {
      return { ...job, status: "processing", progress: 18, providerTaskId: `demo_${job.id}` };
    }

    const content: Array<Record<string, any>> = [
      { type: "text", text: plan.refinedPrompt },
    ];

    if (plan.sourceImageUrl) {
      content.push({
        type: "image_url",
        image_url: { url: plan.sourceImageUrl },
        role: plan.sourceImageRole || "first_frame",
      });
    }

    const isFrameMode = Boolean(plan.sourceImageUrl && (plan.sourceImageRole === "first_frame" || plan.sourceImageRole === "last_frame" || !plan.sourceImageRole));
    const payload = {
      model: process.env.MINIMAX_H3_MODEL || "MiniMax-H3",
      content,
      resolution: normalizeResolution(plan.resolution),
      duration: Math.max(4, Math.min(15, Math.round(plan.duration))),
      ratio: isFrameMode ? "adaptive" : normalizeRatio(plan.aspectRatio),
    };

    const res = await fetch(`${baseUrl()}${process.env.MINIMAX_H3_CREATE_PATH || "/v2/video_generation"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as Record<string, any>;
    if (!res.ok) throw new Error(`MiniMax H3 create failed (${res.status}): ${JSON.stringify(data)}`);
    const taskId = data.task_id;
    if (!taskId) throw new Error(`MiniMax H3 did not return task_id: ${JSON.stringify(data)}`);

    return {
      ...job,
      status: "processing",
      progress: 20,
      providerTaskId: String(taskId),
      updatedAt: new Date().toISOString(),
    };
  },

  async status(job) {
    const token = process.env.MINIMAX_API_KEY;
    if (!job.providerTaskId) return job;
    if (job.providerTaskId.startsWith("demo_")) {
      return { ...job, status: "processing", progress: Math.max(job.progress, 60), updatedAt: new Date().toISOString() };
    }
    if (!token) throw new Error("MINIMAX_API_KEY is not configured");

    const queryBase = process.env.MINIMAX_H3_QUERY_PATH || "/v2/query/video_generation";
    const res = await fetch(`${baseUrl()}${queryBase}/${encodeURIComponent(job.providerTaskId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json() as Record<string, any>;
    if (!res.ok) throw new Error(`MiniMax H3 query failed (${res.status}): ${JSON.stringify(data)}`);

    const task = data.task || {};
    const rawStatus = String(task.status || "").toLowerCase();
    if (rawStatus === "succeeded") {
      const sourceUrl = task.content?.url;
      return {
        ...job,
        status: "completed",
        progress: 100,
        sourceUrl,
        outputUrl: sourceUrl,
        updatedAt: new Date().toISOString(),
      };
    }
    if (rawStatus === "failed" || rawStatus === "cancelled") {
      return {
        ...job,
        status: "failed",
        progress: 0,
        error: task.error?.message || rawStatus,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      ...job,
      status: "processing",
      progress: Math.max(job.progress, mapProgress(rawStatus)),
      updatedAt: new Date().toISOString(),
    };
  },
};
