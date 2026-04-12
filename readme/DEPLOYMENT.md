# Production Deployment (Hetzner VPS)

---

## Prerequisites — install once on the server

```bash
# Bun
curl -fsSL https://bun.sh/install | bash && source ~/.bashrc

# Docker, Nginx, Certbot, PM2
apt update && apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
npm install -g pm2
```

---

## First deploy

### 1. Clone the repo

```bash
git clone <repo-url> /var/www/gaphto
cd /var/www/gaphto
```

### 2. Copy the WordPress XML export

The XML file is not committed to git (37 MB). Copy it from your local machine:

```bash
# From your local machine:
scp scraper/gaphto.WordPress.2026-04-10.xml user@SERVER_IP:/var/www/gaphto/scraper/
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set real production values:

| Variable | What to set |
|----------|------------|
| `DATABASE_URL` | `postgresql://gaphto:YOUR_PASSWORD@127.0.0.1:5432/gaphto` |
| `POSTGRES_PASSWORD` | Strong random password (must match DATABASE_URL) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://gaphto.org` |
| `NEXT_PUBLIC_APP_URL` | `https://gaphto.org` |
| `NODE_ENV` | `production` |
| `MINIO_ACCESS_KEY` | Strong random key (e.g. `openssl rand -hex 16`) |
| `MINIO_SECRET_KEY` | Strong random secret (e.g. `openssl rand -hex 32`) |
| `MINIO_ENDPOINT` | `localhost` |
| `MINIO_PORT` | `9000` |
| `MINIO_USE_SSL` | `false` (Nginx handles TLS) |
| `MINIO_BUCKET` | `gaphto-media` |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | `https://gaphto.org/media/gaphto-media` |

### 4. Run the deploy script

```bash
chmod +x deploy.sh && ./deploy.sh
```

`deploy.sh` runs these steps automatically:
1. `bun install` (app + scraper dependencies)
2. Start PostgreSQL + MinIO via Docker (`infrastructure/docker-compose.prod.yml`)
3. `bun run scrape:xml` — parses the WordPress XML export
4. `bun run db:sync-data` — copies JSON → `src/data/` and images → `public/images/`
5. `bun run db:migrate` — applies all Drizzle migrations
6. `bun run db:seed` — seeds DB from scraped JSON
7. `bun run build` — production Next.js build
8. Starts app on port 3000 via PM2

**After a fresh deploy, run the image migration manually:**

```bash
cd /var/www/gaphto
bunx tsx scripts/migrate-to-minio.ts
```

This uploads all 367 scraped images to the MinIO bucket. Only needed once — subsequent deploys keep the MinIO volume intact.

### 5. Set up Nginx

```bash
sudo cp infrastructure/nginx.conf /etc/nginx/sites-available/gaphto
sudo ln -s /etc/nginx/sites-available/gaphto /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

The config redirects HTTP → HTTPS and serves `_next/static` and `/images/` directly for performance.

### 6. Obtain SSL certificate

DNS must be pointed to the server before this step.

```bash
sudo certbot --nginx -d gaphto.org -d www.gaphto.org
```

Certbot edits the Nginx config automatically and sets up auto-renewal.

### 7. Enable PM2 on system boot

```bash
pm2 startup   # prints a command — run it
pm2 save
```

---

## Re-deploying (updates)

```bash
cd /var/www/gaphto && git pull && ./deploy.sh --skip-scrape
```

`--skip-scrape` skips the WordPress XML parsing step (only needed when new content is exported).

If you have a new WordPress export:

```bash
# Copy new XML to server first, then:
./deploy.sh   # without --skip-scrape
```

---

## PM2 commands

```bash
pm2 list              # show running apps
pm2 logs gaphto       # tail logs
pm2 reload gaphto     # zero-downtime reload
pm2 restart gaphto    # full restart
```

Logs are written to `/var/log/gaphto/out.log` and `/var/log/gaphto/error.log`.

---

## Docker commands (production)

```bash
# Uses docker-compose.prod.yml (no pgAdmin, Postgres + MinIO on 127.0.0.1)
docker compose -f infrastructure/docker-compose.prod.yml ps
docker compose -f infrastructure/docker-compose.prod.yml logs postgres
docker compose -f infrastructure/docker-compose.prod.yml logs minio
docker compose -f infrastructure/docker-compose.prod.yml restart postgres
docker compose -f infrastructure/docker-compose.prod.yml restart minio
```

MinIO data is stored in the `gaphto_minio_data` named volume — it persists across container restarts and image updates.

---

## Troubleshooting

### App starts but shows blank page / 500
Check PM2 logs: `pm2 logs gaphto --lines 100`

### Database connection refused
```bash
docker compose -f infrastructure/docker-compose.prod.yml up -d --wait
```

### Nginx 502 Bad Gateway
The Next.js process isn't running. Check `pm2 list` and `pm2 start infrastructure/ecosystem.config.js`.

### SSL certificate not found
Ensure DNS A records point to the server IP, then re-run Certbot.

### Images not loading on production
1. Confirm MinIO is running: `docker compose -f infrastructure/docker-compose.prod.yml ps`
2. Check `NEXT_PUBLIC_MEDIA_BASE_URL=https://gaphto.org/media/gaphto-media` in `.env`
3. Ensure Nginx has the `/media/` proxy block: `sudo nginx -t && sudo systemctl reload nginx`
4. Run the image migration if not done yet: `bunx tsx scripts/migrate-to-minio.ts`
