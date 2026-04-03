# GAPHTO Migration Plan
## WordPress → Next.js 16 + TypeScript + Shadcn + PostgreSQL

---

## 1. SITE AUDIT SUMMARY

**Organization:** Ghana Association of Public Health Technical Officers (GAPHTO)  
**Tagline:** "Public Health, Our Concern"  
**Founded:** 1984 (renamed GAPHTO in 2009)  
**Platform:** WordPress + WooCommerce + CiviCRM  
**Hosting Partner:** Ossy Digital Hub  
**Total Pages:** 106 indexed pages  
**Total Images:** 122+ in gallery  
**Content Span:** September 2011 – July 2025  

---

## 2. CONTENT INVENTORY

### 2.1 Public Content (Scrapeable)

| Content Type       | Count/Notes                         | Location                          |
|--------------------|-------------------------------------|-----------------------------------|
| News Articles      | 43+ articles (2011–2025)            | /gaphto-news/                     |
| Health News        | ~15 articles                        | /health-news/                     |
| Blog Posts         | ~20+ posts                          | /blog/                            |
| Leadership Profiles | 12 named executives                | /leadership/                      |
| Gallery Images     | 122+ images, 2 albums               | /gallery/                         |
| About Pages        | Background, Aims & Objectives       | /about-us/                        |
| Practice Areas     | 3 areas (Disease, HIM, Nutrition)   | Various                           |
| Contact Info       | Phone, email, address, social links | /contact-us/                      |
| GAPHTO Fund        | PDF + loan calculator config        | /gaphto-fund/                     |
| Events             | CPD events (some expired)           | /cpd-registration/                |

### 2.2 Gated Content (Requires DB or Login)
- Member directory (CiviCRM)
- Publications archive
- Member Centre portal
- User accounts / member profiles
- WooCommerce orders and products

---

## 3. DATA SCRAPING STRATEGY

### 3.1 Tools to Use
- **Primary scraper:** Custom Node.js scripts using `cheerio` + `axios` (or `playwright` for JS-rendered pages)
- **Image downloader:** `axios` stream to local files
- **PDF downloader:** Direct URL fetch
- **Output format:** JSON files per content type → import into PostgreSQL via seed scripts

### 3.2 Scraping Scripts Needed (in `/scraper` folder)

```
scraper/
├── scrape-news.ts           # /gaphto-news/ + /health-news/ + /blog/
├── scrape-leadership.ts     # /leadership/
├── scrape-gallery.ts        # /gallery/ (download images)
├── scrape-about.ts          # /about-us/ pages
├── scrape-practice-areas.ts # Disease Control, HIM, Nutrition pages
├── scrape-events.ts         # /cpd-registration/ and any event pages
├── scrape-contact.ts        # Contact info, social links
├── scrape-fund.ts           # Fund page + PDF
├── download-images.ts       # Download all scraped image URLs
└── seed-database.ts         # Import JSON output into PostgreSQL
```

### 3.3 Pagination Strategy
The site uses WordPress archive pages. Each news archive page lists posts with title, date, excerpt, and URL. Follow links to get full article content.

Pattern to follow:
```
/gaphto-news/page/2/
/gaphto-news/page/3/
... until 404
```

### 3.4 Data Output Format (JSON per type)

**Posts:**
```json
{
  "slug": "call-for-nominations-2025",
  "title": "CALL FOR NOMINATIONS: GAPHTO 2025 NATIONAL EXECUTIVE ELECTIONS",
  "content": "...",
  "excerpt": "...",
  "date": "2025-07-07",
  "category": "gaphto-news",
  "author": "GAPHTO",
  "featuredImage": "/scraped-images/posts/call-for-nominations.jpg",
  "tags": ["elections", "nominations"]
}
```

**Leadership:**
```json
{
  "name": "Mavis M. Fuseini",
  "role": "National President",
  "image": "/scraped-images/leadership/mavis.jpg",
  "facebook": null,
  "bio": "..."
}
```

---

## 4. DATABASE SCHEMA (PostgreSQL)

