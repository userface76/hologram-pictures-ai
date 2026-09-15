import "dotenv/config";
import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/api.js";
import { directorRouter } from "./routes/director.js";
import { paymentsRouter } from "./routes/payments.js";
import { publicShowcaseRouter, showcaseAdminRouter } from "./routes/showcase.js";
import { tossWebhookRouter } from "./routes/tossWebhook.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();
const port = Number(process.env.PORT || 8080);
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "45mb" }));
app.get("/health", (_req, res) => res.json({ ok: true, service: "hologram-api", version: "0.7.0", assistant: "HOLO", auth: "supabase", time: new Date().toISOString() }));

// Public showcase is visible on the landing page without a member session.
app.use(publicShowcaseRouter);

// Toss webhook must be reachable without a member session. Payment state is re-verified server-to-server.
app.use("/webhooks", tossWebhookRouter);

// Member billing/payment and showcase administration remain protected by Supabase auth.
app.use("/api", requireAuth, directorRouter, paymentsRouter, showcaseAdminRouter, apiRouter);
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(400).json({ error: err?.message || "unknown_error", code: err?.code });
});
app.listen(port, "0.0.0.0", () => console.log(`HOLOGRAM API listening on :${port}`));
