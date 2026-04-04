import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

let client;

function getClient() {
  if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) return null;
  if (!client) {
    client = new S3Client({
      region: process.env.AWS_REGION,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }
  return client;
}

export function isS3Enabled() {
  return Boolean(
    getClient() &&
      process.env.AWS_S3_BUCKET &&
      process.env.S3_PUBLIC_BASE_URL?.trim()
  );
}

/**
 * @param {string} localPath
 * @param {string} key - e.g. videos/abc.mp4
 * @returns {Promise<string>} public URL
 */
export async function uploadFileToS3(localPath, key) {
  const s3 = getClient();
  const bucket = process.env.AWS_S3_BUCKET;
  const Body = fs.readFileSync(localPath);
  const ext = path.extname(key) || path.extname(localPath);
  const contentType = ext.match(/mp4|webm|mov/i)
    ? `video/${ext.slice(1).toLowerCase() === 'mov' ? 'quicktime' : 'mp4'}`
    : ext.match(/jpe?g|png|webp/i)
      ? `image/${ext.slice(1).toLowerCase() === 'jpg' ? 'jpeg' : ext.slice(1).toLowerCase()}`
      : 'application/octet-stream';

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body,
      ContentType: contentType,
    })
  );

  const base = process.env.S3_PUBLIC_BASE_URL.replace(/\/+$/, '');
  return `${base}/${key}`;
}
