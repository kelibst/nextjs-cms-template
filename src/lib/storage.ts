import { Client } from 'minio';

const BUCKET = process.env.MINIO_BUCKET || 'gaphto-media';
const PUBLIC_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'http://localhost:9000/gaphto-media';

let _client: Client | null = null;

function getClient(): Client {
  if (!_client) {
    _client = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }
  return _client;
}

export async function ensureBucket(): Promise<void> {
  const client = getClient();
  const exists = await client.bucketExists(BUCKET);
  if (!exists) {
    await client.makeBucket(BUCKET);
    // Set public read policy so URLs are accessible without presigning
    const policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${BUCKET}/*`],
      }],
    });
    await client.setBucketPolicy(BUCKET, policy);
  }
}

export async function uploadFile(
  key: string,
  buffer: Buffer,
  mimeType: string,
  size: number,
): Promise<string> {
  const client = getClient();
  await ensureBucket();
  await client.putObject(BUCKET, key, buffer, size, { 'Content-Type': mimeType });
  return getPublicUrl(key);
}

export async function deleteFile(key: string): Promise<void> {
  const client = getClient();
  await client.removeObject(BUCKET, key);
}

export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`;
}

export async function listFiles(prefix?: string): Promise<{ key: string; size: number; lastModified: Date }[]> {
  const client = getClient();
  const stream = client.listObjects(BUCKET, prefix || '', true);
  return new Promise((resolve, reject) => {
    const items: { key: string; size: number; lastModified: Date }[] = [];
    stream.on('data', (obj) => {
      if (obj.name) items.push({ key: obj.name, size: obj.size || 0, lastModified: obj.lastModified || new Date() });
    });
    stream.on('end', () => resolve(items));
    stream.on('error', reject);
  });
}
