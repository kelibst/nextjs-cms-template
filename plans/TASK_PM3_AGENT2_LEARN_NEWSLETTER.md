# TASK — Agent 2: Learning Platform + Newsletter/Email Notifications
> PM-assigned task. Read AGENT_CONTEXT.md first for all project rules (middleware, bun, migrations).
> This task covers TWO features. Implement in the order listed.
> When done, update the STATUS section at the bottom of this file.

---

## FEATURE A — LEARNING PLATFORM

### GOAL
Add a CPD (Continuing Professional Development) learning module:
- **Dashboard**: Admins/editors create and manage courses and lessons
- **Member Centre**: Members browse courses, enroll, and track progress through lessons

---

### DATABASE SCHEMA — New Tables

Add to `drizzle/schema.ts`:

#### Enums (add near top with other enums)
```typescript
export const courseLevelEnum = pgEnum('course_level', ['beginner', 'intermediate', 'advanced'])
export const courseStatusEnum = pgEnum('course_status', ['draft', 'published', 'archived'])
export const lessonStatusEnum = pgEnum('lesson_status', ['draft', 'published'])
```

#### Tables
```typescript
export const courses = pgTable('courses', {
  id:          uuid('id').primaryKey().defaultRandom(),
  title:       text('title').notNull(),
  slug:        text('slug').notNull().unique(),
  description: text('description'),
  thumbnail:   text('thumbnail_url'),
  level:       courseLevelEnum('level').default('beginner'),
  category:    text('category'),            // e.g. "Disease Control", "Nutrition"
  status:      courseStatusEnum('status').default('draft'),
  instructorId: uuid('instructor_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
})

export const lessons = pgTable('lessons', {
  id:          uuid('id').primaryKey().defaultRandom(),
  courseId:    uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title:       text('title').notNull(),
  slug:        text('slug').notNull(),
  content:     text('content'),             // HTML from TipTap editor
  sortOrder:   integer('sort_order').default(0),
  durationMin: integer('duration_minutes'), // estimated read/watch time
  status:      lessonStatusEnum('status').default('draft'),
  createdAt:   timestamp('created_at').defaultNow(),
})

export const courseEnrollments = pgTable('course_enrollments', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId:    uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  enrolledAt:  timestamp('enrolled_at').defaultNow(),
  completedAt: timestamp('completed_at'),
})

export const lessonCompletions = pgTable('lesson_completions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId:    uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  completedAt: timestamp('completed_at').defaultNow(),
})
```

Run migration after adding schema:
```bash
bunx drizzle-kit generate --config=drizzle/drizzle.config.ts
bunx tsx drizzle/migrate.ts
```

---

### PERMISSIONS
Add to `src/lib/permissions.ts` matrix:
```typescript
'learning:manage': ['super_admin', 'admin', 'editor'],
```

---

### DASHBOARD — LEARNING MANAGEMENT

#### Dashboard Sidebar Navigation
**`src/components/dashboard/sidebar.tsx`** — add "Learning" nav item with `BookOpen` (Lucide) icon, pointing to `/dashboard/learning`

#### Pages to Create

**`src/app/(dashboard)/dashboard/learning/page.tsx`**
- Server component, `force-dynamic`
- Fetches all courses from DB (with lesson count via subquery or join)
- Renders a table: Title | Category | Level | Status | Lessons | Actions
- "New Course" button → `/dashboard/learning/new`
- Actions: Edit, Delete (with confirm dialog), View Lessons

**`src/app/(dashboard)/dashboard/learning/new/page.tsx`**
- Server component wrapping a client form component
- Form fields: title, slug (auto-generated from title), description, thumbnail URL, level (Select), category (text), status (Select: draft/published)

**`src/app/(dashboard)/dashboard/learning/[id]/edit/page.tsx`**
- Fetches course by id, passes to same form component (pre-filled)

**`src/app/(dashboard)/dashboard/learning/[id]/lessons/page.tsx`**
- Lists lessons for a course in sortable order
- Shows: Order | Title | Status | Duration | Actions
- Drag-to-reorder is optional; a simple "Move Up/Down" approach is fine
- "New Lesson" button

**`src/app/(dashboard)/dashboard/learning/[id]/lessons/new/page.tsx`**
- Form: title, slug (auto from title), content (TipTap rich text editor — already installed), duration in minutes, status

