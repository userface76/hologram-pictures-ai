import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null | undefined;

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
