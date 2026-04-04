# TASK BRIEF — Agent 2: Phase 3 Data Management CMS
> Read AGENT_CONTEXT.md: /home/kelib/Desktop/moreprojects/gaphto/plans/AGENT_CONTEXT.md
> Work in: /home/kelib/Desktop/moreprojects/gaphto/

---

## YOUR SCOPE
Build all data-management CMS sections inside the dashboard:
- Members management
- Leadership CRUD
- Events CRUD
- Gallery management
- Publications management

**Assume Agent 1 has built (or is building):**
- `src/app/(dashboard)/layout.tsx` — dashboard shell
- `src/components/dashboard/sidebar.tsx`
- `src/components/dashboard/topbar.tsx`
- `src/lib/permissions.ts` — `can(role, action)` helper
- Shadcn table, form, textarea, switch, sheet, scroll-area installed

If any of those don't exist when you start, create stubs.

**DO NOT touch:**
- src/app/(dashboard)/dashboard/page.tsx
- src/app/(dashboard)/dashboard/posts/**
- src/app/(dashboard)/dashboard/announcements/**
- src/app/(dashboard)/dashboard/contact/**
- src/app/(dashboard)/dashboard/settings/**

---

## STEP 0 — Install additional packages if missing
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx shadcn@latest add table textarea switch tabs scroll-area sheet
```

---

## STEP 1 — Members management

### `src/app/(dashboard)/dashboard/members/page.tsx`
Server component — fetch all members with joined user data.

Shadcn `<Table>` columns: Member #, Name, Email, Specialty, Region, Status, Joined, Actions

Features:
- Search by name or email (client-side)
- Filter by status: All | Active | Inactive | Suspended
- Filter by specialty
- Status badge: Active (green) / Inactive (gray) / Suspended (red)
- Actions: View profile, Toggle status (admin+ only via `can(role, 'members:manage')`)
- Pagination: 20 per page

### `src/app/(dashboard)/dashboard/members/[id]/page.tsx`
Member detail view:
- Full profile card (all fields)
- User account info (email, role, created at)
- Status change dropdown (admin+)
- Membership history placeholder

### API: `src/app/api/members/[id]/route.ts`
- PATCH: update membershipStatus (admin+ only)

---

## STEP 2 — Leadership management

### `src/app/(dashboard)/dashboard/leadership/page.tsx`
Table: Sort Order, Photo, Name, Role, Active, Actions (Edit, Delete).
- Drag-to-reorder hint (show sort arrows ↑↓ to manually adjust sortOrder)
- "Add Member" button → /dashboard/leadership/new
- Toggle active/inactive (Switch)

### `src/app/(dashboard)/dashboard/leadership/new/page.tsx`
### `src/app/(dashboard)/dashboard/leadership/[id]/edit/page.tsx`

Both render `<LeadershipForm leader?={leader} />`:

### `src/components/dashboard/leadership-form.tsx` — `'use client'`
Fields:
- Name (required)
- Role/Title (required)
- Sort Order (number input)
- Photo upload (file input → /api/upload, show preview)
- Bio (textarea)
- Facebook URL
- Twitter URL
- Email
- Is Active (Switch)
- Term Start / Term End (date inputs)

Save → POST/PATCH to /api/leadership

### API: `src/app/api/leadership/route.ts` — GET, POST
### API: `src/app/api/leadership/[id]/route.ts` — PATCH, DELETE

---

## STEP 3 — Events management

### `src/app/(dashboard)/dashboard/events/page.tsx`
Table: Title, Status chip, Start Date, Price, Online/Physical badge, Registrations count, Actions.
- Status filter: All | Upcoming | Ongoing | Past | Cancelled
- "New Event" button

### `src/app/(dashboard)/dashboard/events/new/page.tsx`
### `src/app/(dashboard)/dashboard/events/[id]/edit/page.tsx`

Both render `<EventForm event?={event} />`:

### `src/components/dashboard/event-form.tsx` — `'use client'`
Fields:
- Title (required)
- Description (Textarea, multi-line)
- Location (text) + Is Online (Switch) — show/hide location based on isOnline
- Start Date + End Date (datetime-local inputs)
- Registration Deadline (date input)
- Price GHS (number, 0 = free)
- Max Attendees (number, optional)
- Status select (upcoming / ongoing / past / cancelled)
- Featured Image (file upload)

### Registrations view: `src/app/(dashboard)/dashboard/events/[id]/registrations/page.tsx`
Table of all registrations for this event: Name, Email, Phone, Payment Status, Registered At.
Export as CSV button (client-side: convert array to CSV blob download).

### API: `src/app/api/events/route.ts` — GET, POST
### API: `src/app/api/events/[id]/route.ts` — PATCH, DELETE

---

## STEP 4 — Gallery management

### `src/app/(dashboard)/dashboard/gallery/page.tsx`
Album cards grid (not a table):
- Each album: cover image thumbnail, title, image count, event date, Edit/Delete buttons
- "New Album" button → /dashboard/gallery/new

### `src/app/(dashboard)/dashboard/gallery/new/page.tsx`
### `src/app/(dashboard)/dashboard/gallery/[id]/page.tsx` — album detail + image management

Album form fields: Title, Slug (auto from title), Description, Event Date.

Image management section (within album detail page):
- Grid of current images with caption + delete button overlay
- "Upload Images" — multi-file input
  - On select: POST each file to /api/upload, then POST to /api/gallery/[albumId]/images
  - Show upload progress per file
- Reorder by drag (simplification: use ↑↓ sort buttons)
- Edit caption inline (click to edit text)

### API: `src/app/api/gallery/route.ts` — GET, POST (create album)
### API: `src/app/api/gallery/[id]/route.ts` — PATCH, DELETE album
### API: `src/app/api/gallery/[id]/images/route.ts` — POST (add image), GET (list images)
### API: `src/app/api/gallery/[id]/images/[imageId]/route.ts` — PATCH (caption/order), DELETE

---

## STEP 5 — Publications management

### `src/app/(dashboard)/dashboard/publications/page.tsx`
Table: Title, Type, Year, Member Only badge, File URL, Actions.
- "New Publication" button

### `src/app/(dashboard)/dashboard/publications/new/page.tsx`
### `src/app/(dashboard)/dashboard/publications/[id]/edit/page.tsx`

Both render `<PublicationForm publication?={pub} />`:

### `src/components/dashboard/publication-form.tsx` — `'use client'`
Fields:
- Title (required)
- Description (textarea)
- File Upload (PDF/DOC) → /api/upload, store URL
- File Type (auto-detected from extension, or select: pdf/doc/xlsx)
- Published At (date input)
- Is Member Only (Switch, default true)

### API: `src/app/api/publications/route.ts` — GET, POST
### API: `src/app/api/publications/[id]/route.ts` — PATCH, DELETE

---

## STEP 6 — Shared dashboard component: `src/components/dashboard/data-table.tsx`
Reusable wrapper around Shadcn Table that adds:
- Column header with sort toggle
- Empty state slot
- Loading skeleton (8 rows of gray bars)
- Props: `columns`, `data`, `isLoading?`, `emptyMessage?`

Use this in the members and leadership tables at minimum.

---

## STEP 7 — Verify
```bash
bunx tsc --noEmit
```
0 errors required.

## WHEN DONE
Update AGENT_CONTEXT.md Agent 2 Phase 3 row to DONE.
