# Next.js CMS Template

A full-featured, production-ready CMS and membership platform template built with Next.js 16, TypeScript, and modern tooling. Clone it, configure it, and launch your organisation's digital platform.

---

## Features

- **Visual page builder** — 13 drag-and-drop block types (hero variants, stats bar, rich text, events/news/leadership/gallery preview blocks, CTA, features grid, image banner, timeline, objectives list)
- **Blog and news** — Posts with rich-text (TipTap) editor, category tagging (`news`, `blog`, `announcement`), slug-based URLs, cover images
- **Events** — Upcoming/past listing, event detail pages with registration form, admin registrations view with CSV export
- **Gallery** — Albums with drag-and-drop image reorder, lightbox viewer, bulk upload
- **Publications library** — Member-gated publications with file attachments
- **Learning / LMS** — Course and lesson management, member enrolment, progress tracking, admin analytics
- **Newsletter** — Compose and send HTML newsletters to member segments via Resend
- **Member portal** — Dashboard, searchable member directory, profile editing, email preferences, course access
- **RBAC** — Four roles (`super_admin`, `admin`, `editor`, `member`) with per-route and per-action enforcement
- **Media manager** — MinIO-backed file storage with browser UI, reusable media-picker modal, presigned URLs
- **Navigation manager** — Database-driven site navigation links, drag-and-drop reorder in the dashboard
- **Site settings** — Site name, contact email, social links, editable from the dashboard
- **Contact form** — Public contact form with dashboard inbox view
- **Announcements** — Banner announcements manageable by editors
- **Member map** — Leaflet map of member locations in the admin members view
- **Dark mode** — Full light/dark theme support via next-themes
- **Authentication** — NextAuth v5 with email/password, password reset flow, registration

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | NextAuth v5 (beta) |
| Database | PostgreSQL via Drizzle ORM |
| Object Storage | MinIO (S3-compatible) |
| Rich Text Editor | TipTap 3 |
| Email | Resend |
| Drag and Drop | @dnd-kit |
| Carousel | Embla Carousel |
| Animation | Framer Motion |
| Map | Leaflet + React Leaflet |
| Package Manager | Bun |
| Containerisation | Docker Compose |

---

## Quick Start

1. **Clone the repo**
   ```bash
   git clone <your-repo-url> my-project
   cd my-project
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Generate auth secrets (required even for local dev):
   ```bash
   openssl rand -base64 32
   ```
   Paste the output into both `NEXTAUTH_SECRET` and `AUTH_SECRET` in `.env`. Everything else in `.env.example` works out of the box for local development.

4. **Start infrastructure** (PostgreSQL on port 5434 + MinIO)
   ```bash
   docker compose -f infrastructure/docker-compose.yml up -d
   ```
   Wait for containers to become healthy before continuing:
   ```bash
   docker compose -f infrastructure/docker-compose.yml ps
   ```

5. **Run database migrations**
   ```bash
   bun run db:migrate
   ```

6. **Seed demo data**
   ```bash
   bun run db:seed
   ```

7. **Start the development server**
   ```bash
   bun run dev
   ```

8. **Open the app**
   - Site: [http://localhost:3000](http://localhost:3000)
   - Admin dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - MinIO console: [http://localhost:9001](http://localhost:9001) (login: `minioadmin` / `minioadmin`)
   - pgAdmin: [http://localhost:5050](http://localhost:5050) (login: `admin@example.com` / `admin_secret`)

9. **Log in** with any of the demo accounts below.

10. **Build your site** — edit site settings at `/dashboard/settings`, update navigation at `/dashboard/navigation`, and design your homepage at `/dashboard/content/home`.

---

## Default Demo Credentials

All demo accounts use the same password: **`Demo1234!`**

| Email | Role | Access |
|---|---|---|
| `superadmin@example.com` | super_admin | Everything, including site settings |
| `admin@example.com` | admin | Dashboard, members, publications, newsletter |
| `editor@example.com` | editor | Posts, events, gallery, learning, media |
| `member@example.com` | member | Member centre only |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string — default local: `postgresql://cms:cms_secret@127.0.0.1:5434/cms` (note port **5434** for Docker Compose) |
| `NEXTAUTH_SECRET` | Yes | NextAuth signing secret — generate with `openssl rand -base64 32` |
| `AUTH_SECRET` | Yes | Same value as `NEXTAUTH_SECRET` (NextAuth v5 requires both) |
| `NEXTAUTH_URL` | Yes | Full public URL of the app, e.g. `https://example.com` |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `NEXTAUTH_URL` — used in client components |
| `NEXT_PUBLIC_SITE_NAME` | Yes | Display name of the site, e.g. `"My Organisation"` |
| `POSTGRES_USER` | Docker | PostgreSQL user for Docker Compose |
| `POSTGRES_PASSWORD` | Docker | PostgreSQL password for Docker Compose |
| `POSTGRES_DB` | Docker | PostgreSQL database name for Docker Compose |
| `MINIO_ENDPOINT` | Yes | MinIO hostname, e.g. `localhost` or `minio.example.com` |
| `MINIO_PORT` | Yes | MinIO API port, default `9000` |
| `MINIO_USE_SSL` | Yes | `true` in production, `false` locally |
| `MINIO_ACCESS_KEY` | Yes | MinIO access key |
| `MINIO_SECRET_KEY` | Yes | MinIO secret key |
| `MINIO_BUCKET_NAME` | Yes | Bucket name, default `cms-media` |
| `NEXT_PUBLIC_MEDIA_BASE_URL` | Yes | Public base URL for media files, e.g. `https://minio.example.com/cms-media` |
| `RESEND_API_KEY` | Yes | Resend API key for transactional email |
| `ADMIN_EMAIL` | Yes | Email address that receives contact form submissions |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics measurement ID (e.g. `G-XXXXXXXXXX`) |

