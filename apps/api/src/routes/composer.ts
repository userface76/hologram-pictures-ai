import { Router } from "express";
import { z } from "zod";
import type { ComposerJob, ComposerSpec } from "../composer/types.js";
import { createComposerJob, getComposerJob, isHoloComposerConfigured } from "../services/holoComposer.js";

export const composerRouter = Router();

const clipSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  start: z.number().nonnegative().optional(),
  end: z.number().positive().optional(),
  trimStart: z.number().nonnegative().optional(),
  trimEnd: z.number().nonnegative().optional(),
  volume: z.number().min(0).max(2).optional(),
});

const overlaySchema = z.object({
  type: z.enum(["text", "image", "logo"]),
  text: z.string().optional(),
  url: z.string().url().optional(),
  start: z.number().nonnegative(),
  end: z.number().positive(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  style: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

const requestSchema = z.object({
  title: z.string().min(1).max(200),
  aspectRatio: z.string().default("16:9"),
  resolution: z.string().default("1080p"),
  fps: z.number().int().min(12).max(60).default(30),
  duration: z.number().positive().max(600).optional(),
  clips: z.array(clipSchema).min(1),
  narration: z.object({
    url: z.string().url().optional(),
    text: z.string().max(20000).optional(),
    start: z.number().nonnegative().optional(),
    end: z.number().positive().optional(),
    volume: z.number().min(0).max(2).optional(),
  }).optional(),
  musicUrl: z.string().url().optional(),
  musicVolume: z.number().min(0).max(2).optional().default(0.22),
  overlays: z.array(overlaySchema).optional().default([]),
  metadata: z.record(z.unknown()).optional(),
});

const jobs = new Map<string, ComposerJob>();

function toSpec(input: z.infer<typeof requestSchema>): ComposerSpec {
  const transitions = input.clips.slice(0, -1).map((_clip, index) => ({
    fromClip: index,
    toClip: index + 1,
    type: "crossfade" as const,
    duration: 0.35,
  }));

  return {
    title: input.title,
    aspectRatio: input.aspectRatio,
    resolution: input.resolution,
    fps: input.fps,
    duration: input.duration,
    clips: input.clips,
    narration: input.narration,
    musicUrl: input.musicUrl,
    musicVolume: input.musicVolume,
    overlays: input.overlays,
    transitions,
    metadata: {
      ...(input.metadata || {}),
      composer: "HOLO Composer",
      renderer: "HyperFrames-compatible",
    },
  };
}

composerRouter.get("/composer/status", (_req, res) => res.json({
  ok: true,
  composer: "HOLO Composer",
  configured: isHoloComposerConfigured(),
  renderer: "hyperframes-compatible",
}));

composerRouter.post("/composer/plan", (req, res, next) => {
  try {
    const input = requestSchema.parse(req.body);
    res.json({ spec: toSpec(input), configured: isHoloComposerConfigured() });
  } catch (error) { next(error); }
});

composerRouter.post("/composer/render", async (req, res, next) => {
  try {
    const input = requestSchema.parse(req.body);
    const spec = toSpec(input);
    const job = await createComposerJob(spec);
    jobs.set(job.id, job);
    res.status(202).json({ job });
  } catch (error) { next(error); }
});

composerRouter.get("/composer/jobs/:id", async (req, res, next) => {
  try {
    const current = jobs.get(req.params.id);
    if (!current) return res.status(404).json({ error: "composer_job_not_found" });
    const job = await getComposerJob(current);
    jobs.set(job.id, job);
    res.json({ job });
  } catch (error) { next(error); }
});
