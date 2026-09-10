import { Router } from "express";
import { z } from "zod";
import { interpretWithAstra } from "../core/astra.js";
import { getVideoProvider, listVideoProviders } from "../services/modelRouter.js";
import { jobStore } from "../services/jobStore.js";

export const apiRouter = Router();
const commandSchema = z.object({ command: z.string().min(1).max(12000), autoRender: z.boolean().optional().default(false) });

apiRouter.get("/models", (_req, res) => res.json({ models: listVideoProviders() }));
apiRouter.get("/jobs", (_req, res) => res.json({ jobs: jobStore.list() }));
apiRouter.get("/jobs/:id", (req, res) => {
  const job = jobStore.get(req.params.id);
  if (!job) return res.status(404).json({ error: "job_not_found" });
  res.json({ job });
});
apiRouter.post("/command", async (req, res, next) => {
  try {
    const input = commandSchema.parse(req.body);
    const interpreted = await interpretWithAstra(input.command);
    if (!input.autoRender) return res.json(interpreted);
    const provider = getVideoProvider(interpreted.plan.model);
    const job = jobStore.set(await provider.create(interpreted.plan));
    res.json({ ...interpreted, job });
  } catch (e) { next(e); }
});
apiRouter.post("/render", async (req, res, next) => {
  try {
    const input = commandSchema.parse({ command: req.body.command, autoRender: true });
    const interpreted = await interpretWithAstra(input.command);
    const provider = getVideoProvider(interpreted.plan.model);
    const job = jobStore.set(await provider.create(interpreted.plan));
    res.status(202).json({ ...interpreted, job });
  } catch (e) { next(e); }
});
