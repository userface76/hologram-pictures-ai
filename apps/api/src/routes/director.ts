import { Router } from "express";
import { z } from "zod";
import { generateDirectorRecommendationsV2 } from "../core/holoDirectorV2.js";

export const directorRouter = Router();

const imagesSchema = z.object({
  firstFrameUrl: z.string().url().optional(),
  referenceImageUrl: z.string().url().optional(),
  lastFrameUrl: z.string().url().optional(),
}).optional();

const directorSchema = z.object({
  command: z.string().min(1).max(12000),
  images: imagesSchema,
});

function withDefaultDuration(command: string) {
  return /(\d{1,2})\s*초/.test(command)
    ? command
    : `${command}\n\n[HOLO DEFAULT DURATION: 10 seconds. Apply only because the user did not specify a duration.]`;
}

directorRouter.post("/director", async (req, res, next) => {
  try {
    const input = directorSchema.parse(req.body);
    const result = await generateDirectorRecommendationsV2(withDefaultDuration(input.command), input.images);
    result.plan.duration = /(\d{1,2})\s*초/.test(input.command) ? result.plan.duration : 10;
    result.analysis.duration = /(\d{1,2})\s*초/.test(input.command) ? result.analysis.duration : 10;
    res.json(result);
  } catch (error) {
    next(error);
  }
});