```sql
-- Core CMS tables (replacing WordPress)

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  avatar_url VARCHAR,
  role VARCHAR NOT NULL DEFAULT 'member', -- see roles below
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR UNIQUE NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category VARCHAR NOT NULL, -- 'news', 'health-news', 'blog', 'announcement'
  status VARCHAR DEFAULT 'published', -- 'draft', 'published', 'archived'
  featured_image VARCHAR,
  author_id UUID REFERENCES users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR UNIQUE NOT NULL,
  slug VARCHAR UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT,
  location VARCHAR,
  is_online BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  price_ghs DECIMAL(10, 2) DEFAULT 0,
  max_attendees INT,
  status VARCHAR DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'past', 'cancelled'
  featured_image VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  payment_status VARCHAR DEFAULT 'pending',
  registered_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  image_url VARCHAR,
  bio TEXT,
  facebook_url VARCHAR,
  twitter_url VARCHAR,
  email VARCHAR,
  sort_order INT DEFAULT 0,
  term_start DATE,
  term_end DATE,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT,
  cover_image VARCHAR,
  event_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  url VARCHAR NOT NULL,
  caption VARCHAR,
  alt_text VARCHAR,
  sort_order INT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT,
  file_url VARCHAR,
  file_type VARCHAR, -- 'pdf', 'doc', etc.
  is_member_only BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  member_number VARCHAR UNIQUE,
  specialty VARCHAR, -- 'disease-control', 'health-info', 'nutrition'
  region VARCHAR,
  facility VARCHAR,
  joined_date DATE,
  membership_status VARCHAR DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  dues_paid_until DATE
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  visible_to VARCHAR DEFAULT 'public', -- 'public', 'members', 'executives'
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  subject VARCHAR,
  message TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Roles reference:
-- super_admin  → full system access
-- admin        → content + member management
-- editor       → create/edit/publish posts, events
-- member       → logged-in member, gated content access
-- public       → unauthenticated (no record)
```

---

## 5. NEXT.JS APPLICATION ARCHITECTURE

### 5.1 Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** Shadcn/ui + Tailwind CSS
- **Database ORM:** Prisma (PostgreSQL)
- **Auth:** NextAuth.js v5 (credentials + email magic link)
- **File Storage:** Local `/public/uploads` → later migrate to S3/Cloudinary
- **Email:** Resend or Nodemailer
- **Docker:** PostgreSQL via docker-compose

### 5.2 Project Structure
```
gaphto-app/
├── app/
│   ├── (public)/                    # Public routes
│   │   ├── page.tsx                 # Homepage
│   │   ├── about/page.tsx
│   │   ├── about/background/page.tsx
│   │   ├── about/aims-objectives/page.tsx
│   │   ├── leadership/page.tsx
│   │   ├── news/page.tsx
│   │   ├── news/[slug]/page.tsx
│   │   ├── health-news/page.tsx
│   │   ├── health-news/[slug]/page.tsx
│   │   ├── events/page.tsx
│   │   ├── events/[slug]/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── gallery/[album]/page.tsx
│   │   ├── practice-areas/page.tsx
│   │   ├── gaphto-fund/page.tsx
│   │   ├── contact/page.tsx
│   │   └── publications/page.tsx
│   │
│   ├── (auth)/                      # Auth routes
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (member)/                    # Logged-in member area
│   │   ├── member-centre/page.tsx
│   │   └── publications/page.tsx    # Gated publications
│   │
│   ├── (dashboard)/                 # Admin dashboard
│   │   ├── layout.tsx               # Dashboard shell + sidebar
│   │   ├── dashboard/page.tsx       # Overview/stats
│   │   ├── posts/
│   │   │   ├── page.tsx             # List all posts
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── events/
│   │   ├── members/
│   │   ├── leadership/
│   │   ├── gallery/
│   │   ├── publications/
│   │   ├── announcements/
│   │   ├── contact-submissions/
│   │   └── settings/
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── posts/route.ts
│       ├── events/route.ts
│       ├── members/route.ts
│       ├── contact/route.ts
│       ├── upload/route.ts
│       └── ...
│
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── mobile-nav.tsx
│   ├── ui/                          # Shadcn components
│   ├── public/
│   │   ├── hero-carousel.tsx        # Homepage hero
│   │   ├── news-card.tsx
│   │   ├── event-card.tsx
│   │   ├── leadership-card.tsx
│   │   ├── gallery-lightbox.tsx
│   │   └── loan-calculator.tsx
│   └── dashboard/
│       ├── sidebar.tsx
│       ├── stats-card.tsx
│       ├── rich-text-editor.tsx     # TipTap or similar
│       └── data-table.tsx
│
├── lib/
│   ├── auth.ts                      # NextAuth config
│   ├── prisma.ts                    # Prisma client
│   ├── permissions.ts               # RBAC helpers
│   └── utils.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                      # Import scraped JSON
│
├── scraper/                         # Standalone scraping scripts
│   └── ...
│
└── docker-compose.yml
```

