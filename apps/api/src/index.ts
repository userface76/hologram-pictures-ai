import "dotenv/config";
import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/api.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();
const port = Number(process.env.PORT || 8080);
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "45mb" }));
app.get("/health", (_req, res) => res.json({ ok: true, service: "hologram-api", version: "0.4.0", assistant: "HOLO", auth: "supabase", time: new Date().toISOString() }));
app.use("/api", requireAuth, apiRouter);
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(400).json({ error: err?.message || "unknown_error" });
});
app.listen(port, "0.0.0.0", () => console.log(`HOLOGRAM API listening on :${port}`));
