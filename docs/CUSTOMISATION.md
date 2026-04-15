# Customisation Guide

> Practical steps for adapting this CMS template to your organisation.

---

## Table of Contents

1. [Branding](#branding)
2. [Adding a Post Category](#adding-a-post-category)
3. [Adding a New Block Type](#adding-a-new-block-type)
4. [Adding a New RBAC Permission](#adding-a-new-rbac-permission)
5. [Integrating a Payment Provider](#integrating-a-payment-provider)
6. [Changing Member Specialties](#changing-member-specialties)

---

## Branding

### Environment Variables

Copy `.env.example` to `.env.local` and update the relevant values:

```bash
NEXT_PUBLIC_SITE_NAME="Acme Association"   # Appears in page titles, footer, logo alt text
NEXT_PUBLIC_APP_URL="https://acme.org"     # Used in emails, sitemaps, OG tags
ADMIN_EMAIL=admin@acme.org                 # Receives contact form submissions
```

These are referenced in `src/app/layout.tsx`, `src/components/layout/Logo.tsx`, `src/components/layout/footer.tsx`, and email templates in `src/lib/email.ts`.

### Logo

Replace the file at:

```
public/images/logo/logo.png
```

The `Logo` component at `src/components/layout/Logo.tsx` renders this image. It uses `NEXT_PUBLIC_SITE_NAME` for the alt text and tagline automatically.

If you need a different format (SVG, WebP) or path, edit `Logo.tsx` directly.

### Colors

All theme colors are CSS custom properties defined at the top of `src/app/globals.css` in the `:root` block:

```css
:root {
  --primary: oklch(0.55 0.18 145);        /* brand green */
  --primary-hover: oklch(0.48 0.18 145);
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... */
}
```

Change `--primary` and its variants to your brand color. The site uses Tailwind CSS v4 with `@theme inline` mapping, so Tailwind utility classes (`bg-primary`, `text-primary`, etc.) will automatically pick up your custom values.

### Favicon

Replace `public/favicon.ico` (and optionally add `public/apple-touch-icon.png`).

---

## Adding a Post Category

The `postCategoryEnum` drives the category filter, post editor select, and category badge colors. Currently: `news | blog | announcement`.

### Step 1 — Update the schema enum

```ts
// drizzle/schema.ts
export const postCategoryEnum = pgEnum('post_category', [
  'news',
  'blog',
  'announcement',
  'press_release',   // ← add your new value
])
```

### Step 2 — Run migrations

```bash
bun run db:generate
bun run db:migrate
```

### Step 3 — Update category display labels and colors

```ts
// src/components/shared/post-card.tsx
const categoryLabels: Record<string, string> = {
  news: 'News',
  blog: 'Blog',
  announcement: 'Announcement',
  press_release: 'Press Release',   // ← add
}

const categoryColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-800',
  blog: 'bg-purple-100 text-purple-800',
  announcement: 'bg-amber-100 text-amber-800',
  press_release: 'bg-rose-100 text-rose-800',   // ← add
}
```

### Step 4 — Update the public news filter

```ts
// src/app/(public)/news/news-client.tsx
const CATEGORIES = [
  { value: 'all',           label: 'All' },
  { value: 'news',          label: 'News' },
  { value: 'blog',          label: 'Blog' },
  { value: 'announcement',  label: 'Announcement' },
  { value: 'press_release', label: 'Press Release' },   // ← add
]
```

### Step 5 — Update the post editor select

```tsx
// src/components/dashboard/post-editor.tsx
<SelectItem value="news">News</SelectItem>
<SelectItem value="blog">Blog</SelectItem>
<SelectItem value="announcement">Announcement</SelectItem>
<SelectItem value="press_release">Press Release</SelectItem>   {/* ← add */}
```

Also check `src/app/(public)/news/[slug]/page.tsx` and `src/components/home/news-preview.tsx` for any category-keyed maps that may need the new value.

---

## Adding a New Block Type

The page builder is extensible. Adding a new block type requires changes in 7 places.

### Step 1 — Add the enum value to the schema

```ts
// drizzle/schema.ts
export const blockTypeEnum = pgEnum('block_type', [
  // ... existing values ...
  'testimonials',   // ← your new block
])
```

### Step 2 — Run migrations

```bash
bun run db:generate
bun run db:migrate
```

### Step 3 — Define the content type

```ts
// src/lib/blocks.ts
export type TestimonialsContent = {
  heading: string
  items: { name: string; quote: string; role?: string }[]
}

// Add to the BlockContent union type:
export type BlockContent =
  | HeroContent | /* ... */ | TestimonialsContent
```

### Step 4 — Create a block editor component

Create `src/components/dashboard/block-editor/testimonials-block-editor.tsx`.

The component must accept:
- `blockId: string`
- `initialContent: TestimonialsContent`
- `onSave: (content: TestimonialsContent) => Promise<void>`

Model it after an existing editor such as `features-grid-block-editor.tsx`.

### Step 5 — Register in `block-editor-shell.tsx`

```ts
// src/components/dashboard/block-editor/block-editor-shell.tsx

// 1. Import
import { TestimonialsBlockEditor } from './testimonials-block-editor'

// 2. Add to BLOCK_TYPE_LABELS
const BLOCK_TYPE_LABELS: Record<string, string> = {
  // ...existing...
  testimonials: 'Testimonials',
}

// 3. Add case in renderEditor()
case 'testimonials':
  return (
    <TestimonialsBlockEditor
      blockId={block.id}
      initialContent={parseBlockContent<TestimonialsContent>(block.content, { heading: '', items: [] })}
      onSave={onSave as (c: TestimonialsContent) => Promise<void>}
    />
  )
```

### Step 6 — Add rendering in `block-renderer.tsx`

```tsx
// src/components/shared/block-renderer.tsx

// Add import for your new component
import { Testimonials } from '@/components/home/testimonials'

// Add case in renderHomepageBlock()
case 'testimonials': {
  const content = parseBlockContent<TestimonialsContent>(block.content, {
    heading: 'What People Say',
    items: [],
  })
  return <Testimonials heading={content.heading} items={content.items} />
}
```

If the block should also appear on the About page, add the same case to `renderAboutBlock()`.

### Step 7 — Add to the page builder catalogue

```ts
// src/components/dashboard/page-builder-client.tsx

// 1. Add to BLOCK_TYPE_LABELS (the add-block dialog catalogue)
const BLOCK_TYPE_LABELS = {
  // ...existing...
  testimonials: {
    label: 'Testimonials',
    description: 'Customer or member quotes',
    icon: '💬',
  },
}

// 2. Add default content in DEFAULT_CONTENT (or wherever new-block defaults are set)
// Find the switch/map that populates content when a new block is added and add:
case 'testimonials':
  return JSON.stringify({ heading: 'What People Say', items: [] })
```

---

## Adding a New RBAC Permission

No schema change is needed — the permission matrix is pure TypeScript.

### Step 1 — Add the action key to the matrix

```ts
// src/lib/permissions.ts
const matrix: Record<string, Role[]> = {
  // ... existing entries ...
  'resources:manage': ['super_admin', 'admin'],   // ← add your action + allowed roles
}
```

Action names follow the convention `resource:verb`. Common verbs: `manage`, `create`, `edit_any`, `delete`, `view`.

### Step 2 — Use it in a Server Action

```ts
// src/app/actions/resources.ts
'use server'
import { auth } from '@/auth'
import { can, type Role } from '@/lib/permissions'

export async function createResource(data: ResourceInput) {
  const session = await auth()
  if (!session || !can(session.user.role as Role, 'resources:manage')) {
    throw new Error('Forbidden')
  }
  // ... proceed
}
```

### Step 3 — Optionally gate UI elements

```tsx
// In a Server Component that has access to session:
import { can } from '@/lib/permissions'

{can(session.user.role as Role, 'resources:manage') && (
  <Button>Add Resource</Button>
)}
```

---

## Integrating a Payment Provider

The template retains the `paymentStatus` column on `eventRegistrations` as a clean integration point. Free events default to `'complete'`; paid events default to `'pending'`.

### Where to hook in

The Server Action that handles registration is:

```
src/app/actions/event-registration.ts
```

After the `db.insert(eventRegistrations)` call, add your payment initiation logic:

```ts
// src/app/actions/event-registration.ts (after DB insert)

if (event.price && Number(event.price) > 0) {
  const paymentLink = await yourProvider.createPaymentLink({
    amount: Number(event.price) * 100,  // convert to minor units if needed
    reference: registration.id,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
    metadata: { registrationId: registration.id, eventId: event.id },
  })

  return { status: 'payment_required', paymentUrl: paymentLink.url }
}
```

### Create a provider module

```ts
// src/lib/your-payment-provider.ts
export const yourProvider = {
  async createPaymentLink(params: PaymentParams): Promise<{ url: string }> {
    // call your provider's API
  },
  async verifyWebhook(payload: unknown, signature: string): Promise<boolean> {
    // verify HMAC or similar
  },
}
```

### Add webhook/callback API routes

```
src/app/api/payments/callback/route.ts   ← redirect after payment
src/app/api/payments/webhook/route.ts    ← server-to-server notification
```

In the webhook handler, update `eventRegistrations.paymentStatus` to `'complete'` once payment is confirmed:

```ts
await db
  .update(eventRegistrations)
  .set({ paymentStatus: 'complete', paymentReference: providerReference })
  .where(eq(eventRegistrations.id, registrationId))
```

### Add payment UI

The event detail page is at `src/app/(public)/events/[slug]/page.tsx`. After a successful registration action that returns `{ status: 'payment_required', paymentUrl }`, redirect the user:

```ts
if (result.status === 'payment_required') {
  router.push(result.paymentUrl)
}
```

---

## Changing Member Specialties

The `memberSpecialtyEnum` currently has three values: `general | specialist | associate`.

### Step 1 — Update the schema enum

```ts
// drizzle/schema.ts
export const memberSpecialtyEnum = pgEnum('member_specialty', [
  'general',
  'specialist',
  'associate',
  'fellow',    // ← add your value
])
```

### Step 2 — Run migrations

```bash
bun run db:generate
bun run db:migrate
```

### Step 3 — Update the member directory filter

```ts
// src/components/member/member-directory-client.tsx
const SPECIALTIES = [
  { value: 'all',        label: 'All Specialties' },
  { value: 'general',    label: 'General' },
  { value: 'specialist', label: 'Specialist' },
  { value: 'associate',  label: 'Associate' },
  { value: 'fellow',     label: 'Fellow' },   // ← add
]
```

### Step 4 — Update the member card label map

```ts
// src/components/member/member-card.tsx
const SPECIALTY_LABELS: Record<string, string> = {
  general:    'General',
  specialist: 'Specialist',
  associate:  'Associate',
  fellow:     'Fellow',    // ← add
}
```

### Step 5 — Update the edit-profile select options

```tsx
// src/components/member/edit-profile-form.tsx
<SelectItem value="general">General</SelectItem>
<SelectItem value="specialist">Specialist</SelectItem>
<SelectItem value="associate">Associate</SelectItem>
<SelectItem value="fellow">Fellow</SelectItem>   {/* ← add */}
```

### Step 6 — Update the registration form

```tsx
// src/app/(auth)/register/page.tsx (or register-form.tsx)
<SelectItem value="general">General</SelectItem>
<SelectItem value="specialist">Specialist</SelectItem>
<SelectItem value="associate">Associate</SelectItem>
<SelectItem value="fellow">Fellow</SelectItem>   {/* ← add */}
```