---

## Project Structure

```
nextjs-cms-template/
├── src/
│   ├── app/
│   │   ├── (public)/          Public-facing pages (home, about, news, events, gallery…)
│   │   ├── (auth)/            Login, register, password reset
│   │   ├── (dashboard)/       Admin/editor dashboard (RBAC protected)
│   │   ├── (member)/          Member centre (member role required)
│   │   ├── api/               API routes (NextAuth, file upload)
│   │   ├── actions/           Server actions (posts, events, members, media…)
│   │   └── layout.tsx         Root layout — providers, metadata, theme
│   ├── components/
│   │   ├── ui/                shadcn/ui primitives
│   │   ├── layout/            Header, footer, logo
│   │   ├── home/              Homepage block components (hero, news-preview, stats-bar…)
│   │   ├── shared/            block-renderer, post-card, page-header
│   │   ├── dashboard/         Admin UI — sidebar, forms, page builder, media picker
│   │   │   └── block-editor/  Per-block-type editor components
│   │   ├── member/            Member portal UI
│   │   ├── about/             About page section renderers
│   │   └── events/            Event registration form
│   ├── lib/
│   │   ├── auth.ts            NextAuth config
│   │   ├── db.ts              Drizzle client
│   │   ├── storage.ts         MinIO client
│   │   ├── blocks.ts          Block type definitions and content schemas
│   │   ├── permissions.ts     RBAC helpers (canAccess, requireRole)
│   │   ├── email.ts           Resend email helpers
│   │   ├── server-data.ts     Server-side data fetching utilities
│   │   └── media-url.ts       MinIO URL helpers
│   └── proxy.ts               Next.js middleware (NOTE: must be proxy.ts, not middleware.ts)
├── drizzle/
│   ├── schema.ts              Complete DB schema (Drizzle + PostgreSQL)
│   ├── migrate.ts             Migration runner
│   └── seed.ts                Demo data seeder
├── infrastructure/
│   ├── docker-compose.yml     Local dev: PostgreSQL + MinIO + pgAdmin
│   ├── docker-compose.prod.yml Production Docker Compose
│   ├── nginx.conf             Nginx reverse-proxy config
│   ├── ecosystem.config.js    PM2 process config
│   └── .env.example           Infrastructure-level env vars
├── docs/
│   ├── ROUTES.md              Complete route reference
│   └── COMPONENTS.md          Component directory and annotations
├── public/
│   └── images/                Static assets (logo, placeholder)
├── .env.example               Application env vars template
└── package.json
```

---

## Key Architecture Notes

- **Middleware naming**: The Next.js middleware file is `src/proxy.ts`, not `src/middleware.ts`. Naming it `middleware.ts` breaks the Next.js 16 build in this project. Do not rename it.

