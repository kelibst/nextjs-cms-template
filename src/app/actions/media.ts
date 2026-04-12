'use server';

import { db } from '@/lib/db';
import { mediaFiles } from '../../../drizzle/schema';
import { deleteFile } from '@/lib/storage';
import { getMediaUrl } from '@/lib/media-url';
import { eq, isNull, ilike, and, desc } from 'drizzle-orm';
import { auth } from '@/auth';

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
