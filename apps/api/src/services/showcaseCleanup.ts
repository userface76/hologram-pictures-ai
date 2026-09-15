import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

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

function showcaseKeyFromPublicUrl(url: string) {
  const publicBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!publicBase || !url.startsWith(`${publicBase}/`)) return null;
  const key = url.slice(publicBase.length + 1);
  return key.startsWith("showcase/videos/") ? key : null;
}

export async function deleteShowcaseVideoByUrl(url: string) {
  const r2 = getR2Client();
  const bucket = process.env.R2_BUCKET;
  const key = showcaseKeyFromPublicUrl(url);
  if (!r2 || !bucket || !key) return false;
  await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  return true;
}
