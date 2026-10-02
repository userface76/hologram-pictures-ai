import express from "express";
import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderCompositionHtml } from "./composition.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WORK_ROOT = process.env.COMPOSER_WORK_ROOT || "/tmp/holo-composer";
const OUTPUT_ROOT = process.env.COMPOSER_OUTPUT_ROOT || path.join(ROOT, "outputs");
const PORT = Number(process.env.PORT || 8090);
const API_KEY = String(process.env.COMPOSER_API_KEY || "");
const PUBLIC_BASE = String(process.env.COMPOSER_PUBLIC_BASE_URL || "").replace(/\/$/, "");
const HYPERFRAMES_BIN = process.env.HYPERFRAMES_BIN || path.join(ROOT, "node_modules", ".bin", "hyperframes");
const MAX_CONCURRENT = Math.max(1, Number(process.env.COMPOSER_MAX_CONCURRENT || 1));

const jobs = new Map();
const queue = [];
let running = 0;

function auth(req, res, next) {
  if (!API_KEY) return next();
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (token !== API_KEY) return res.status(401).json({ error: "unauthorized" });
  next();
}

function outputUrl(req, id) {
  if (PUBLIC_BASE) return `${PUBLIC_BASE}/outputs/${id}.mp4`;
  return `${req.protocol}://${req.get("host")}/outputs/${id}.mp4`;
}

function publicJob(job) {
  return {
    id: job.id,
    status: job.status,
    progress: job.progress,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    outputUrl: job.outputUrl,
    error: job.error,
  };
}

function runNext() {
  if (running >= MAX_CONCURRENT || queue.length === 0) return;
  const task = queue.shift();
  running += 1;
  task().finally(() => {
    running -= 1;
    runNext();
  });
}

async function runRender(job, req) {
  const workDir = path.join(WORK_ROOT, job.id);
  const outputPath = path.join(OUTPUT_ROOT, `${job.id}.mp4`);
  try {
    job.status = "processing";
    job.progress = 5;
    job.updatedAt = new Date().toISOString();

    await mkdir(workDir, { recursive: true });
    await mkdir(OUTPUT_ROOT, { recursive: true });
    await writeFile(path.join(workDir, "index.html"), renderCompositionHtml(job.spec), "utf8");

    await new Promise((resolve, reject) => {
      const child = spawn(HYPERFRAMES_BIN, [
        "render",
        workDir,
        "--output",
        outputPath,
        "--fps",
        String(job.spec.fps || 30),
        "--quality",
        "standard",
      ], {
        env: {
          ...process.env,
          HYPERFRAMES_BROWSER_PATH: process.env.HYPERFRAMES_BROWSER_PATH || "/usr/bin/chromium",
          PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
        },
      });

      let stderr = "";
      child.stdout.on("data", (chunk) => {
        const text = String(chunk);
        const match = text.match(/(\d{1,3})%/);
        if (match) job.progress = Math.min(95, Math.max(job.progress, Number(match[1])));
      });
      child.stderr.on("data", (chunk) => { stderr += String(chunk); });
      child.on("error", reject);
      child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr || `hyperframes_exit_${code}`)));
    });

    if (!existsSync(outputPath)) throw new Error("render_output_missing");
    job.status = "completed";
    job.progress = 100;
    job.outputUrl = outputUrl(req, job.id);
    job.updatedAt = new Date().toISOString();
  } catch (error) {
    job.status = "failed";
    job.error = String(error?.message || error);
    job.updatedAt = new Date().toISOString();
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

const app = express();
app.set("trust proxy", true);
app.use(express.json({ limit: "2mb" }));
app.use("/outputs", express.static(OUTPUT_ROOT, { immutable: true, maxAge: "1h" }));

app.get("/health", (_req, res) => res.json({
  ok: true,
  service: "holo-composer-renderer",
  renderer: "hyperframes",
  queue: queue.length,
  running,
  maxConcurrent: MAX_CONCURRENT,
}));

app.use(auth);

app.post("/render", (req, res) => {
  const spec = req.body?.spec;
  if (!spec || !Array.isArray(spec.clips) || spec.clips.length < 1) {
    return res.status(400).json({ error: "invalid_composer_spec" });
  }
  if (spec.clips.length > 40) return res.status(400).json({ error: "too_many_clips", max: 40 });

  const id = randomUUID();
  const now = new Date().toISOString();
  const job = { id, spec, status: "queued", progress: 0, createdAt: now, updatedAt: now };
  jobs.set(id, job);
  queue.push(() => runRender(job, req));
  runNext();
  res.status(202).json(publicJob(job));
});

app.get("/jobs/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "job_not_found" });
  res.json(publicJob(job));
});

app.listen(PORT, "0.0.0.0", async () => {
  await mkdir(WORK_ROOT, { recursive: true });
  await mkdir(OUTPUT_ROOT, { recursive: true });
  console.log(`HOLO Composer Renderer listening on :${PORT}`);
});
