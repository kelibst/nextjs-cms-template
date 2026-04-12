/**
 * migrate-to-minio.ts
 *
 * Uploads all files under /public/images/ into MinIO (bucket: gaphto-media)
 * and inserts corresponding rows into the media_files table.
 *
 * Usage:
 *   bunx tsx scripts/migrate-to-minio.ts
 */

/**
 * NOTE: Run with env loaded from .env:
 *   bunx tsx --env-file=.env scripts/migrate-to-minio.ts
 * OR export DATABASE_URL first, OR just use:
 *   DATABASE_URL=... bunx tsx scripts/migrate-to-minio.ts
 *
 * tsx's --env-file flag ensures DB/MinIO vars are set before module init.
 */
import * as fs from 'fs';
import * as path from 'path';
import { uploadFile, ensureBucket } from '../src/lib/storage';
import { db } from '../src/lib/db';
import { mediaFiles } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// ─── MIME type map ────────────────────────────────────────────────────────────
const MIME: Record<string, string> = {
  jpg:  'image/jpeg',
  jpeg: 'image/jpeg',
  png:  'image/png',
  gif:  'image/gif',
  webp: 'image/webp',
  svg:  'image/svg+xml',
  pdf:  'application/pdf',
  doc:  'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return MIME[ext] ?? 'application/octet-stream';
}

// ─── Recursive file walker ────────────────────────────────────────────────────
async function walkDir(dir: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDir(full)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const publicImagesDir = path.resolve(__dirname, '../public/images');

  console.log(`Scanning ${publicImagesDir} …`);
  const allFiles = await walkDir(publicImagesDir);
  const total = allFiles.length;
  console.log(`Found ${total} files.\n`);

  // Ensure bucket exists (also sets public-read policy)
  await ensureBucket();

  let uploaded = 0;
  let skipped  = 0;
  const errors: { key: string; error: string }[] = [];

  for (let i = 0; i < allFiles.length; i++) {
    const filePath = allFiles[i];
    const key      = path.relative(publicImagesDir, filePath).replace(/\\/g, '/'); // normalise on Windows too
    const label    = `[${i + 1}/${total}] ${key}`;

    try {
      // Skip if already in media_files
      const existing = await db
        .select({ id: mediaFiles.id })
        .from(mediaFiles)
        .where(eq(mediaFiles.key, key))
        .limit(1);

      if (existing.length > 0) {
        console.log(`  SKIP  ${label}`);
        skipped++;
        continue;
      }

      const buffer   = await fs.promises.readFile(filePath);
      const mimeType = getMimeType(filePath);
      const size     = buffer.length;

      // Upload to MinIO
      await uploadFile(key, buffer, mimeType, size);

      // Insert into media_files (onConflictDoNothing makes re-runs safe)
      await db
        .insert(mediaFiles)
        .values({
          key,
          bucket:       'gaphto-media',
          filename:     path.basename(filePath),
          originalName: path.basename(filePath),
          mimeType,
          fileSize:     size,
        })
        .onConflictDoNothing();

      console.log(`  UP    ${label}`);
      uploaded++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ERR   ${label} — ${msg}`);
      errors.push({ key, error: msg });
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────');
  console.log(`Total files  : ${total}`);
  console.log(`Uploaded     : ${uploaded}`);
  console.log(`Skipped      : ${skipped}`);
  console.log(`Errors       : ${errors.length}`);
  if (errors.length > 0) {
    console.log('\nFailed files:');
    for (const e of errors) {
      console.log(`  ${e.key} — ${e.error}`);
    }
  }
  console.log('─────────────────────────────────────────────\n');

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