**`src/app/(dashboard)/dashboard/learning/[id]/lessons/[lessonId]/edit/page.tsx`**
- Fetches lesson, pre-fills form

#### Server Actions
**`src/app/actions/learning.ts`**
- `createCourse(data)` — admin check, insert, revalidate, redirect
- `updateCourse(id, data)` — admin check, update, revalidate
- `deleteCourse(id)` — admin check, cascade deletes handled by DB
- `createLesson(courseId, data)` — admin check, insert
- `updateLesson(id, data)` — admin check, update
- `deleteLesson(id)` — admin check, delete
- `enrollInCourse(courseId)` — member check, insert enrollment
- `markLessonComplete(lessonId)` — member check, insert completion
- `updateLessonOrder(courseId, lessonIds: string[])` — admin, update sortOrder for each

---

### MEMBER CENTRE — LEARNING

#### Member Sidebar Navigation
**`src/app/(member)/member-centre/layout.tsx`** — add "Learning" nav item with `BookOpen` icon → `/member-centre/learning`

#### Pages to Create

**`src/app/(member)/member-centre/learning/page.tsx`**
- Fetches published courses
- Also fetches user's enrollments (by session userId)
- Shows a grid of course cards:
  - Thumbnail, title, category badge, level badge, lesson count
  - "Enrolled" badge if already enrolled
  - CTA: "Enroll" or "Continue" button
- Use existing `PageHeader` component for page title

**`src/app/(member)/member-centre/learning/[slug]/page.tsx`**
- Course detail: description, instructor, level, lesson list
- Enroll button (server action call)
- Lesson list shows: lesson title, duration, completion checkmark (if completed)
- If not enrolled → show enroll prompt + blur/lock lessons

**`src/app/(member)/member-centre/learning/[slug]/[lessonSlug]/page.tsx`**
- Lesson viewer: title, content (rendered HTML with `@tailwindcss/typography` prose styles)
- "Mark as Complete" button (if not already complete) → calls `markLessonComplete`
- Navigation: Previous / Next lesson buttons
- Progress bar at top: X of Y lessons completed

#### Components to Create

**`src/components/dashboard/course-form.tsx`** — reusable for new + edit
**`src/components/dashboard/lesson-form.tsx`** — reusable for new + edit (includes TipTap editor)
**`src/components/member/course-card.tsx`** — course grid card for member centre

---

## FEATURE B — NEWSLETTER & EMAIL NOTIFICATIONS

### GOAL
- Admins compose and send email newsletters to all opted-in members via Resend
- Members can opt in/out of newsletters and event email alerts in their profile

---

### DATABASE SCHEMA — New Tables

Add to `drizzle/schema.ts`:

#### Enums
```typescript
export const newsletterStatusEnum = pgEnum('newsletter_status', ['draft', 'sent'])
```

#### Tables
```typescript
export const newsletters = pgTable('newsletters', {
  id:             uuid('id').primaryKey().defaultRandom(),
  subject:        text('subject').notNull(),
  content:        text('content').notNull(),    // HTML body
  status:         newsletterStatusEnum('status').default('draft'),
  recipientCount: integer('recipient_count').default(0),
  sentAt:         timestamp('sent_at'),
  createdBy:      uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt:      timestamp('created_at').defaultNow(),
})

export const emailPreferences = pgTable('email_preferences', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  userId:              uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  receiveNewsletter:   boolean('receive_newsletter').default(true),
  receiveEventAlerts:  boolean('receive_event_alerts').default(true),
  updatedAt:           timestamp('updated_at').defaultNow(),
})
```

Run migration again after adding these tables.

---

### EMAIL LIBRARY UPDATE
**`src/lib/email.ts`** — add these functions:

```typescript
// Send newsletter to a single recipient (called in batch loop)
export async function sendNewsletterEmail(
  to: string,
  name: string,
  subject: string,
  htmlContent: string,
  unsubscribeUrl: string
) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
        <div style="background:#166534;padding:20px;text-align:center;">
          <h1 style="color:white;margin:0;">GAPHTO Newsletter</h1>
        </div>
        <div style="padding:24px;">
          <p>Dear ${name},</p>
          ${htmlContent}
        </div>
        <div style="padding:16px;text-align:center;font-size:12px;color:#666;border-top:1px solid #eee;">
          <p>You are receiving this because you are a GAPHTO member.<br/>
          <a href="${unsubscribeUrl}">Unsubscribe from newsletters</a></p>
        </div>
      </div>
    `,
  })
}

