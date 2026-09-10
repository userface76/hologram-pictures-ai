import { Router } from "express";
import { z } from "zod";
import { interpretWithAstra } from "../core/astra.js";
import { getVideoProvider, listVideoProviders } from "../services/modelRouter.js";
import { jobStore } from "../services/jobStore.js";
import { createProject, createVideoRecord, getRenderJob, listProjects, listVideos, upsertRenderJob } from "../services/database.js";
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

async function persistJob(job: any) {
  try { await upsertRenderJob(job); }
  catch (error) { console.warn("Supabase render_jobs persistence skipped:", error); }
}

async function createAndPersistProject(plan: any) {
  try { return await createProject(plan); }
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

apiRouter.get("/system/status", (_req, res) => res.json({
  ok: true,
  api: true,
  assistant: "HOLO",
  openai: Boolean(process.env.OPENAI_API_KEY),
  minimax: Boolean(process.env.MINIMAX_API_KEY),
  demoVideoMode: (process.env.DEMO_VIDEO_MODE || "true").toLowerCase() === "true",
  supabase: isSupabaseConfigured(),
  r2: isR2Configured(),
}));

apiRouter.post("/assets/upload", async (req, res, next) => {
  try {
    const input = uploadSchema.parse(req.body);
    const asset = await uploadImageDataUrl(input.dataUrl, input.name);
    res.status(201).json({ asset });
  } catch (e) { next(e); }
});

apiRouter.get("/models", (_req, res) => res.json({ models: listVideoProviders() }));
apiRouter.get("/jobs", (_req, res) => res.json({ jobs: jobStore.list() }));
apiRouter.get("/projects", async (_req, res, next) => {
  try { res.json({ projects: await listProjects() }); } catch (e) { next(e); }
});
apiRouter.get("/videos", async (_req, res, next) => {
  try { res.json({ videos: await listVideos() }); } catch (e) { next(e); }
});

apiRouter.get("/jobs/:id", async (req, res, next) => {
  try {
    let job = jobStore.get(req.params.id);
    if (!job && isSupabaseConfigured()) {
      try { job = (await getRenderJob(req.params.id)) ?? undefined; }
      catch (error) { console.warn("Supabase job recovery skipped:", error); }
    }
    if (!job) return res.status(404).json({ error: "job_not_found" });

    if (job.status === "processing" && job.providerTaskId) {
      const provider = getVideoProvider(job.model);
      if (provider.status) job = await provider.status(job);
    }

    if (job.status === "completed" && job.sourceUrl && !job.storageUrl && isR2Configured()) {
      try {
        const archived = await archiveRemoteVideo(job.sourceUrl, job.id);
        if (archived) {
          const stored = archived.url || `r2://${process.env.R2_BUCKET}/${archived.key}`;
          job = { ...job, storageUrl: stored, outputUrl: archived.url || job.sourceUrl };
        }
      } catch (error) {
        console.warn("R2 archive failed; keeping MiniMax source URL:", error);
      }
    }

    jobStore.set(job);
    await persistJob(job);
    if (job.status === "completed" && job.storageUrl) {
      try { await createVideoRecord(job); }
      catch (error) { console.warn("Supabase video persistence skipped:", error); }
    }

    res.json({ job });
  } catch (e) { next(e); }
});

apiRouter.post("/command", async (req, res, next) => {
  try {
    const input = commandSchema.parse(req.body);
    const interpreted = await interpretWithAstra(input.command);
    const plan = withMedia(interpreted.plan, input);
    if (!input.autoRender) return res.json({ ...interpreted, plan });

    const project = await createAndPersistProject(plan);
    const provider = getVideoProvider(plan.model);
    let job = await provider.create(plan);
    if (project?.id) job = { ...job, projectId: project.id };
    jobStore.set(job);
    await persistJob(job);
    res.json({ ...interpreted, plan, project, job });
  } catch (e) { next(e); }
});

apiRouter.post("/render", async (req, res, next) => {
  try {
    const input = commandSchema.parse({ ...req.body, autoRender: true });
    const interpreted = await interpretWithAstra(input.command);
    const plan = withMedia(interpreted.plan, input);
    const project = await createAndPersistProject(plan);
    const provider = getVideoProvider(plan.model);
    let job = await provider.create(plan);
    if (project?.id) job = { ...job, projectId: project.id };
    jobStore.set(job);
    await persistJob(job);
    res.status(202).json({ ...interpreted, plan, project, job });
  } catch (e) { next(e); }
});
