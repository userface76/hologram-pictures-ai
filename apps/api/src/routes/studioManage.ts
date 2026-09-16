import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Router } from "express";
import { getSupabaseAdmin } from "../lib/supabase.js";

export const studioManageRouter = Router();

function userIdOf(req: any) {
  const userId = req.authUser?.id;
  if (!userId) throw new Error("Authenticated user id is missing");
  return String(userId);
}

function dbOrThrow() {
  const db = getSupabaseAdmin();
  if (!db) {
    const error: any = new Error("studio_database_unavailable");
    error.statusCode = 503;
    throw error;
  }
  return db;
}

function r2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function keyFromStorage(value?: string | null) {
  if (!value) return null;
  if (value.startsWith("r2://")) {
    const withoutScheme = value.slice(5);
    const slash = withoutScheme.indexOf("/");
    return slash >= 0 ? withoutScheme.slice(slash + 1) : null;
  }
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base && value.startsWith(`${base}/`)) return value.slice(base.length + 1);
  return null;
}

async function deleteR2Key(key?: string | null) {
  if (!key) return { removed: false, reason: "no_r2_key" };
  const client = r2Client();
  const bucket = process.env.R2_BUCKET;
  if (!client || !bucket) return { removed: false, reason: "r2_not_configured" };
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  return { removed: true };
}

studioManageRouter.delete("/studio/projects/:id", async (req, res, next) => {
  try {
    const db = dbOrThrow();
    const userId = userIdOf(req);
    const id = String(req.params.id || "");
    const { data, error } = await db.from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "project_not_found" });
    res.json({ ok: true, id });
  } catch (e) { next(e); }
});

studioManageRouter.delete("/studio/videos/:id", async (req, res, next) => {
  try {
    const db = dbOrThrow();
    const userId = userIdOf(req);
    const id = String(req.params.id || "");
    const existing = await db.from("videos")
      .select("id,storage_url,source_url")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data) return res.status(404).json({ error: "video_not_found" });

    const removed = await db.from("videos").delete().eq("id", id).eq("user_id", userId);
    if (removed.error) throw removed.error;

    let storageCleanup: any = { removed: false, reason: "not_attempted" };
    try { storageCleanup = await deleteR2Key(keyFromStorage(existing.data.storage_url)); }
    catch (error) {
      console.warn("MY STUDIO video R2 cleanup failed:", error);
      storageCleanup = { removed: false, reason: "r2_delete_failed" };
    }
    res.json({ ok: true, id, storageCleanup });
  } catch (e) { next(e); }
});

studioManageRouter.delete("/studio/assets/:id", async (req, res, next) => {
  try {
    const db = dbOrThrow();
    const userId = userIdOf(req);
    const id = String(req.params.id || "");
    const existing = await db.from("assets")
      .select("id,object_key")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data) return res.status(404).json({ error: "asset_not_found" });

    const removed = await db.from("assets").delete().eq("id", id).eq("user_id", userId);
    if (removed.error) throw removed.error;

    let storageCleanup: any = { removed: false, reason: "not_attempted" };
    try { storageCleanup = await deleteR2Key(existing.data.object_key); }
    catch (error) {
      console.warn("MY STUDIO asset R2 cleanup failed:", error);
      storageCleanup = { removed: false, reason: "r2_delete_failed" };
    }
    res.json({ ok: true, id, storageCleanup });
  } catch (e) { next(e); }
});