// Send event announcement to opted-in members (single recipient)
export async function sendEventAlertEmail(
  to: string,
  name: string,
  eventTitle: string,
  eventDate: string,
  eventSlug: string,
  appUrl: string
) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Upcoming GAPHTO Event: ${eventTitle}`,
    html: `
      <p>Hi ${name},</p>
      <p>A new GAPHTO event has been scheduled: <strong>${eventTitle}</strong></p>
      <p>Date: ${eventDate}</p>
      <p><a href="${appUrl}/events/${eventSlug}" style="background:#166534;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">View Event Details</a></p>
      <p>— GAPHTO Team</p>
    `,
  })
}
```

---

### PERMISSIONS
Add to `src/lib/permissions.ts` matrix:
```typescript
'newsletter:manage': ['super_admin', 'admin'],
```

---

### DASHBOARD — NEWSLETTER MANAGEMENT

#### Dashboard Sidebar Navigation
**`src/components/dashboard/sidebar.tsx`** — add "Newsletter" nav item with `Mail` (Lucide) icon → `/dashboard/newsletter`

#### Pages to Create

**`src/app/(dashboard)/dashboard/newsletter/page.tsx`**
- Server component, `force-dynamic`
- Fetches newsletters ordered by createdAt desc
- Table: Subject | Status | Recipients | Sent At | Actions
- "Compose Newsletter" button → `/dashboard/newsletter/new`
- Sent newsletters: View only. Draft newsletters: Edit, Send, Delete

**`src/app/(dashboard)/dashboard/newsletter/new/page.tsx`**
- Form (client component): subject (Input), content (TipTap editor)
- Two action buttons: "Save Draft" and "Send Now"
- "Send Now" shows a confirmation dialog: "This will email all opted-in members. Continue?"

**`src/app/(dashboard)/dashboard/newsletter/[id]/edit/page.tsx`**
- Only accessible if status === 'draft'
- Pre-fills form with existing content

**`src/app/(dashboard)/dashboard/newsletter/[id]/page.tsx`**
- View-only for sent newsletters
- Shows: subject, recipient count, sent date, preview of HTML content

#### Server Actions
**`src/app/actions/newsletter.ts`**
- `createNewsletter(data)` — admin check, insert with status 'draft'
- `updateNewsletter(id, data)` — admin check, update (only if draft)
- `deleteNewsletter(id)` — admin check, delete (only if draft)
- `sendNewsletter(id)` — admin check:
  1. Fetch newsletter by id (must be draft)
  2. Fetch all members where membership_status = 'active' + joined users (get email, name)
  3. Cross-reference emailPreferences: only send to `receiveNewsletter = true` (or no preference row = default true)
  4. Loop through recipients, call `sendNewsletterEmail()` for each
  5. Update newsletter: status = 'sent', sentAt = now(), recipientCount = N
  6. Revalidate dashboard path
  - **IMPORTANT:** Resend free tier is 100 emails/day. For large member lists, consider batching with a small delay or logging failures. For now: catch per-email errors, log them, continue — don't fail the whole send.

**`src/app/actions/email-preferences.ts`**
- `updateEmailPreferences(prefs: { receiveNewsletter: boolean; receiveEventAlerts: boolean })` — member check, upsert emailPreferences row for session user

---

### MEMBER PROFILE — EMAIL PREFERENCES

**`src/app/(member)/member-centre/profile/page.tsx`**
- Add a new section: "Email Preferences"
- Fetch the user's `emailPreferences` row (or default values if no row exists)
- Render two `<Switch>` components:
  - "Receive GAPHTO newsletters" — `receiveNewsletter`
  - "Receive event alerts by email" — `receiveEventAlerts`
- "Save Preferences" button → calls `updateEmailPreferences` action
- Use existing card/section layout pattern from the profile page

---

### EVENT ALERT INTEGRATION (optional, bonus)
In the existing `createEvent` server action (`src/app/actions/events.ts`), after successfully creating an event with status 'published' or 'upcoming':
- Query members with `receiveEventAlerts = true`
- Send `sendEventAlertEmail()` to each (same batch pattern as newsletter)
- Wrap in try/catch — don't fail event creation if email errors occur

---

