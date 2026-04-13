'use server';

import { db } from '@/lib/db';
import { mediaFiles } from '../../../drizzle/schema';
import { deleteFile } from '@/lib/storage';
import { getMediaUrl } from '@/lib/media-url';
import { eq, isNull, isNotNull, ilike, and, desc, asc, gte, lte, inArray } from 'drizzle-orm';
import { auth } from '@/auth'
import { can, type Role } from '@/lib/permissions';
import { audit } from '@/lib/audit';

export async function getMediaFiles(filters?: {
  mimeType?: string;
  search?: string;
  page?: number;
  limit?: number;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'originalName' | 'fileSize';
  sortDir?: 'asc' | 'desc';
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
  if (filters?.category) {
    conditions.push(eq(mediaFiles.category, filters.category));
  }
  if (filters?.dateFrom) {
    conditions.push(gte(mediaFiles.createdAt, new Date(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    conditions.push(lte(mediaFiles.createdAt, new Date(filters.dateTo + 'T23:59:59')));
  }

  // Build orderBy dynamically
  let orderBy;
  if (filters?.sortBy) {
    const col =
      filters.sortBy === 'originalName' ? mediaFiles.originalName :
      filters.sortBy === 'fileSize'     ? mediaFiles.fileSize :
                                          mediaFiles.createdAt;
    orderBy = filters.sortDir === 'asc' ? asc(col) : desc(col);
  } else {
    orderBy = desc(mediaFiles.createdAt);
  }

  const rows = await db
    .select()
    .from(mediaFiles)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return rows.map((r) => ({ ...r, url: getMediaUrl(r.key) }));
}

export async function deleteMediaFile(id: number) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  if (!can(session.user.role as Role, 'media:delete')) throw new Error('Forbidden');

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

  void audit({ userId: session.user.id, action: 'media.deleted', metadata: { mediaId: id, key: file.key } })

  return { success: true };
}

export async function getMediaFile(id: number) {
  const [file] = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id));
  if (!file) return null;
  return { ...file, url: getMediaUrl(file.key) };
}

export async function updateMediaFile(
  id: number,
  data: { altText?: string; description?: string; category?: string; duration?: number }
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  await db
    .update(mediaFiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(mediaFiles.id, id))

  return { success: true }
}

export async function bulkDeleteMediaFiles(ids: number[]) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  if (ids.length === 0) return { deleted: 0 }

  // Fetch keys first for MinIO cleanup
  const files = await db
    .select({ id: mediaFiles.id, key: mediaFiles.key })
    .from(mediaFiles)
    .where(inArray(mediaFiles.id, ids))

  // Soft delete all
  await db
    .update(mediaFiles)
    .set({ deletedAt: new Date() })
    .where(inArray(mediaFiles.id, ids))

  // MinIO cleanup (non-fatal)
  for (const f of files) {
    try { await deleteFile(f.key) } catch { /* ignore */ }
  }

  return { deleted: files.length }
}

export async function getMediaCategories(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ category: mediaFiles.category })
    .from(mediaFiles)
    .where(and(isNull(mediaFiles.deletedAt), isNotNull(mediaFiles.category)))
    .orderBy(asc(mediaFiles.category))
  return rows.map((r) => r.category as string)
}