---

## 6. ROLES & PERMISSIONS SYSTEM

### 6.1 Role Hierarchy
```
super_admin
  └── admin
        └── editor
              └── member
                    └── (public/unauthenticated)
```

### 6.2 Permission Matrix

| Resource               | public | member | editor | admin | super_admin |
|------------------------|--------|--------|--------|-------|-------------|
| View public posts      | ✓      | ✓      | ✓      | ✓     | ✓           |
| View member publications| ✗     | ✓      | ✓      | ✓     | ✓           |
| Create/edit posts      | ✗      | ✗      | ✓      | ✓     | ✓           |
| Publish posts          | ✗      | ✗      | ✓      | ✓     | ✓           |
| Manage events          | ✗      | ✗      | ✓      | ✓     | ✓           |
| Manage gallery         | ✗      | ✗      | ✓      | ✓     | ✓           |
| Manage members         | ✗      | ✗      | ✗      | ✓     | ✓           |
| Manage leadership      | ✗      | ✗      | ✗      | ✓     | ✓           |
| View contact inbox     | ✗      | ✗      | ✗      | ✓     | ✓           |
| Manage roles/users     | ✗      | ✗      | ✗      | ✗     | ✓           |
| System settings        | ✗      | ✗      | ✗      | ✗     | ✓           |

### 6.3 Implementation
- Middleware-based route protection for `/dashboard/**` and `/(member)/**`
- `lib/permissions.ts` exports `can(user, action, resource)` helper
- Server Components check permissions before rendering sensitive data
- API routes validate session + role before mutating data

---

## 7. HOMEPAGE SHOWCASE DESIGN

### 7.1 Sections (Top to Bottom)
1. **Hero** — Full-width carousel with 3–5 slides (latest announcements/events), animated text overlay, CTA buttons ("Join GAPHTO", "Learn More")
2. **Stats Bar** — Animated counters: Members, Years Active, Practice Areas, Regions
3. **Latest News** — 3-column card grid with category badge, date, title, excerpt
4. **Upcoming Events** — Horizontal scroll or card list, event date chip, registration CTA
5. **Practice Areas** — 3 icon cards (Disease Control, HIM, Nutrition) with hover animation
6. **Leadership Preview** — Avatar grid of 6 executives with name + role
7. **Gallery Teaser** — Masonry or filmstrip of latest 6 gallery images
8. **About / Mission** — Split layout: text left, image right with quote highlight
9. **GAPHTO Fund CTA** — Highlighted card with loan calculator link
10. **Footer** — Links, contact info, social media icons

### 7.2 Animation Strategy
- Hero carousel: auto-advance with smooth crossfade (Embla or Swiper)
- Section reveals: `framer-motion` scroll-triggered fade-in-up
- Stats counter: count-up animation when in viewport
- Gallery: lightbox with keyboard navigation
- Cards: subtle scale/shadow on hover

---