## IMPLEMENTATION ORDER
1. Add all new DB tables to `drizzle/schema.ts` (courses, lessons, enrollments, lesson_completions, newsletters, emailPreferences)
2. Generate + run migration (one migration for all)
3. Update `src/lib/permissions.ts` (learning:manage, newsletter:manage)
4. **Feature A — Learning:**
   a. Create server actions (`src/app/actions/learning.ts`)
   b. Add dashboard sidebar nav item
   c. Build dashboard course CRUD pages + forms
   d. Build dashboard lesson CRUD pages + forms
   e. Add member centre sidebar nav item
   f. Build member centre course browse + lesson viewer pages
5. **Feature B — Newsletter:**
   a. Add email functions to `src/lib/email.ts`
   b. Create server actions (`src/app/actions/newsletter.ts`, `src/app/actions/email-preferences.ts`)
   c. Add dashboard sidebar nav item
   d. Build dashboard newsletter compose + list + view pages
   e. Add email preferences section to member profile page

---

## IMPORTANT NOTES
- Package manager: `bun` only (no npm/yarn)
- Never create `src/middleware.ts` — route protection is in `src/proxy.ts`
- TipTap editor is already installed: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`
- Reference the existing TipTap usage in the posts forms for the editor implementation pattern
- Use the existing `can()` function from `src/lib/permissions.ts` in all server actions
- Use `revalidatePath()` after mutations
- Resend is at `src/lib/email.ts` — follow the lazy init pattern already there
- Test login: `member@gaphto.org / Test1234!`, dev server: `bun dev`
- Working directory: `/home/kelib/Desktop/moreprojects/gaphto`

---

## STATUS
### Feature A — Learning Platform
- [x] Schema tables added + migration run (migration 0005 — courses, lessons, courseEnrollments, lessonCompletions + enums)
- [x] Permissions updated (learning:manage already present in permissions.ts)
- [x] Server actions created (src/app/actions/learning.ts — all 9 actions)
- [x] Dashboard: sidebar nav item added (Learning + Newsletter group in sidebar.tsx)
- [x] Dashboard: Course list, new, edit pages built
- [x] Dashboard: Lesson list, new, edit pages built
- [x] Member centre: sidebar nav item added (Learning link added to member-centre/page.tsx and profile/page.tsx sidebars)
- [x] Member centre: Course browse + detail pages built (learning/page.tsx, learning/[slug]/page.tsx)
- [x] Member centre: Lesson viewer built (learning/[slug]/[lessonSlug]/page.tsx)

### Feature B — Newsletter
- [x] Schema tables added (newsletters, emailPreferences) — same migration 0005 as above
- [x] Email functions added to src/lib/email.ts (sendNewsletterEmail, sendEventAlertEmail)
- [x] Server actions created (newsletter.ts — createNewsletter, updateNewsletter, deleteNewsletter, sendNewsletter; email-preferences.ts — updateEmailPreferences)
- [x] Dashboard: sidebar nav item added (Newsletter in Learning group in sidebar.tsx)
- [x] Dashboard: Newsletter compose, list, view, edit pages built
- [x] Member profile: Email preferences section added (EmailPreferencesForm client component with Switch toggles)

### Agent Notes
**Implementation completed 2026-04-04**

Key decisions and notes:
- Schema was already complete (previous agent had added all tables and ran migration 0004 for lat/lng; migration 0005 for learning+newsletter was generated but needed running — ran successfully)
- All dashboard pages, server actions, components (CourseForm, LessonForm, NewsletterForm, delete buttons, send button) were already scaffolded by a prior partial run — verified and corrected import paths
- Several dashboard files used wrong relative import paths (e.g. `../../../../../../drizzle/schema` which resolves to `src/` not project root) — fixed to use `@/lib/db` alias which re-exports all schema tables
- Member centre learning pages were missing: created course browse grid, course detail (with enroll button + progress bar + lesson list), and lesson viewer (with mark-complete + prev/next navigation)
- Email preferences form is a client component (`EmailPreferencesForm`) using `useMutation` + `Switch` toggles; profile page (server) fetches the preferences row and passes initial values
- Member centre sidebar (inline in each page) updated to include Learning nav item in main page and profile page; publications/directory pages not updated (out of scope for this task's sidebar requirement)
- Event alert integration (optional bonus) not implemented — can be added later in events.ts
- Build verified: `bun run build` passes with 0 errors, all new routes appear in the build output
