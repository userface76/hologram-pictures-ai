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

function normalizeDuration(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 8;
  return Math.max(4, Math.min(15, Math.round(parsed)));
}

function sanitizePromptForMiniMax(text: string) {
  let prompt = String(text || "");

  const replacements: Array<[RegExp, string]> = [
    [/\bIron\s*Man(?:-inspired)?\b/gi, "red-and-gold futuristic armored hero"],
    [/\bWonder\s*Woman(?:-inspired)?\b/gi, "golden-bracer mythic warrior heroine"],
    [/\bThor(?:-inspired)?\b/gi, "mythic lightning hero with a silver hammer"],
    [/\bCaptain\s*America(?:-inspired)?\b/gi, "patriotic shield-bearing hero"],
    [/\bSpider-?Man(?:-inspired)?\b/gi, "agile web-themed masked hero"],
    [/\bBatman(?:-inspired)?\b/gi, "dark caped vigilante archetype"],
    [/\bSuperman(?:-inspired)?\b/gi, "bright caped flying hero archetype"],
    [/\uC544\uC774\uC5B8\\s*\uB9E8(?:\\s*\uC2A4\uD0C0\uC77C)?/gi, "\uBD89\uC740\uC0C9\uACFC \uAE08\uC0C9\uC758 \uBBF8\uB798\uD615 \uAE08\uC18D \uAC11\uC637 \uC601\uC6C5"],
    [/\uC6D0\uB354\\s*\uC6B0\uBA3C(?:\\s*\uC2A4\uD0C0\uC77C)?/gi, "\uD669\uAE08 \uD314 \uBCF4\uD638\uAD6C\uB97C \uCC29\uC6A9\uD55C \uC2E0\uD654\uC801 \uC804\uC0AC \uC601\uC6C5"],
    [/\uD1A0\uB974(?:\\s*\uC2A4\uD0C0\uC77C)?/gi, "\uC740\uBE5B \uD574\uBA38\uC640 \uBC88\uAC1C\uB97C \uC0AC\uC6A9\uD558\uB294 \uC2E0\uD654\uC801 \uC601\uC6C5"],
  ];

  for (const [pattern, replacement] of replacements) prompt = prompt.replace(pattern, replacement);

  const mentionsMinor = /\b(child|children|kid|kids|boy|girl|minor|teen|teenager)\b/i.test(prompt);
  if (mentionsMinor) {
    prompt = prompt
      .replace(/\battacks?\s+once\b/gi, "performs one non-contact action beat")
      .replace(/\battacks?\b/gi, "moves toward")
      .replace(/\bcounterattacks?\b/gi, "responds with a defensive action")
      .replace(/\bcombat\s+space\b/gi, "cinematic training space")
      .replace(/\bcombat\b/gi, "non-contact superhero training")
      .replace(/\bfight(?:ing)?\b/gi, "playful action choreography")
      .replace(/\bstrikes?\b/gi, "performs a dramatic gesture")
      .replace(/\bhits?\b/gi, "passes near")
      .replace(/\bimpact\b/gi, "energy interaction");
    prompt += "\nKeep all action family-friendly, clearly staged, non-contact, non-graphic, and playful. No injury, pain, or physical harm.";
  }

  return prompt;
}


function mapProgress(status: string) {
  if (status === "queued") return 15;
  if (status === "running") return 55;
  if (status === "succeeded") return 100;
  return 0;
}

function minimaxErrorMessage(status: number, data: Record<string, any>) {
  const type = String(data?.error?.type || data?.type || "");
  const message = String(data?.error?.message || data?.message || "");
  if (status === 402 || type.includes("insufficient_balance") || message.includes("insufficient balance") || message.includes("1008")) {
    return "HOLO AI 영상 생성 잔액이 부족합니다. 충전 후 다시 시도해 주세요.";
  }
  return `MiniMax H3 create failed (${status}): ${message || JSON.stringify(data)}`;
}

function buildContent(plan: VideoIntent) {
  const content: Array<Record<string, any>> = [
    { type: "text", text: sanitizePromptForMiniMax(plan.refinedPrompt) },
  ];

  const first = plan.firstFrameImageUrl || (plan.sourceImageRole === "first_frame" ? plan.sourceImageUrl : undefined);
  const last = plan.lastFrameImageUrl || (plan.sourceImageRole === "last_frame" ? plan.sourceImageUrl : undefined);
  const reference = plan.referenceImageUrl || (plan.sourceImageRole === "reference_image" ? plan.sourceImageUrl : undefined);

  // MiniMax H3 V2 does not allow reference media to be mixed with first/last frame mode.
  // When frame controls are present, HOLO has already used the reference image during prompt refinement,
  // and only the start/end frame controls are sent to H3.
  if (first || last) {
    if (first) content.push({ type: "image_url", image_url: { url: first }, role: "first_frame" });
    if (last) content.push({ type: "image_url", image_url: { url: last }, role: "last_frame" });
    return { content, frameMode: true };
  }

  if (reference) {
    content.push({ type: "image_url", image_url: { url: reference }, role: "reference_image" });
  }
  return { content, frameMode: false };
}

export const minimaxH3Provider: VideoProvider = {
  id: "minimax-h3",
  displayName: "MiniMax H3",

  async create(plan) {
    const job = newJob(plan);
    const token = process.env.MINIMAX_API_KEY;
    const demo = (process.env.DEMO_VIDEO_MODE || (token ? "false" : "true")).toLowerCase() === "true";
    if (demo || !token) {
      return { ...job, status: "processing", progress: 18, providerTaskId: `demo_${job.id}` };
    }

    const { content, frameMode } = buildContent(plan);
    const payload = {
      model: process.env.MINIMAX_H3_MODEL || "MiniMax-H3",
      content,
      resolution: normalizeResolution(plan.resolution),
      duration: normalizeDuration(plan.duration),
      ratio: frameMode ? "adaptive" : normalizeRatio(plan.aspectRatio),
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
    if (!res.ok) throw new Error(minimaxErrorMessage(res.status, data));
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