## 8. DOCKER COMPOSE SETUP

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: gaphto_db
    environment:
      POSTGRES_USER: gaphto
      POSTGRES_PASSWORD: gaphto_secret
      POSTGRES_DB: gaphto
    ports:
      - "5432:5432"
    volumes:
      - gaphto_pgdata:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    container_name: gaphto_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@gaphto.org
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  gaphto_pgdata:
```

---

## 9. PHASED IMPLEMENTATION PLAN

### Phase 0 — Setup & Scraping (Current Focus)
- [ ] Initialize docker-compose (PostgreSQL)
- [ ] Create `/scraper` Node.js project with TypeScript
- [ ] Scrape all public content (news, leadership, gallery, about, events)
- [ ] Download all images to local `/scraped-assets/`
- [ ] Output structured JSON files per content type
- [ ] Write seed scripts to load data into PostgreSQL

### Phase 1 — Showcase (Public Site)
- [ ] User sets up Next.js 16 project with Shadcn + Tailwind
- [ ] Configure Prisma + PostgreSQL connection
- [ ] Run seed script to populate database
- [ ] Build homepage with hero carousel, news section, leadership, gallery
- [ ] Build News listing + article detail pages
- [ ] Build Leadership page
- [ ] Build Gallery with albums + lightbox
- [ ] Build About / Aims & Objectives pages
- [ ] Build GAPHTO Fund page + loan calculator component
- [ ] Build Contact page with form
- [ ] Build Events listing page
- [ ] Responsive design + animations

### Phase 2 — Auth & Member Area
- [ ] NextAuth.js v5 setup (credentials login)
- [ ] Registration flow
- [ ] Member Centre dashboard (view own profile, access publications)
- [ ] Gated publications page

### Phase 3 — Admin Dashboard / CMS
- [ ] Dashboard layout + sidebar navigation
- [ ] Posts CMS (create/edit/publish with rich text editor)
- [ ] Events management
- [ ] Gallery management (upload, organize albums)
- [ ] Member management table
- [ ] Leadership management
- [ ] Publications management
- [ ] Contact submissions inbox
- [ ] Announcements/notices manager
- [ ] Role-based access control enforcement

### Phase 4 — Database Migration (when DB provided)
- [ ] Receive actual WordPress MySQL dump
- [ ] Map WordPress tables → Prisma schema
- [ ] Write migration transform scripts
- [ ] Verify data integrity
- [ ] Cut over to migrated data

### Phase 5 — Advanced Features
- [ ] GAPHTO Fund loan application flow
- [ ] Online payment integration (Ghana payment gateway)
- [ ] CPD event registration + ticketing
- [ ] Email notification system
- [ ] Member directory (searchable)
- [ ] SEO + sitemap generation
- [ ] Analytics integration

---

## 10. SCRAPING PRIORITY ORDER

Start with these pages — all publicly accessible with stable HTML:

1. `/leadership/` — structured, small, high-value for showcase
2. `/gaphto-news/` + paginated archives — primary news content
3. `/health-news/` — secondary news
4. `/blog/` — blog posts
5. `/gallery/` — image albums (download all)
6. `/about-us/background/` + `/about-us/aims-objectives/`
7. `/disease-control-prevention/` + `/health-information-management/` + `/nutrition/`
8. `/contact-us/` — extract contact details
9. `/gaphto-fund/` — fund info + PDF link
10. Individual article pages (follow links from step 2–4)

---

## 11. KEY DECISIONS & NOTES

- **No WooCommerce replacement in Phase 1** — the shop had no products visible; defer to Phase 5
- **CiviCRM replacement** — build a custom member management module in Phase 3
- **Publications** — gate behind `member` role; metadata scraped but PDFs need DB migration
- **Images** — store in `/public/uploads/` initially; plan for object storage later
- **GAPHTO Journal** — 404 on current site, likely in DB; defer to Phase 4
- **Nominations/elections** — model as a special `announcement` type with deadline
- **Loan calculator** — pure frontend component, no backend needed in Phase 1
- **Multi-region support** — Ghana has 16 regions; member profiles should store region
