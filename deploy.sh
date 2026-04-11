#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# GAPHTO — One-shot Hetzner deployment script
#
# Usage (first deploy):
#   git clone <repo> /var/www/gaphto && cd /var/www/gaphto
#   cp .env.example .env        # fill in real values before continuing
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Usage (update an existing deployment):
#   cd /var/www/gaphto && git pull && ./deploy.sh
#
# Prerequisites (install once on the server):
#   curl -fsSL https://bun.sh/install | bash      # Bun runtime
#   apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
#   npm install -g pm2
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# ── Colour helpers ─────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
die()     { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── Guard: .env must exist ──────────────────────────────────────────────────
[[ -f .env ]] || die ".env not found. Copy .env.example to .env and fill in production values."

# Load env so we can use POSTGRES_* vars in the health-check below
set -a; source .env; set +a

echo ""
echo "════════════════════════════════════════════════════════"
echo "  GAPHTO Deployment — $(date '+%Y-%m-%d %H:%M:%S')"
echo "════════════════════════════════════════════════════════"

# ── Step 1: Install dependencies ───────────────────────────────────────────
info "Step 1/9 — Installing app dependencies..."
bun install --frozen-lockfile

info "Step 1/9 — Installing scraper dependencies..."
cd scraper && bun install --frozen-lockfile && cd ..
success "Dependencies installed."

# ── Step 2: Start PostgreSQL ────────────────────────────────────────────────
info "Step 2/9 — Starting PostgreSQL..."
docker compose -f infrastructure/docker-compose.prod.yml up -d --wait
success "PostgreSQL is up."

# ── Step 3: Parse WordPress XML → output/*.json + download all images ───────
# Only run if the XML export file exists. On re-deploys where scraping is
# already done, skip by passing --skip-scrape:
#   ./deploy.sh --skip-scrape
if [[ "${1:-}" == "--skip-scrape" ]]; then
  warn "Step 3/9 — Skipping scraper (--skip-scrape flag set)."
else
  WXR_FILE="scraper/gaphto.WordPress.2026-04-10.xml"
  if [[ -f "$WXR_FILE" ]]; then
    info "Step 3/9 — Parsing WordPress XML export (this may take a few minutes)..."
    bun run scrape:xml
    success "WordPress XML parsed. Output in scraper/output/"
  else
    warn "Step 3/9 — $WXR_FILE not found — skipping XML scrape."
    warn "           The seed step will use whatever is already in scraper/output/."
  fi
fi

# ── Step 4: Sync scraped data into the app ──────────────────────────────────
info "Step 4/9 — Syncing scraped data into the app..."
bun run db:sync-data
success "Data synced."

# ── Step 5: Run database migrations ─────────────────────────────────────────
info "Step 5/9 — Running database migrations..."
bun run db:migrate
success "Migrations complete."

# ── Step 6: Seed the database ───────────────────────────────────────────────
info "Step 6/9 — Seeding database..."
bun run db:seed
success "Database seeded."

# ── Step 7: Build Next.js ───────────────────────────────────────────────────
info "Step 7/9 — Building Next.js for production..."
bun run build
success "Build complete."

# ── Step 8: Set up log directory ────────────────────────────────────────────
info "Step 8/9 — Setting up log directory..."
mkdir -p /var/log/gaphto
success "Log directory ready."

# ── Step 9: Start / reload app with PM2 ─────────────────────────────────────
info "Step 9/9 — Starting app with PM2..."
if pm2 list | grep -q 'gaphto'; then
  pm2 reload infrastructure/ecosystem.config.js --update-env
  success "App reloaded."
else
  pm2 start infrastructure/ecosystem.config.js
  pm2 save
  success "App started and saved to PM2 startup."
fi

echo ""
echo "════════════════════════════════════════════════════════"
success "Deployment complete! App is running on port 3000."
echo ""
echo "  Next steps (first deploy only):"
echo "  1. Point your domain DNS A record to this server's IP"
echo "  2. Install Nginx config:"
echo "       sudo cp infrastructure/nginx.conf /etc/nginx/sites-available/gaphto"
echo "       sudo ln -s /etc/nginx/sites-available/gaphto /etc/nginx/sites-enabled/"
echo "       sudo nginx -t && sudo systemctl reload nginx"
echo "  3. Obtain SSL certificate:"
echo "       sudo certbot --nginx -d gaphto.org -d www.gaphto.org"
echo "  4. Enable PM2 on boot:"
echo "       pm2 startup && pm2 save"
echo "════════════════════════════════════════════════════════"
