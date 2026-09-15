import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null | undefined;

export type ShowcaseItem = {
  id: string;
  title: string;
  category: string;
  url: string;
  aspectRatio?: string | null;
  fileName?: string | null;
  createdAt: string;
};

const SHOWCASE_MANIFEST_KEY = "showcase/manifest.json";

function getR2Client() {
  if (client !== undefined) return client;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    client = null;
    return client;
  }
  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

function publicUrlFor(key: string) {
  const publicBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return publicBase ? `${publicBase}/${key}` : null;
}

function tenantPrefix(userId: string) {
  return `users/${userId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export function isR2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  );
}

export async function uploadImageDataUrl(userId: string, dataUrl: string, originalName = "image") {
  const r2 = getR2Client();
  const bucket = process.env.R2_BUCKET;
  if (!r2 || !bucket) throw new Error("R2 is not configured");
  if (!process.env.R2_PUBLIC_BASE_URL) throw new Error("R2_PUBLIC_BASE_URL is not configured");

  const match = /^data:(image\/(?:jpeg|png|webp|heic|heif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Unsupported image format. Use JPG, PNG, WEBP, HEIC or HEIF.");

  const contentType = match[1];
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length) throw new Error("Image is empty");
  if (bytes.length > 30 * 1024 * 1024) throw new Error("Image must be 30 MB or smaller");

  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  const ext = extMap[contentType] || "jpg";
  const safeBase = originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9가-힣_-]+/g, "-").slice(0, 60) || "image";
  const key = `${tenantPrefix(userId)}/assets/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeBase}.${ext}`;

  await r2.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: bytes,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));

  return {
    key,
    url: publicUrlFor(key),
    size: bytes.length,
    contentType,
  };
}

export async function archiveRemoteVideo(userId: string, sourceUrl: string, jobId: string) {
  const r2 = getR2Client();
  const bucket = process.env.R2_BUCKET;
  if (!r2 || !bucket) return null;

  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Could not download generated video (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "video/mp4";
  const key = `${tenantPrefix(userId)}/renders/${new Date().toISOString().slice(0, 10)}/${jobId}.mp4`;

  await r2.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: bytes,
    ContentType: contentType,
  }));

  return {
    key,
    url: publicUrlFor(key),
  };
}

export async function uploadShowcaseVideoDataUrl(dataUrl: string, originalName = "showcase.mp4") {
  const r2 = getR2Client();
  const bucket = process.env.R2_BUCKET;
  if (!r2 || !bucket) throw new Error("R2 is not configured");
  if (!process.env.R2_PUBLIC_BASE_URL) throw new Error("R2_PUBLIC_BASE_URL is not configured");

  const match = /^data:(video\/(?:mp4|webm|quicktime));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) throw new Error("Unsupported video format. Use MP4, WEBM or MOV.");

  const contentType = match[1];
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length) throw new Error("Video is empty");
  if (bytes.length > 30 * 1024 * 1024) throw new Error("Showcase video must be 30 MB or smaller");

  const ext = contentType === "video/webm" ? "webm" : contentType === "video/quicktime" ? "mov" : "mp4";
  const safeBase = originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9가-힣_-]+/g, "-").slice(0, 80) || "showcase";
  const key = `showcase/videos/${Date.now()}-${randomUUID()}-${safeBase}.${ext}`;

  await r2.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: bytes,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));

  const url = publicUrlFor(key);
  if (!url) throw new Error("R2 public URL is not configured");
  return { key, url, size: bytes.length, contentType };
}

export async function readShowcaseManifest(): Promise<ShowcaseItem[]> {
  const r2 = getR2Client();
  const bucket = process.env.R2_BUCKET;
  if (!r2 || !bucket) return [];
  try {
    const result = await r2.send(new GetObjectCommand({ Bucket: bucket, Key: SHOWCASE_MANIFEST_KEY }));
    const body = result.Body as any;
    const text = body?.transformToString ? await body.transformToString("utf-8") : "[]";
    const parsed = JSON.parse(text || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item?.url && item?.id).slice(0, 100) : [];
  } catch (error: any) {
    const name = String(error?.name || error?.Code || "");
    if (name.includes("NoSuchKey") || name.includes("NotFound") || error?.$metadata?.httpStatusCode === 404) return [];
    console.warn("Showcase manifest read skipped:", error);
    return [];
  }
}

export async function writeShowcaseManifest(items: ShowcaseItem[]) {
  const r2 = getR2Client();
  const bucket = process.env.R2_BUCKET;
  if (!r2 || !bucket) throw new Error("R2 is not configured");
  await r2.send(new PutObjectCommand({
    Bucket: bucket,
    Key: SHOWCASE_MANIFEST_KEY,
    Body: JSON.stringify(items.slice(0, 100), null, 2),
    ContentType: "application/json; charset=utf-8",
    CacheControl: "no-store, max-age=0",
  }));
}
