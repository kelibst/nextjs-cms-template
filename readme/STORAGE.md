# Media Storage (MinIO)

All uploaded files and migrated scraped images are stored in [MinIO](https://min.io) — an S3-compatible object storage server that runs locally via Docker and on the Hetzner production server.

---

## How it works

```
Upload (dashboard forms / /api/upload)
        │
        ▼
  src/lib/storage.ts  ──►  MinIO bucket: gaphto-media
        │
        ▼
  media_files table  (PostgreSQL — tracks metadata)
        │
        ▼
  getMediaUrl(key)  ──►  http://localhost:9000/gaphto-media/{key}  (local)
                         https://gaphto.org/media/gaphto-media/{key}  (prod)
```

Legacy scraped images (stored as bare relative keys in the DB, e.g. `gallery/album/image.jpg`) are resolved by `getMediaUrl()` to MinIO URLs automatically — no DB changes needed.

---

## Local development

### Start MinIO

```bash
docker compose -f infrastructure/docker-compose.yml up minio -d
```

Or start everything at once (Postgres + MinIO):

```bash
docker compose -f infrastructure/docker-compose.yml up -d
```

### Console (web UI)

Open **http://localhost:9001**

| Field | Value |
|-------|-------|
| Username | `minioadmin` |
| Password | `minioadmin` |

These credentials come from `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` in your `.env` file. Change them there to use different credentials.

### API endpoint

MinIO S3 API is at **http://localhost:9000**

Files are served publicly at:
```
http://localhost:9000/gaphto-media/{key}
```

Example:
```
http://localhost:9000/gaphto-media/gallery/2016-gallery/logo-u.png
```

---

## Migrate existing scraped images

After seeding the database, run the migration script to upload all images from `public/images/` into MinIO:

```bash
bunx tsx scripts/migrate-to-minio.ts
```

This uploads 367 files (gallery, posts, leadership, documents, uploads) and inserts records into the `media_files` table. Safe to re-run — already-uploaded files are skipped.

---

## Environment variables

### Local (`.env`)

```
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=gaphto-media
NEXT_PUBLIC_MEDIA_BASE_URL=http://localhost:9000/gaphto-media
```

### Production (Hetzner)

```
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=<strong-random-key>
MINIO_SECRET_KEY=<strong-random-secret>
MINIO_BUCKET=gaphto-media
NEXT_PUBLIC_MEDIA_BASE_URL=https://gaphto.org/media/gaphto-media
```

On production, MinIO is bound to `127.0.0.1:9000` only (not public). Nginx proxies `/media/` → MinIO internally.

---

## Bucket structure

All files live in a single bucket `gaphto-media` under these prefixes:

| Prefix | Contents |
|--------|----------|
| `gallery/` | Scraped WordPress gallery images |
| `posts/` | Scraped post featured images |
| `leadership/` | Scraped leadership photos |
| `documents/` | PDFs and documents |
| `uploads/` | User-uploaded files (dashboard) |
| `uploads/YYYY/MM/` | WordPress historical uploads |

---

## URL resolution

`getMediaUrl()` in `src/lib/media-url.ts` handles all three URL formats in the codebase:

| DB value | Resolved to |
|----------|-------------|
| `gallery/album/image.jpg` | `http://localhost:9000/gaphto-media/gallery/album/image.jpg` |
| `/images/logo/logo.png` | `/images/logo/logo.png` (unchanged — static file) |
| `https://example.com/img.png` | `https://example.com/img.png` (unchanged — external URL) |
| `null` / empty | `/images/placeholder.jpg` |

---

## Media Manager (dashboard)

Accessible at `/dashboard/media` for admins and editors.

- Browse all uploaded files in a grid
- Search by filename
- Filter by type (images / documents)
- Upload new files (drag-and-drop or click)
- Copy file URL to clipboard
- Delete files (soft-delete in DB + removed from MinIO)

A reusable **MediaPickerModal** is available in all content forms (post editor, event form, leadership form, publication form, block editors) — click "Choose from Media Library" to pick an existing file instead of uploading again.

---

## Docker storage

MinIO data is persisted in a named Docker volume:

```bash
# Inspect the volume
docker volume inspect gaphto_minio_data

# Remove (WARNING: destroys all stored files)
docker volume rm gaphto_minio_data
```

On Hetzner, the volume is named `gaphto_minio_data` and persists across container restarts and deploys.

---

## Troubleshooting

### Images not loading after starting the app

MinIO must be running. Check:

```bash
docker compose -f infrastructure/docker-compose.yml ps
```

If MinIO is not running:

```bash
docker compose -f infrastructure/docker-compose.yml up minio -d
```

### Migration script fails with "connection refused"

MinIO isn't running. Start it first, then re-run the script.

### MinIO console shows empty bucket after migration

The migration script uploads to the bucket but the console may need a page refresh. Also verify `NEXT_PUBLIC_MEDIA_BASE_URL` in `.env` points to `http://localhost:9000/gaphto-media`.

### Production: images load locally but not on Hetzner

1. Confirm MinIO is running: `docker compose -f infrastructure/docker-compose.prod.yml ps`
2. Re-run the migration script on the server
3. Verify `NEXT_PUBLIC_MEDIA_BASE_URL=https://gaphto.org/media/gaphto-media` in production `.env`
4. Check Nginx config has the `/media/` proxy block and has been reloaded