- **RBAC pattern**: Roles are `super_admin > admin > editor > member`. Checks are centralised in `src/lib/permissions.ts`. Dashboard page components call `requireRole()` at the top of the server component function — there is no separate middleware-level role gate.

- **Server actions over API routes**: Almost all mutations (create post, register for event, update profile, etc.) use Next.js Server Actions defined in `src/app/actions/`. The only API routes are the NextAuth handler and the MinIO upload endpoint.

- **Page builder**: Pages (home, about, any custom page) are composed of ordered `pageBlocks` rows in the database. Each block has a `blockType` enum value and a JSON `content` field. `src/components/shared/block-renderer.tsx` maps block types to their React components and passes pre-fetched data where needed.

- **Media flow**: File uploads go `browser → POST /api/upload → MinIO`. The server action returns the object path. `src/lib/media-url.ts` constructs the full public URL from `NEXT_PUBLIC_MEDIA_BASE_URL`. The `media-picker-modal.tsx` component provides a reusable file browser backed by the `getMediaFiles` server action.

---

## Documentation

| Document | Contents |
|---|---|
| [docs/ROUTES.md](docs/ROUTES.md) | Complete route reference — public, auth, member, dashboard, and API routes |
| [docs/COMPONENTS.md](docs/COMPONENTS.md) | Component directory — every significant component with description and location |
| [docs/SEO_GUIDE.md](docs/SEO_GUIDE.md) | SEO Configuration Guide — how to configure global SEO and search visibility |

---

## Customisation

Key customisation points:

- **Branding**: Set `NEXT_PUBLIC_SITE_NAME` in your `.env`. Update `public/images/logo/` with your logo files. Edit `src/components/layout/Logo.tsx` for custom logo rendering logic.
- **Colours and typography**: Edit `src/app/globals.css` — all design tokens are CSS custom properties following the shadcn/ui convention.
- **Block content**: Seed or edit blocks via the page builder at `/dashboard/content/[page]`. Defaults are defined in `src/lib/seed-blocks.ts` and `src/lib/seed-about-blocks.ts`.
- **Navigation**: Manage header links at `/dashboard/navigation`.
- **Adding a new block type**: Add the enum value to `drizzle/schema.ts`, define the content schema in `src/lib/blocks.ts`, create the render component in `src/components/home/`, add the case to `src/components/shared/block-renderer.tsx`, and create the editor in `src/components/dashboard/block-editor/`.
- **Member specialties**: The `memberSpecialtyEnum` values are `general | specialist | associate`. Change them in `drizzle/schema.ts` and regenerate migrations if you need different categories.

---

## Available Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:up` | Start Docker infrastructure (PostgreSQL + MinIO) |
| `bun run db:down` | Stop Docker infrastructure |
| `bun run db:generate` | Generate a Drizzle migration after schema changes |
| `bun run db:migrate` | Apply pending migrations |
| `bun run db:seed` | Seed the database with demo data |

---

## Deployment

The `infrastructure/` directory contains production-ready configuration files.

1. **Docker Compose** — `infrastructure/docker-compose.prod.yml` runs the app alongside PostgreSQL and MinIO. Use `docker compose -f infrastructure/docker-compose.prod.yml up -d`.

2. **Nginx** — `infrastructure/nginx.conf` provides a reverse-proxy config with SSL termination. Replace `YOUR_DOMAIN.COM` with your actual domain and update the SSL certificate paths.

3. **PM2** — `infrastructure/ecosystem.config.js` is provided if you prefer running the Next.js process directly with PM2 instead of Docker. Run `pm2 start infrastructure/ecosystem.config.js`.

4. **Production env vars to change**:
   - `NEXTAUTH_SECRET` and `AUTH_SECRET` — generate fresh values with `openssl rand -base64 32`
   - `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` — set to your production domain
   - `MINIO_USE_SSL=true`
   - `NEXT_PUBLIC_MEDIA_BASE_URL` — set to your production MinIO public endpoint
   - `RESEND_API_KEY` — set your production Resend key
   - `DATABASE_URL` — update with production PostgreSQL credentials

5. **MinIO in production** — Create a public bucket policy on `cms-media` so that uploaded files are publicly readable. The app does not generate presigned download URLs for public media.

---

## License

MIT
