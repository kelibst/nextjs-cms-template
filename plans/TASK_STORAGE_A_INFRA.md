# TASK: Storage Agent 1 — Infrastructure + Backend
> Read plans/AGENT_CONTEXT.md "ACTIVE SPRINT" section first for all key facts.
> When done, update your STATUS in AGENT_CONTEXT.md and mark this file DONE.

## Your Role
You are implementing the backend storage layer for MinIO object storage in the GAPHTO Next.js project at `/home/kelib/Desktop/moreprojects/gaphto`. Work through the checklist below in order. Do NOT build any UI.

---

## Checklist

### Step 1 — Install Package
```bash
cd /home/kelib/Desktop/moreprojects/gaphto && bun add minio
```

### Step 2 — Local Docker Compose (`infrastructure/docker-compose.yml`)
Add MinIO service between `pgadmin` and the `volumes` block:
```yaml
  minio:
    image: minio/minio:latest
    container_name: gaphto_minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:-minioadmin}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - gaphto_minio_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9000/minio/health/live || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
```
Also add `gaphto_minio_data:` to the `volumes:` section (no extra options needed, just the key).

### Step 3 — Prod Docker Compose (`infrastructure/docker-compose.prod.yml`)
Add MinIO service (API only, no console port, bound to 127.0.0.1):
```yaml
  minio:
    image: minio/minio:latest
    container_name: gaphto_minio
    command: server /data
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    ports:
      - "127.0.0.1:9000:9000"
    volumes:
      - gaphto_minio_data:/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9000/minio/health/live || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
```
Add `gaphto_minio_data:` with `name: gaphto_minio_data` to the `volumes:` section.

### Step 4 — Nginx (`infrastructure/nginx.conf`)
Add this block **before** the catch-all `location / {` block inside the HTTPS server:
```nginx
    # MinIO object storage proxy
    location /media/ {
        proxy_pass         http://127.0.0.1:9000/;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_buffering    off;
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=2592000";
    }
```

### Step 5 — Database Schema (`drizzle/schema.ts`)
Read the file first. After the last existing table definition (before the closing of the file), add:
```ts
export const mediaFiles = pgTable('media_files', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  bucket: text('bucket').notNull().default('gaphto-media'),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  width: integer('width'),
  height: integer('height'),
  uploadedBy: integer('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
```
Make sure `integer` and `timestamp` are imported from `drizzle-orm/pg-core` (check existing imports — they likely already are).

Then generate and run the migration:
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx drizzle-kit generate --config=drizzle/drizzle.config.ts
bunx tsx drizzle/migrate.ts
```

### Step 6 — Environment Variables
Add to `.env` (read the file first to avoid duplicates — append at end):
```
# MinIO Object Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=gaphto-media
NEXT_PUBLIC_MEDIA_BASE_URL=http://localhost:9000/gaphto-media
```

Add to `.env.example` (same block, but values are placeholders):
```
# MinIO Object Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=<your-minio-secret>
MINIO_BUCKET=gaphto-media
# Local: http://localhost:9000/gaphto-media
# Prod:  https://gaphto.org/media/gaphto-media
NEXT_PUBLIC_MEDIA_BASE_URL=http://localhost:9000/gaphto-media
```

### Step 7 — Storage Client (`src/lib/storage.ts`)
Create new file. This is a singleton MinIO client with helper functions:

```ts
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
```

### Step 8 — URL Compatibility Helper (`src/lib/media-url.ts`)
Create new file:

```ts
/**
 * Resolves any media URL to a usable absolute or root-relative URL.
 * Handles:
 *   - Full URLs (MinIO, external): returned as-is
 *   - Root-relative paths (/images/..., /uploads/...): returned as-is
 *   - Bare relative keys: prefixed with NEXT_PUBLIC_MEDIA_BASE_URL
 *   - null/undefined: returns placeholder
 */
export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return url;
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'http://localhost:9000/gaphto-media';
  return `${base}/${url}`;
}
```

### Step 9 — Update Upload API (`src/app/api/upload/route.ts`)
Read the current file first. Then rewrite the storage logic (keep all auth/permission checks unchanged):

Replace the section that creates the filename + writes to disk with:
1. Read the file as an `ArrayBuffer` → convert to `Buffer`
2. Generate key: `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
3. Call `uploadFile(key, buffer, file.type, buffer.length)` from `src/lib/storage.ts`
4. Insert a row into `mediaFiles` via Drizzle:
   ```ts
   const [record] = await db.insert(mediaFiles).values({
     key,
     filename: `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`,
     originalName: file.name,
     mimeType: file.type,
     fileSize: buffer.length,
     uploadedBy: session.user.id ? parseInt(session.user.id) : null,
   }).returning();
   ```
5. Return `NextResponse.json({ url: publicUrl, id: record.id })`

Import `mediaFiles` from `@/drizzle/schema` and `uploadFile` from `@/lib/storage`.

### Step 10 — Media Server Actions (`src/app/actions/media.ts`)
Create new file with these three server actions:

```ts
'use server';

import { db } from '@/lib/db';
import { mediaFiles } from '@/drizzle/schema';
import { deleteFile } from '@/lib/storage';
import { getMediaUrl } from '@/lib/media-url';
import { eq, isNull, ilike, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function getMediaFiles(filters?: {
  mimeType?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 40;
  const offset = (page - 1) * limit;

  const conditions = [isNull(mediaFiles.deletedAt)];
  if (filters?.mimeType) {
    conditions.push(ilike(mediaFiles.mimeType, `${filters.mimeType}%`));
  }
  if (filters?.search) {
    conditions.push(ilike(mediaFiles.originalName, `%${filters.search}%`));
  }

  const rows = await db
    .select()
    .from(mediaFiles)
    .where(and(...conditions))
    .orderBy(desc(mediaFiles.createdAt))
    .limit(limit)
    .offset(offset);

  return rows.map((r) => ({ ...r, url: getMediaUrl(r.key) }));
}

export async function deleteMediaFile(id: number) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const [file] = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id));
  if (!file) throw new Error('File not found');

  // Soft delete in DB
  await db
    .update(mediaFiles)
    .set({ deletedAt: new Date() })
    .where(eq(mediaFiles.id, id));

  // Remove from MinIO
  try {
    await deleteFile(file.key);
  } catch {
    // MinIO deletion failure is non-fatal
  }

  return { success: true };
}

export async function getMediaFile(id: number) {
  const [file] = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id));
  if (!file) return null;
  return { ...file, url: getMediaUrl(file.key) };
}
```

---

## Verification
After completing all steps:
1. Run `bunx tsc --noEmit` — must pass with zero errors
2. Start MinIO: `docker compose -f infrastructure/docker-compose.yml up minio -d`
3. Visit `http://localhost:9001` — MinIO console should be accessible (login: minioadmin/minioadmin)
4. Test an upload via the existing upload API (use curl or Postman with a test image)
5. Check the `media_files` table in the DB for the record

## On Completion
Update `plans/AGENT_CONTEXT.md`:
- Change Agent 1 Status from `IN PROGRESS` → `DONE ✅`
- Add a work log entry under `## Agent Work Log` summarizing what was done
- This unblocks Agent 2 to start
