# TASK BRIEF — Agent 1: Phase 3 Dashboard Shell + Content CMS
> Read AGENT_CONTEXT.md: /home/kelib/Desktop/moreprojects/gaphto/plans/AGENT_CONTEXT.md
> Work in: /home/kelib/Desktop/moreprojects/gaphto/

---

## YOUR SCOPE
Build the dashboard infrastructure and content-focused CMS sections:
- Dashboard shell (layout, sidebar, topbar)
- Overview/stats page
- Posts CMS (list + rich text editor create/edit)
- Announcements manager
- Contact submissions inbox

Agent 2 handles: members, leadership, events, gallery, publications management.

**DO NOT touch:**
- src/app/(dashboard)/members/**
- src/app/(dashboard)/leadership/**
- src/app/(dashboard)/events/**
- src/app/(dashboard)/gallery/**
- src/app/(dashboard)/publications/**

---

## STEP 0 — Install packages
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bun add @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-character-count
bunx shadcn@latest add table textarea switch tabs scroll-area sheet form textarea
```

---

## STEP 1 — Dashboard route group + layout

### `src/app/(dashboard)/layout.tsx`
Server component — verify session + role before rendering:
```ts
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }) {
  const session = await auth()
  if (!session) redirect('/login')
  const allowed = ['super_admin', 'admin', 'editor']
  if (!allowed.includes(session.user.role)) redirect('/member-centre')
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DashboardSidebar role={session.user.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
```

### `src/components/dashboard/sidebar.tsx`
- Fixed left sidebar, 240px wide, dark green background (green-950)
- Logo at top: "GAPHTO" + "Admin" pill
- Nav groups with icons (lucide-react):

  **Content**
  - 📊 Overview → /dashboard
  - 📰 Posts → /dashboard/posts
  - 📣 Announcements → /dashboard/announcements
  - 📅 Events → /dashboard/events

  **People**
  - 👥 Members → /dashboard/members
  - 🏆 Leadership → /dashboard/leadership

  **Media**
  - 🖼️ Gallery → /dashboard/gallery
  - 📄 Publications → /dashboard/publications

  **Inbox**
  - ✉️ Contact → /dashboard/contact

  **System** (super_admin only)
  - ⚙️ Settings → /dashboard/settings

- Active link: green-700 background, white text
- Role-gated items: hide Settings from non super_admin
- Bottom: user avatar + name + "Back to site" link

### `src/components/dashboard/topbar.tsx`
- White bar, border-bottom
- Left: breadcrumb (current section name)
- Right: user avatar + role badge + sign out button

---

## STEP 2 — Overview page: `src/app/(dashboard)/dashboard/page.tsx`

Server component, fetch real counts from DB:
```ts
// Query counts:
const [postCount] = await db.select({ count: count() }).from(posts)
const [memberCount] = await db.select({ count: count() }).from(members)
const [eventCount] = await db.select({ count: count() }).from(events)
const [unreadMessages] = await db.select({ count: count() })
  .from(contactSubmissions).where(eq(contactSubmissions.isRead, false))
```

Layout:
- Page heading "Dashboard Overview" + current date
- 4 stat cards (Shadcn Card): Total Posts, Active Members, Events, Unread Messages
  - Each card: icon, number, label, subtle trend color
- Two columns below:
  - Left: "Recent Posts" — last 5 posts as compact list (title, category badge, date, status chip)
  - Right: "Recent Contacts" — last 5 unread contact submissions (name, subject, date)

---

## STEP 3 — Posts CMS

### `src/app/(dashboard)/dashboard/posts/page.tsx`
Server component — list all posts with filter + pagination.

Use Shadcn `<Table>` (thead: Title, Category, Status, Author, Date, Actions):
- Category filter tabs: All | GAPHTO News | Health News | Blog | Announcement
- Search input (client-side filter)
- Status badge: draft (gray) / published (green) / archived (slate)
- Actions: Edit (pencil icon → /dashboard/posts/[id]/edit), Delete (trash, red, confirm dialog)
- "New Post" button top-right → /dashboard/posts/new
- Role gate: editors can create/edit their own; admins can edit all; only admins can delete

### `src/app/(dashboard)/dashboard/posts/new/page.tsx`
Thin server wrapper → renders `<PostEditor />` client component with no initial data.

### `src/app/(dashboard)/dashboard/posts/[id]/edit/page.tsx`
Fetch post by id from DB → pass to `<PostEditor post={post} />`.

### `src/components/dashboard/post-editor.tsx` — `'use client'`
The rich text editor form. Props: `post?: Post`

Fields:
- **Title**: large input, full width, font-bold text-2xl style
- **Slug**: auto-generated from title (editable), shown below title in gray
- **Category**: Shadcn Select (gaphto-news / health-news / blog / announcement)
- **Status**: Shadcn Select (draft / published / archived)
- **Excerpt**: Textarea, max 300 chars, char counter
- **Featured Image**: file input + preview (upload to /api/upload)
- **Content**: TipTap editor (full width, min-h-[400px])
  - Toolbar: Bold, Italic, Underline | H2, H3 | Bullet list, Ordered list | Link | Image | Blockquote | Code
  - Styled with prose-like CSS

Action buttons (top-right, sticky):
- "Save Draft" → POST/PATCH to /api/posts
- "Publish" → same but status: published
- "Preview" → opens /news/[slug] in new tab

### API routes

**`src/app/api/posts/route.ts`** — POST (create new post)
- Validate title, category required
- Auto-generate slug from title (slugify), ensure uniqueness by appending -2, -3 etc.
- Insert into posts table with authorId = session.user.id
- Return created post

**`src/app/api/posts/[id]/route.ts`** — PATCH (update), DELETE
- PATCH: update allowed fields, verify ownership (editor can only edit own posts; admin+ can edit any)
- DELETE: admin+ only

**`src/app/api/upload/route.ts`** — POST (image upload)
- Accept multipart form data
- Save file to `public/uploads/{timestamp}-{filename}`
- Return `{ url: '/uploads/...' }`
- Validate: image files only, max 5MB

---

## STEP 4 — Announcements: `src/app/(dashboard)/dashboard/announcements/page.tsx`

Table view: Title, Visible To, Pinned, Expires At, Actions.

"New Announcement" → inline form (no separate page needed, use a Sheet/Dialog):
- Title input
- Content textarea
- Visible To: select (public / members / executives)
- Pin toggle (Switch)
- Expiry date input (optional)

API: `src/app/api/announcements/route.ts` — GET (list), POST (create)
API: `src/app/api/announcements/[id]/route.ts` — PATCH, DELETE

---

## STEP 5 — Contact submissions inbox: `src/app/(dashboard)/dashboard/contact/page.tsx`

Email-inbox style layout:
- Left panel: list of submissions (name, subject truncated, date, unread dot)
- Right panel: selected submission detail (full message, reply-by-email link)
- "Mark as Read" button on each item
- Unread submissions have bold text + blue dot
- Filter: All | Unread

API: `src/app/api/contact/[id]/route.ts` — PATCH `{ isRead: true }`

---

## STEP 6 — Settings page (super_admin only): `src/app/(dashboard)/dashboard/settings/page.tsx`

Simple key-value settings editor:
- Org Name, Tagline, Contact Email, Contact Phone, Contact Address
- Social links: Facebook, Twitter, YouTube
- Load from `siteSettings` table (key-value), save with upsert
- Save button → PATCH /api/settings

---

## STEP 7 — Permissions helper: `src/lib/permissions.ts`
```ts
export type Role = 'super_admin' | 'admin' | 'editor' | 'member'

export const can = (role: Role, action: string): boolean => {
  const matrix: Record<string, Role[]> = {
    'posts:create': ['super_admin', 'admin', 'editor'],
    'posts:edit_any': ['super_admin', 'admin'],
    'posts:delete': ['super_admin', 'admin'],
    'posts:publish': ['super_admin', 'admin', 'editor'],
    'members:manage': ['super_admin', 'admin'],
    'leadership:manage': ['super_admin', 'admin'],
    'events:manage': ['super_admin', 'admin', 'editor'],
    'gallery:manage': ['super_admin', 'admin', 'editor'],
    'publications:manage': ['super_admin', 'admin'],
    'contact:view': ['super_admin', 'admin'],
    'settings:manage': ['super_admin'],
  }
  return matrix[action]?.includes(role) ?? false
}
```

---

## STEP 8 — Verify
```bash
bunx tsc --noEmit
```
0 errors required.

## WHEN DONE
Update AGENT_CONTEXT.md Agent 1 Phase 3 row to DONE.
