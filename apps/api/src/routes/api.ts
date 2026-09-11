import { Router } from "express";
import { z } from "zod";
import { interpretWithAstra } from "../core/astra.js";
import { getVideoProvider, listVideoProviders } from "../services/modelRouter.js";
import { jobStore } from "../services/jobStore.js";
import {
  createProject,
  createVideoRecord,
  ensureUserAccount,
  getAccountSummary,
  getRenderJob,
  listAssets,
  listProjects,
  listVideos,
  recordAsset,
  upsertRenderJob,
} from "../services/database.js";
import { archiveRemoteVideo, isR2Configured, uploadImageDataUrl } from "../services/r2Storage.js";
import { isSupabaseConfigured } from "../lib/supabase.js";

export const apiRouter = Router();

const imageRoleSchema = z.enum(["first_frame", "last_frame", "reference_image"]);
const commandSchema = z.object({
  command: z.string().min(1).max(12000),
  autoRender: z.boolean().optional().default(false),
  imageUrl: z.string().url().optional(),
  imageRole: imageRoleSchema.optional().default("first_frame"),
});
const uploadSchema = z.object({
  name: z.string().min(1).max(200).optional().default("image"),
  dataUrl: z.string().min(20),
});

function userIdOf(req: any) {
  const userId = req.authUser?.id;
  if (!userId) throw new Error("Authenticated user id is missing");
  return String(userId);
}

async function persistJob(userId: string, job: any) {
  try { await upsertRenderJob(userId, job); }
  catch (error) { console.warn("Supabase render_jobs persistence skipped:", error); }
}

async function createAndPersistProject(userId: string, plan: any) {
  try { return await createProject(userId, plan); }
  catch (error) { console.warn("Supabase project persistence skipped:", error); return null; }
}

function withMedia(plan: any, input: z.infer<typeof commandSchema>) {
  if (!input.imageUrl) return plan;
  return {
    ...plan,
    sourceImageUrl: input.imageUrl,
    sourceImageRole: input.imageRole,
    aspectRatio: input.imageRole === "first_frame" || input.imageRole === "last_frame" ? "adaptive" : plan.aspectRatio,
  };
}

apiRouter.get("/system/status", (req, res) => res.json({
  ok: true,
  api: true,
  assistant: "HOLO",
  userId: userIdOf(req),
  openai: Boolean(process.env.OPENAI_API_KEY),
  minimax: Boolean(process.env.MINIMAX_API_KEY),
  demoVideoMode: (process.env.DEMO_VIDEO_MODE || "true").toLowerCase() === "true",
  supabase: isSupabaseConfigured(),
  r2: isR2Configured(),
}));

apiRouter.get("/account", async (req, res, next) => {
  try {
    const userId = userIdOf(req);
    await ensureUserAccount(userId, req.authUser?.email);
    res.json({ account: await getAccountSummary(userId) });
  } catch (e) { next(e); }
});

apiRouter.post("/assets/upload", async (req, res, next) => {
  try {
    const userId = userIdOf(req);
    const input = uploadSchema.parse(req.body);
    const asset = await uploadImageDataUrl(userId, input.dataUrl, input.name);
    try { await recordAsset(userId, asset, input.name); }
    catch (error) { console.warn("Supabase asset persistence skipped:", error); }
    res.status(201).json({ asset });
  } catch (e) { next(e); }
});

apiRouter.get("/assets", async (req, res, next) => {
  try { res.json({ assets: await listAssets(userIdOf(req)) }); }
  catch (e) { next(e); }
});

apiRouter.get("/models", (_req, res) => res.json({ models: listVideoProviders() }));
apiRouter.get("/jobs", (req, res) => res.json({ jobs: jobStore.list(userIdOf(req)) }));
apiRouter.get("/projects", async (req, res, next) => {
  try { res.json({ projects: await listProjects(userIdOf(req)) }); }
  catch (e) { next(e); }
});
apiRouter.get("/videos", async (req, res, next) => {
  try { res.json({ videos: await listVideos(userIdOf(req)) }); }
  catch (e) { next(e); }
});

apiRouter.get("/jobs/:id", async (req, res, next) => {
  try {
    const userId = userIdOf(req);
    let job = jobStore.get(req.params.id, userId);
    if (!job && isSupabaseConfigured()) {
      try { job = (await getRenderJob(userId, req.params.id)) ?? undefined; }
      catch (error) { console.warn("Supabase job recovery skipped:", error); }
    }
    if (!job) return res.status(404).json({ error: "job_not_found" });

    if (job.status === "processing" && job.providerTaskId) {
      const provider = getVideoProvider(job.model);
      if (provider.status) job = await provider.status(job);
    }

    if (job.status === "completed" && job.sourceUrl && !job.storageUrl && isR2Configured()) {
      try {
        const archived = await archiveRemoteVideo(userId, job.sourceUrl, job.id);
        if (archived) {
          const stored = archived.url || `r2://${process.env.R2_BUCKET}/${archived.key}`;
          job = { ...job, userId, storageUrl: stored, outputUrl: archived.url || job.sourceUrl };
        }
      } catch (error) {
        console.warn("R2 archive failed; keeping MiniMax source URL:", error);
      }
    }

    job = { ...job, userId };
    jobStore.set(job);
    await persistJob(userId, job);
    if (job.status === "completed" && job.storageUrl) {
      try { await createVideoRecord(userId, job); }
      catch (error) { console.warn("Supabase video persistence skipped:", error); }
    }

    res.json({ job });
  } catch (e) { next(e); }
});

apiRouter.post("/command", async (req, res, next) => {
  try {
    const userId = userIdOf(req);
    const input = commandSchema.parse(req.body);
    const interpreted = await interpretWithAstra(input.command);
    const plan = withMedia(interpreted.plan, input);
    if (!input.autoRender) return res.json({ ...interpreted, plan });

    const project = await createAndPersistProject(userId, plan);
    const provider = getVideoProvider(plan.model);
    let job = await provider.create(plan);
    job = { ...job, userId, ...(project?.id ? { projectId: project.id } : {}) };
    jobStore.set(job);
    await persistJob(userId, job);
    res.json({ ...interpreted, plan, project, job });
  } catch (e) { next(e); }
});

apiRouter.post("/render", async (req, res, next) => {
  try {
    const userId = userIdOf(req);
    const input = commandSchema.parse({ ...req.body, autoRender: true });
    const interpreted = await interpretWithAstra(input.command);
    const plan = withMedia(interpreted.plan, input);
    const project = await createAndPersistProject(userId, plan);
    const provider = getVideoProvider(plan.model);
    let job = await provider.create(plan);
    job = { ...job, userId, ...(project?.id ? { projectId: project.id } : {}) };
    jobStore.set(job);
    await persistJob(userId, job);
    res.status(202).json({ ...interpreted, plan, project, job });
  } catch (e) { next(e); }
});
