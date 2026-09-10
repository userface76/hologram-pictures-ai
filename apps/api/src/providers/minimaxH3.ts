import crypto from "node:crypto";
import type { VideoProvider } from "./types.js";
import type { RenderJob, VideoIntent } from "../core/types.js";

function newJob(plan: VideoIntent): RenderJob {
  return {
    id: crypto.randomUUID(), provider: "minimax", model: "minimax-h3",
    status: "queued", progress: 5, createdAt: new Date().toISOString(), prompt: plan.refinedPrompt
  };
}

export const minimaxH3Provider: VideoProvider = {
  id: "minimax-h3",
  displayName: "MiniMax H3",
  async create(plan) {
    const job = newJob(plan);
    const demo = (process.env.DEMO_VIDEO_MODE || "true").toLowerCase() === "true";
    const token = process.env.MINIMAX_API_KEY;
    if (demo || !token) return { ...job, status: "processing", progress: 18, providerTaskId: `demo_${job.id}` };

    const base = process.env.MINIMAX_API_BASE || "https://api.minimax.io";
    const path = process.env.MINIMAX_H3_CREATE_PATH || "/video-generation-v2-create";

    // MiniMax H3 API evolves quickly. Keep provider-specific payload isolated here.
    // Adjust only this adapter if the official field names change.
    const payload = {
      model: process.env.MINIMAX_H3_MODEL || "H3",
      prompt: plan.refinedPrompt,
      duration: plan.duration,
      aspect_ratio: plan.aspectRatio,
      resolution: plan.resolution,
      audio: plan.audio
    };

    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json() as Record<string, any>;
    if (!res.ok) throw new Error(`MiniMax create failed (${res.status}): ${JSON.stringify(data)}`);
    const taskId = data.task_id ?? data.taskId ?? data.id ?? data.data?.task_id;
    return { ...job, status: "processing", progress: 20, providerTaskId: String(taskId || "unknown") };
  }
};
