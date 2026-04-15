# Route Reference

Complete route map for the Next.js CMS Template. Route groups (`(public)`, `(auth)`, `(member)`, `(dashboard)`) are Next.js layout groups and do not appear in the URL.

---

## Public Routes — `/(public)/`

These routes are accessible without authentication. Some pages (e.g. `/publications`) display a subset of content to guests and gate member-only items.

| Route | Description | Auth Required |
|---|---|---|
| `/` | Homepage — rendered from page builder blocks | No |
| `/about` | About page — rendered from page builder blocks | No |
| `/news` | News/blog listing with category filter (`news`, `blog`, `announcement`) | No |
| `/news/[slug]` | Post detail page with full rich-text body | No |
| `/blog` | Blog listing — alias view filtered to `blog` category | No |
| `/events` | Events listing — upcoming and past tabs | No |
| `/events/[slug]` | Event detail with registration form | No |
| `/gallery` | Gallery albums grid with lightbox viewer | No |
| `/leadership` | Leadership profiles grid | No |
| `/leadership/[id]` | Leadership profile detail | No |
| `/publications` | Publications listing — member-only items are gated with a prompt | No |
| `/publications/[slug]` | Publication detail page | No |
| `/contact` | Contact form | No |

---

## Auth Routes — `/(auth)/`

Unauthenticated-only pages. Authenticated users are redirected away by middleware.

| Route | Description | Auth Required |
|---|---|---|
| `/login` | Email + password login via NextAuth v5 | No |
| `/register` | New member self-registration | No |
| `/forgot-password` | Request a password-reset email | No |
| `/reset-password` | Set a new password via emailed token | No |

---

## Member Routes — `/(member)/`

Protected routes requiring at minimum the `member` role. Unauthenticated visitors are redirected to `/login`.

| Route | Description | Min Role |
|---|---|---|
| `/member-centre` | Member dashboard home — recent activity, quick links | member |
| `/member-centre/directory` | Searchable and filterable member directory | member |
| `/member-centre/profile` | Edit profile (name, bio, specialty, region) + change password | member |
| `/member-centre/learning` | Course catalogue | member |
| `/member-centre/learning/[slug]` | Course overview page | member |
| `/member-centre/learning/[slug]/[lessonSlug]` | Lesson viewer | member |
| `/member-centre/publications` | Member-only publications library | member |

---

## Dashboard Routes — `/(dashboard)/dashboard/`

Admin and editor backend. All routes require at minimum the `editor` role. Rows marked `admin+` require `admin` or `super_admin`. Rows marked `super_admin` require the top-level role only.

| Route | Description | Min Role |
|---|---|---|
| `/dashboard` | Stats overview — posts, events, members, enrolments | editor |
| `/dashboard/posts` | Post list with category filter and status | editor |
| `/dashboard/posts/new` | Create post (TipTap rich-text editor) | editor |
| `/dashboard/posts/[id]/edit` | Edit post | editor |
| `/dashboard/news` | News management view | editor |
| `/dashboard/events` | Event list | editor |
| `/dashboard/events/new` | Create event | editor |
| `/dashboard/events/[id]/edit` | Edit event | editor |
| `/dashboard/events/[id]/registrations` | View and export event registrations | admin |
| `/dashboard/gallery` | Gallery albums list | editor |
| `/dashboard/gallery/new` | Create album | editor |
| `/dashboard/gallery/[id]` | Album detail + image upload/reorder manager | editor |
| `/dashboard/publications` | Publications list | admin |
| `/dashboard/publications/new` | Create publication | admin |
| `/dashboard/publications/[id]/edit` | Edit publication | admin |
| `/dashboard/leadership` | Leadership profiles list | admin |
| `/dashboard/leadership/new` | Create leadership profile | admin |
| `/dashboard/leadership/[id]/edit` | Edit leadership profile | admin |
| `/dashboard/members` | Member directory with map view | admin |
| `/dashboard/members/[id]` | Member detail — status toggle, role management | admin |
| `/dashboard/learning` | Course list | editor |
| `/dashboard/learning/new` | Create course | editor |
| `/dashboard/learning/[id]/edit` | Edit course metadata | editor |
| `/dashboard/learning/[id]/lessons` | Lessons list for a course | editor |
| `/dashboard/learning/[id]/lessons/new` | Create lesson | editor |
| `/dashboard/learning/[id]/lessons/[lessonId]/edit` | Edit lesson | editor |
| `/dashboard/learning/analytics` | Enrolment analytics table | admin |
| `/dashboard/newsletter` | Newsletter list | admin |
| `/dashboard/newsletter/new` | Compose newsletter | admin |
| `/dashboard/newsletter/[id]` | View newsletter | admin |
| `/dashboard/newsletter/[id]/edit` | Edit newsletter | admin |
| `/dashboard/announcements` | Announcements — create/delete banner announcements | editor |
| `/dashboard/contact` | Contact submissions inbox | admin |
| `/dashboard/content` | Page builder landing (select a page) | admin |
| `/dashboard/content/[page]` | Visual page builder for the selected page | admin |
| `/dashboard/media` | Media library — upload, browse, delete MinIO files | editor |
| `/dashboard/navigation` | Drag-and-drop navigation link manager | admin |
| `/dashboard/settings` | Site settings (name, contact email, social links) | super_admin |

---

## API Routes

| Method | Route | Description |
|---|---|---|
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth v5 catch-all handler (login, logout, session, CSRF) |
| `POST` | `/api/upload` | Multipart file upload to MinIO; returns public media URL |

---

## Role Hierarchy

```
super_admin  >  admin  >  editor  >  member
```

Each role inherits access to everything below it. Role checks are enforced in `src/lib/permissions.ts` and applied per-route via server-side session checks (not just middleware).

---

## Notes

- **Middleware / proxy**: The middleware file is named `src/proxy.ts` (not `src/middleware.ts`) to avoid a Next.js 16 build issue. Do not rename it.
- **Page builder pages**: `/`, `/about`, and any page managed via `/dashboard/content/[page]` render dynamically from the `pages` + `pageBlocks` tables.
- **Slug generation**: Post, event, and publication slugs are auto-generated from the title on creation and are URL-safe lowercase strings.
