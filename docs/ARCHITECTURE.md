# Architecture Reference

> Next.js 16 + TypeScript CMS and membership platform template.
> Stack: NextAuth v5, Drizzle ORM, PostgreSQL, MinIO, shadcn/ui, Tailwind CSS v4.

---

## Table of Contents

1. [Auth Flow](#auth-flow)
2. [RBAC](#rbac)
3. [Page Builder](#page-builder)
4. [Media Upload Flow](#media-upload-flow)
5. [Database](#database)
6. [Key Architectural Rules](#key-architectural-rules)

---

## Auth Flow

### Strategy

NextAuth v5 with the **JWT session strategy**. There is no database session table — the session lives entirely in a signed JWT cookie.

### Split Config: `auth.config.ts` vs `auth.ts`

| File | Purpose |
|---|---|
| `src/auth.config.ts` | Edge-compatible config (no Node.js built-ins). Used by `src/proxy.ts` |
| `src/auth.ts` | Full auth with bcrypt + DB queries. Used by Server Components and Server Actions |

This split is required because the route protection layer (`src/proxy.ts`) runs in the Next.js Edge Runtime, which cannot import `bcrypt` or the `pg` driver.

### Login Flow

1. User submits email + password to the NextAuth Credentials provider
2. `authorize()` in `src/auth.ts` fetches the user row from the `users` table
3. `bcrypt.compare()` validates the password hash
4. On success, returns `{ id, email, name, role }` — NextAuth issues a JWT
5. The `jwt` callback stamps `token.id`, `token.role`, and `token.tv` (current `tokenVersion` fetched from DB) into the token
6. The `session` callback copies those values to `session.user`

### tokenVersion Invalidation

Every row in `users` has a `tokenVersion INTEGER NOT NULL DEFAULT 0` column.

On every JWT refresh (i.e., every request that reads the session), the `jwt` callback in `src/auth.ts` re-fetches `tokenVersion` from the database and compares it to `token.tv`:

```ts
// src/auth.ts — jwt callback (refresh path)
if (token.id) {
  const [dbUser] = await db
    .select({ tokenVersion: users.tokenVersion })
    .from(users)
    .where(eq(users.id, token.id as string))
    .limit(1)
  if (!dbUser || dbUser.tokenVersion !== token.tv) {
    return null  // invalidates the session
  }
}
```

**To force-logout a user:** increment their `tokenVersion` in the DB (e.g., after a password reset or admin-initiated ban). Their existing JWT becomes invalid on the next request, even though the cookie still exists.

This is used in `src/app/actions/auth.ts` after a password reset completes.

### src/proxy.ts — Route Protection

**Critical:** The file is named `proxy.ts`, NOT `middleware.ts`.

Next.js 16 changed how `middleware.ts` is resolved and compiled. Creating a file at `src/middleware.ts` in this project **breaks the build**. The workaround is to use a differently-named file that re-exports a default handler and a `config` export — Next.js picks it up as the middleware entry point through the `src/proxy.ts` convention.

> Rule: **Never rename `src/proxy.ts` to `src/middleware.ts`.**

The file imports `NextAuth(authConfig)` (edge-safe) and wraps the handler:

```ts
// src/proxy.ts
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // route protection logic
})

export const config = {
  matcher: ['/dashboard/:path*', '/member-centre/:path*', '/publications/:path*'],
}
```

### Route Protection Matrix

| Path pattern | Condition | Redirect |
|---|---|---|
| `/dashboard/*` | Not logged in | `/login` |
| `/dashboard/*` | Logged in but role is `member` | `/member-centre` |
| `/member-centre/*` | Not logged in | `/login?callbackUrl=...` |
| `/publications/*` | Not logged in | `/login?callbackUrl=...` |
| Everything else | — | No restriction |

Note: proxy.ts enforces path-level access only. Fine-grained action permissions are enforced separately in Server Actions via the `can()` function.

---

## RBAC

### Role Hierarchy

```
super_admin > admin > editor > member
```

Roles are stored in the `users.role` column (PostgreSQL enum `role`).

### The `can()` Function

`src/lib/permissions.ts` exports a simple matrix-based guard:

```ts
export const can = (role: Role, action: string): boolean => {
  return matrix[action]?.includes(role) ?? false
}
```

Usage in a Server Action:

```ts
'use server'
import { auth } from '@/auth'
import { can } from '@/lib/permissions'

export async function createPost(data: PostInput) {
  const session = await auth()
  if (!session || !can(session.user.role, 'posts:create')) {
    throw new Error('Forbidden')
  }
  // ... proceed
}
```

### Full Permission Matrix

| Action | super_admin | admin | editor | member |
|---|:---:|:---:|:---:|:---:|
| `posts:create` | Y | Y | Y | — |
| `posts:edit_any` | Y | Y | — | — |
| `posts:delete` | Y | Y | — | — |
| `posts:publish` | Y | Y | Y | — |
| `members:manage` | Y | Y | — | — |
| `leadership:manage` | Y | Y | — | — |
| `events:manage` | Y | Y | Y | — |
| `gallery:manage` | Y | Y | Y | — |
| `publications:manage` | Y | Y | — | — |
| `contact:view` | Y | Y | — | — |
| `settings:manage` | Y | — | — | — |
| `learning:manage` | Y | Y | Y | — |
| `newsletter:manage` | Y | Y | — | — |
| `navigation:manage` | Y | Y | — | — |
| `announcements:manage` | Y | Y | Y | — |

### Where Permissions Are Enforced

| Layer | Mechanism |
|---|---|
| Route level | `src/proxy.ts` — blocks unauthenticated or insufficiently-privileged users from reaching `/dashboard/*` at all |
| Dashboard layout | `src/app/(dashboard)/layout.tsx` — server component that checks session role and can further restrict sub-sections |
| Server Actions | Every action in `src/app/actions/` calls `auth()` and `can(role, action)` at the top before any DB writes |

---

## Page Builder

### How Blocks Work

Pages are built from a list of **blocks** stored in the `page_blocks` table. Each block has:

- `page` — which page it belongs to (e.g., `'homepage'`, `'about'`)
- `type` — a `blockTypeEnum` value (e.g., `'hero'`, `'stats_bar'`)
- `content` — a JSON string whose shape matches the TypeScript content type for that block type
- `sortOrder` — integer for drag-and-drop ordering
- `isVisible` — toggle to show/hide without deleting

At render time, `src/components/shared/block-renderer.tsx` receives the block rows and a `pageContext` (`"homepage"` | `"about"` | `"subpage"`), then dispatches each block type to the corresponding React component.

### All 13 Block Types

Defined in `drizzle/schema.ts` (`blockTypeEnum`) and typed in `src/lib/blocks.ts`:

| Block type | Content type | Description |
|---|---|---|
| `hero` | `HeroContent` | Full-width hero; supports 4 templates (`carousel`, `centered`, `split`, `bold`) |
| `stats_bar` | `StatsBarContent` | Animated stat counters (`{ count, suffix, label }[]`) |
| `rich_text` | `RichTextContent` | Formatted text with optional heading; supports `generic`, `background`, `vision_mission` variants |
| `objectives_list` | `ObjectivesContent` | Numbered list of objectives |
| `timeline` | `TimelineContent` | Chronological entries (`{ year, title, description }[]`) |
| `features_grid` | `FeaturesGridContent` | Card grid of feature/service items (`{ title, description }[]`) |
| `news_preview` | `NewsPreviewContent` | Latest posts section (`{ heading, count }`) |
| `events_preview` | `EventsPreviewContent` | Upcoming events section (`{ heading, count }`) |
| `leadership_preview` | `LeadershipPreviewContent` | Team member showcase (`{ heading, count }`) |
| `gallery_teaser` | `GalleryTeaserContent` | Photo gallery section; can filter by album slugs |
| `image_banner` | `ImageBannerContent` | Full-width image with optional caption |
| `about_preview` | `AboutPreviewContent` | Two-column about section with image and CTA link |
| `cta_section` | `CtaSectionContent` | Call-to-action banner with heading, subtitle, and button |

### Adding a New Block Type

Follow these steps in order:

**1. Add the enum value to the schema**

```ts
// drizzle/schema.ts
export const blockTypeEnum = pgEnum('block_type', [
  // ... existing values ...
  'my_new_block',
])
```

**2. Run migrations**

```bash
bun run db:generate
bun run db:migrate
```

**3. Add the content type to `src/lib/blocks.ts`**

```ts
export type MyNewBlockContent = {
  heading: string
  // ... your fields
}

// Add to the BlockContent union:
export type BlockContent =
  | HeroContent | /* ... */ | MyNewBlockContent
```

**4. Create a block editor component**

Create `src/components/dashboard/block-editor/my-new-block-editor.tsx`. Export a component that accepts `blockId`, `initialContent`, and `onSave`.

**5. Register in `block-editor-shell.tsx`**

- Import the new editor component
- Add a `case 'my_new_block':` to `renderEditor()`
- Add `my_new_block: 'My New Block'` to `BLOCK_TYPE_LABELS`

**6. Add a rendering case in `block-renderer.tsx`**

Add a `case 'my_new_block':` to `renderHomepageBlock()` (and optionally `renderAboutBlock()` for the about page context).

**7. Add default content in `page-builder-client.tsx`**

Add to both `BLOCK_TYPE_LABELS` (the add-block catalogue) and the `DEFAULT_CONTENT` map used when creating a new block of this type.

---

## Media Upload Flow

### Overview

```
Client form
  → POST /api/upload (multipart/form-data)
    → auth() — must be logged in
    → can(role, 'posts:create') — editor or above
    → validate MIME type and file size
    → uploadFile(key, buffer, mimeType) in src/lib/storage.ts
      → MinIO client.putObject(bucket, key, buffer)
      → returns public URL
    → db.insert(mediaFiles) — saves metadata
  ← { url, id }
```

### File Size Limits

| Type | Limit |
|---|---|
| Images | 10 MB |
| Videos | 200 MB |
| Documents / other | 20 MB |

### Storage Keys and Prefixes

Keys are prefixed by type and include a timestamp + random suffix:

- Images: `uploads/{timestamp}-{random}.{ext}`
- Videos: `videos/{timestamp}-{random}.{ext}`
- Documents: `documents/{timestamp}-{random}.{ext}`

### URL Resolution

`src/lib/media-url.ts` exports `getMediaUrl(url)`:

- Full URLs (`http://...`, `https://...`) — returned as-is
- Root-relative paths (`/images/...`) — returned as-is
- Bare keys — prefixed with `NEXT_PUBLIC_MEDIA_BASE_URL` (default: `http://localhost:9000/cms-media`)
- `null` / `undefined` — returns `/images/placeholder.jpg`

### MinIO Bucket Policy

On first use, `ensureBucket()` in `src/lib/storage.ts` creates the `cms-media` bucket and sets a public-read S3 policy so object URLs are accessible without presigned tokens.

---

## Database

### ORM

Drizzle ORM, schema-first. All tables and types are defined in `drizzle/schema.ts`. The template ships with a single baseline migration under `drizzle/migrations/`.

**Commands:**

```bash
bun run db:generate   # generate a new migration from schema changes
bun run db:migrate    # apply pending migrations
bun run db:seed       # seed demo data (drizzle/seed.ts)
```

### Tables by Category

**Auth / Users**

| Table | Description |
|---|---|
| `users` | Accounts with role, passwordHash, tokenVersion |

**Content**

| Table | Description |
|---|---|
| `posts` | Blog/news/announcement posts with status and category |
| `tags` | Reusable post tags |
| `post_tags` | Many-to-many join: posts ↔ tags |
| `events` | Events with price, dates, and registration config |
| `eventRegistrations` | Registrations with paymentStatus |
| `publications` | PDFs / documents, optionally member-only |
| `announcements` | Pinned or timed announcements |

**Members**

| Table | Description |
|---|---|
| `members` | Extended profile: memberNumber, specialty, region, facility, lat/lng |
| `emailPreferences` | Per-user newsletter and event alert opt-ins |

**Leadership**

| Table | Description |
|---|---|
| `leadership` | Team members with sortOrder, term dates, social links |

**Gallery**

| Table | Description |
|---|---|
| `galleryAlbums` | Photo albums with slug and cover image |
| `galleryImages` | Individual images belonging to an album |

**Media**

| Table | Description |
|---|---|
| `mediaFiles` | MinIO object metadata: key, MIME type, size, altText, category |

**Page Builder**

| Table | Description |
|---|---|
| `pageBlocks` | Blocks belonging to a named page, with type, content JSON, sortOrder, isVisible |

**Learning (LMS)**

| Table | Description |
|---|---|
| `courses` | Courses with level, status, instructor |
| `lessons` | Lessons belonging to a course |
| `courseEnrollments` | User-course enrollment records |
| `lessonCompletions` | Per-user lesson completion tracking |

**Communications**

| Table | Description |
|---|---|
| `newsletters` | Newsletter drafts and sent records |
| `contactSubmissions` | Contact form submissions |

**Config / Audit**

| Table | Description |
|---|---|
| `siteSettings` | Key/value store for admin-configurable settings |
| `navigationLinks` | Top-nav link management |
| `auditLogs` | Action log with userId, action string, metadata JSON |

---

## Key Architectural Rules

### 1. Never rename `src/proxy.ts`

`src/proxy.ts` must **never** be renamed to `src/middleware.ts`. Next.js 16 middleware resolution changed; `middleware.ts` breaks the build in this project. The file's current name is intentional.

### 2. Server Actions always check permissions first

Every file in `src/app/actions/` uses the `'use server'` directive. The first thing each exported function does is call `auth()` and `can(role, action)`:

```ts
'use server'
const session = await auth()
if (!session || !can(session.user.role as Role, 'some:action')) {
  throw new Error('Forbidden')
}
```

Never add business logic before the permission check.

### 3. DB is the primary data source

`src/lib/data.ts` contains helper functions that query the database and return typed results. There is no scraped or static JSON data. All functions return empty arrays / null as fallbacks when the database has no rows — the UI handles empty states gracefully.

### 4. No `middleware.ts` — proxy.ts only

Related to rule 1: do not create any file named `middleware.ts` anywhere under `src/`. If you need to add new protected routes, edit the `matcher` array and the handler logic in `src/proxy.ts`.
