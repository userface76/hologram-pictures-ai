import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { getAccountSummary } from "../services/database.js";
import {
  readShowcaseManifest,
  uploadShowcaseVideoDataUrl,
  writeShowcaseManifest,
  type ShowcaseItem,
} from "../services/r2Storage.js";

export const publicShowcaseRouter = Router();
export const showcaseAdminRouter = Router();

const categorySchema = z.enum([
  "brand",
  "cinematic",
  "shortform",
  "food",
  "character",
  "fantasy",
  "fashion",
  "art",
]);

const uploadSchema = z.object({
  name: z.string().min(1).max(220),
  title: z.string().min(1).max(160),
  category: categorySchema,
  aspectRatio: z.string().max(20).optional(),
  dataUrl: z.string().min(32),
});

function userIdOf(req: any) {
  const userId = req.authUser?.id;
  if (!userId) throw new Error("Authenticated user id is missing");
  return String(userId);
}

async function assertAdmin(req: any, res: any) {
  const userId = userIdOf(req);
  const account = await getAccountSummary(userId);
  if (account?.profile?.role !== "admin") {
    res.status(403).json({ error: "admin_required" });
    return false;
  }
  return true;
}

publicShowcaseRouter.get("/showcase", async (_req, res, next) => {
  try {
    const items = await readShowcaseManifest();
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

showcaseAdminRouter.post("/showcase/upload", async (req, res, next) => {
  try {
    if (!(await assertAdmin(req, res))) return;
    const input = uploadSchema.parse(req.body);
    const stored = await uploadShowcaseVideoDataUrl(input.dataUrl, input.name);
    const existing = await readShowcaseManifest();
    const item: ShowcaseItem = {
      id: randomUUID(),
      title: input.title,
      category: input.category,
      url: stored.url,
      aspectRatio: input.aspectRatio ?? null,
      fileName: input.name,
      createdAt: new Date().toISOString(),
    };
    await writeShowcaseManifest([item, ...existing].slice(0, 100));
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
});
