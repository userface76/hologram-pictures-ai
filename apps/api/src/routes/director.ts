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

directorRouter.post("/director", async (req, res, next) => {
  try {
    const input = directorSchema.parse(req.body);
    const result = await generateDirectorRecommendationsV2(input.command, input.images);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
