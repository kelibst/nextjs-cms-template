# TASK BRIEF — Agent 2: Phase 2 Auth UI Pages
> Read AGENT_CONTEXT.md: /home/kelib/Desktop/moreprojects/gaphto/plans/AGENT_CONTEXT.md
> Work in: /home/kelib/Desktop/moreprojects/gaphto/

---

## YOUR SCOPE
Build all auth-related UI pages: login, register, member centre, profile, gated publications.
Agent 1 is wiring up NextAuth, DB, and middleware simultaneously.

**Assume Agent 1 has created:**
- `src/auth.ts` — exports `signIn`, `signOut`, `auth`
- `src/lib/db.ts` — exports `db` (Drizzle client)
- Session type extensions in `src/types/next-auth.d.ts`

If those files don't exist when you start, create stub versions just enough to satisfy TypeScript, and note it.

---

## STEP 0 — Install Shadcn components
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx shadcn@latest add input label form tabs dropdown-menu
```

---

## STEP 1 — Login page: `src/app/(auth)/login/page.tsx`

Layout: centered card, max-w-sm, with GAPHTO logo/name at top.

Page is a Server Component. The form is a separate Client Component:
`src/app/(auth)/login/login-form.tsx`

### Login form spec:
- Email field + Password field using Shadcn `<Input>` and `<Label>`
- Show/hide password toggle (eye icon, lucide-react)
- "Sign In" submit button (full width, green-700)
- Error message display (from searchParams `?error=...`)
- "Forgot password?" link (goes nowhere for now, just href="#")
- "Don't have an account? Register" link → /register
- On submit: call `signIn('credentials', { email, password, redirectTo: callbackUrl || '/member-centre' })` from `next-auth/react`
- Loading state: disable button + show spinner

### Demo credentials notice:
Add a small info box showing:
```
Demo accounts:
member@gaphto.org / Test1234!
admin@gaphto.org / Test1234!
```

---

## STEP 2 — Register page: `src/app/(auth)/register/page.tsx`

Server Component wrapper + client form `register-form.tsx`.

### Form fields:
- Full Name
- Email
- Password (min 8 chars)
- Confirm Password
- Specialty (select: Disease Control / Health Information / Nutrition)
- "Create Account" button

### On submit: POST to `/api/auth/register` (create this route)

### `src/app/api/auth/register/route.ts`
```ts
// POST handler:
// 1. Validate all fields present
// 2. Check email not already taken (query users table)
// 3. Hash password with bcrypt (rounds=12)
// 4. Insert into users table (role: 'member')
// 5. Insert into members table (specialty, membershipStatus: 'active')
// 6. Return { success: true }
// On error: return 400 with { error: "..." }
```

After successful registration, redirect to /login?registered=true.
On the login page, if `?registered=true`, show a green success banner: "Account created! Please sign in."

---

## STEP 3 — Member Centre: `src/app/(member)/member-centre/page.tsx`

This is a **Server Component** — get session with `import { auth } from '@/auth'`.
If no session (belt-and-suspenders), redirect to /login.

### Layout: two-column, sidebar left (200px) + main content right

### Sidebar links:
- Dashboard (active)
- My Profile
- Publications
- Events
- Sign Out (button, calls signOut action)

### Main content — Dashboard overview:
- Welcome banner: "Welcome back, {name}!" with role badge
- 3 stat cards: Member Since (joined date or "2024"), Membership Status (green "Active" badge), Role (capitalize)
- Quick links section: "Browse Publications", "View Events", "Contact Us"
- Latest news widget: 3 most recent posts as compact list items (title + date)

---

## STEP 4 — Profile page: `src/app/(member)/member-centre/profile/page.tsx`

Server Component — fetch full user record from DB using session.user.id.

Display (read-only for now — editing is Phase 3):
- Avatar circle with initials
- Name, Email, Role badge
- Member Number (if set), Specialty, Region, Facility
- Membership Status + Dues Paid Until
- "Edit Profile" button (disabled, shows tooltip "Coming in Phase 3")

---

## STEP 5 — Publications (gated): `src/app/(member)/publications/page.tsx`

Server Component — protected by middleware AND double-checked with `auth()`.

Content:
- PageHeader: "Publications" (reuse shared component)
- Info banner: "Access to publications is available to GAPHTO members only."
- Publication list: for the showcase, show 5 placeholder publication entries
  (since real publications are gated in WP DB — use dummy data):
  ```ts
  const SAMPLE_PUBLICATIONS = [
    { title: "GAPHTO Journal Vol. 1", year: "2017", type: "Journal", size: "2.4 MB" },
    { title: "Annual Conference Report 2016", year: "2016", type: "Report", size: "1.8 MB" },
    { title: "Disease Control Guidelines", year: "2017", type: "Guideline", size: "3.1 MB" },
    { title: "Health Information Manual", year: "2016", type: "Manual", size: "4.2 MB" },
    { title: "Nutrition Policy Brief", year: "2017", type: "Brief", size: "890 KB" },
  ]
  ```
- Each item: file icon (lucide `FileText`), title, year, type badge, size, "Download" button
- Download button: disabled with tooltip "Full download available after Phase 4 DB migration"

---

## STEP 6 — Sign Out action: `src/app/actions/auth.ts`

```ts
'use server'
import { signOut } from '@/auth'
export async function handleSignOut() {
  await signOut({ redirectTo: '/' })
}
```

Use this in the sidebar Sign Out button in member centre.

---

## STEP 7 — Public publications teaser: `src/app/publications/page.tsx`

A public-facing page (NOT gated) that shows what publications exist but blurs/locks the content:
- PageHeader: "Publications"
- Teaser text: "GAPHTO publications are available exclusively to members."
- 3 blurred placeholder cards (use `blur-sm` + lock icon overlay)
- CTA: "Sign In to Access" button → /login

---

## STEP 8 — Update nav links
The header already has a static nav. Ensure these routes are linked correctly:
- "Member Centre" link should go to `/member-centre`
- "Publications" link in member sidebar goes to `/member-centre/publications`

Do NOT modify header.tsx — Agent 1 is updating it for auth state.

---

## STEP 9 — Verify
```bash
bunx tsc --noEmit
```
Must pass 0 errors.

---

## WHEN DONE
Update AGENT_CONTEXT.md Agent 2 Phase 2 row to DONE.
