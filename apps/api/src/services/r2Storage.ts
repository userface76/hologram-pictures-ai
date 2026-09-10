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

export function isR2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  );
}

export async function archiveRemoteVideo(sourceUrl: string, jobId: string) {
  const r2 = getR2Client();
  const bucket = process.env.R2_BUCKET;
  if (!r2 || !bucket) return null;

  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Could not download generated video (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "video/mp4";
  const key = `renders/${new Date().toISOString().slice(0, 10)}/${jobId}.mp4`;

  await r2.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: bytes,
    ContentType: contentType,
  }));

  const publicBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return {
    key,
    url: publicBase ? `${publicBase}/${key}` : null,
  };
}
