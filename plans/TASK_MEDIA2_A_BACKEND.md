# Agent 1 — Media Library Upgrade: Backend

## Context

The GAPHTO platform has a working MinIO media upload system. We are upgrading the media library (Sprint 2). Your job is backend-only: DB schema + migration, upload route improvements, and server actions.

**Working directory:** `/home/kelib/Desktop/moreprojects/gaphto`

---

## Task A1 — Schema: add 5 columns to `mediaFiles`

File: `drizzle/schema.ts`

The `mediaFiles` table currently ends at line 444 with `deletedAt`. Add these columns **before** `deletedAt`:

```ts
category:    text('category'),
altText:     text('alt_text'),
description: text('description'),
duration:    integer('duration'),
updatedAt:   timestamp('updated_at').defaultNow().notNull(),
```

After editing schema.ts, run the migration:
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx drizzle-kit generate --config=drizzle/drizzle.config.ts
bunx tsx drizzle/migrate.ts
```

Also update the `MediaFile` type inference — it is auto-derived from `$inferSelect` so no manual changes needed after the table is updated.

---

## Task A2 — Upload Route: video support + per-type limits

File: `src/app/api/upload/route.ts`

Current state:
- Single `MAX_SIZE = 5 * 1024 * 1024` (5 MB) hard limit
- Accepts `image/*`, `application/pdf`, `document`, `spreadsheet`
- All files go to `uploads/` prefix
- Does not accept `category` or `altText` from form data

Changes needed:

1. **Per-type size limits** (replace single MAX_SIZE):
   ```ts
   function getMaxSize(mimeType: string): number {
     if (mimeType.startsWith('video/')) return 200 * 1024 * 1024  // 200 MB
     if (mimeType.startsWith('image/')) return 10 * 1024 * 1024   // 10 MB
     return 20 * 1024 * 1024                                       // 20 MB
   }
   ```

2. **Add video/* to accepted types** (update the MIME type check):
   ```ts
   const allowed =
     file.type.startsWith('image/') ||
     file.type.startsWith('video/') ||
     file.type === 'application/pdf' ||
     file.type.includes('document') ||
     file.type.includes('spreadsheet')
   ```

3. **Per-type MinIO prefix** (replace hardcoded `uploads/`):
   ```ts
   function getPrefix(mimeType: string): string {
     if (mimeType.startsWith('video/')) return 'videos'
     if (mimeType.startsWith('image/')) return 'uploads'
     return 'documents'
   }
   const key = `${getPrefix(file.type)}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
   ```

4. **Accept `category` and `altText` from FormData** and include in DB insert:
   ```ts
   const category = (formData.get('category') as string | null) || null
   const altText  = (formData.get('altText')  as string | null) || null
   ```
   Include in the `.values({...})` call: `category, altText`

5. **Check file size AFTER buffering** — check `buffer.length` against `getMaxSize(file.type)` (current code reads `file.size` before buffering, keep that check as an early bail-out for non-video, then re-check buffer length for safety).

---

## Task A3 — Server Actions: extend + add new

File: `src/app/actions/media.ts`

### 3a — Extend `getMediaFiles()` with new filter params

Current signature only has `mimeType`, `search`, `page`, `limit`. Add:
- `category?: string`  
- `dateFrom?: string`  (ISO date string, e.g. `"2025-01-01"`)
- `dateTo?: string`
- `sortBy?: 'createdAt' | 'originalName' | 'fileSize'`
- `sortDir?: 'asc' | 'desc'`

Implementation notes:
- Add `category` filter: `eq(mediaFiles.category, filters.category)` (exact match)
- `dateFrom` filter: `gte(mediaFiles.createdAt, new Date(filters.dateFrom))`
- `dateTo` filter: `lte(mediaFiles.createdAt, new Date(filters.dateTo + 'T23:59:59'))`
- `sortBy` / `sortDir`: build the orderBy dynamically. Default is `desc(mediaFiles.createdAt)`.
  - `originalName` → `mediaFiles.originalName`
  - `fileSize` → `mediaFiles.fileSize`
  - `sortDir: 'asc'` → `asc(col)`, else `desc(col)`
- Import `asc`, `gte`, `lte` from `drizzle-orm` (check existing imports first)

### 3b — Add `updateMediaFile()`

```ts
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
```

### 3c — Add `bulkDeleteMediaFiles()`

```ts
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
```
Import `inArray` from `drizzle-orm`.

### 3d — Add `getMediaCategories()`

```ts
export async function getMediaCategories(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ category: mediaFiles.category })
    .from(mediaFiles)
    .where(and(isNull(mediaFiles.deletedAt), isNotNull(mediaFiles.category)))
    .orderBy(asc(mediaFiles.category))
  return rows.map((r) => r.category as string)
}
```
Import `isNotNull`, `asc` from `drizzle-orm`.

---

## Completion Check

Run TypeScript check after all changes:
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit
```

Fix any type errors before reporting done. Do NOT run the dev server.

Report back:
1. Migration applied successfully (paste the migration filename)
2. TypeScript check passes with 0 errors (or list remaining errors if any)
