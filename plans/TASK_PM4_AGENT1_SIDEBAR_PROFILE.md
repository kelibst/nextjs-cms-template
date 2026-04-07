# PM4 — Agent 1: Retractable Sidebar + Profile Edit + Password Change

> **Read `plans/AGENT_CONTEXT.md` first for critical project rules (proxy.ts, bun, migration command).**
> When finished, update the STATUS section at the bottom of this file.

---

## SCOPE

Three self-contained improvements, all UI/UX focused. No DB schema changes required.

---

## TASK 1 — Retractable Dashboard Sidebar

**File:** `src/components/dashboard/sidebar.tsx`

The sidebar is currently a fixed `w-60` aside. Make it collapsible:

### Requirements
- Add a toggle button (chevron icon) in the sidebar header area, beside the "GAPHTO Admin" label.
- Collapsed state: sidebar shrinks to `w-16` (icons only, no text labels, no group headings).
- Expanded state: current `w-60` appearance (unchanged).
- Persist the state in `localStorage` key `"sidebar-collapsed"` so it survives page navigation.
- Use `useState` + `useEffect` for localStorage sync (already a client component — `'use client'` is already at the top).
- The user avatar strip at the bottom should show only the avatar circle when collapsed (no name/email/chevron).
- Tooltips (via `title` attribute or Radix `TooltipProvider`) on each icon when collapsed so the user knows what each item is.
- The dashboard layout must accommodate the width change — check `src/app/(dashboard)/layout.tsx` to see how the sidebar is composed and adjust flexbox there if needed.

### Icon to use
`PanelLeftClose` (expanded → click to collapse) / `PanelLeftOpen` (collapsed → click to expand) from `lucide-react`.

---

## TASK 2 — Edit Profile on Member Profile Page

**File:** `src/app/(member)/member-centre/profile/page.tsx`

Currently the "Edit Profile" button is `disabled` with a "Coming in Phase 3" tooltip.

### Requirements
- Remove the disabled state and the "Coming in Phase 3" label.
- Clicking "Edit Profile" should reveal an inline form (not a separate page) with:
  - **Full Name** text input (pre-filled with current name)
  - A **Save** button and a **Cancel** button
- On Save: call a new server action `updateUserProfile({ name })` in `src/app/actions/auth.ts`
  - Action must: validate name is non-empty, update `users.name` in DB, call `revalidatePath('/member-centre/profile')`.
- On success: form collapses back to display mode, updated name is shown.
- The form should be a `'use client'` component. Create it at `src/components/member/edit-profile-form.tsx`.
- Use existing Shadcn `Input`, `Button`, and `Label` components.

### Server action to add in `src/app/actions/auth.ts`
```ts
export async function updateUserProfile(data: { name: string }) {
  // auth() → get userId → validate → db.update(users).set({ name, updatedAt: new Date() })
  // revalidatePath('/member-centre/profile')
}
```

---

## TASK 3 — Change Password on Profile Page

**File:** `src/app/(member)/member-centre/profile/page.tsx`  
**New component:** `src/components/member/change-password-form.tsx`

Add a new card below the Email Preferences card titled **"Change Password"**.

### Requirements
- Fields: Current Password, New Password (min 8 chars), Confirm New Password
- Client component with local validation before submitting.
- On submit: call server action `changePassword({ currentPassword, newPassword })` in `src/app/actions/auth.ts`.
  - Action must:
    1. `auth()` → get userId
    2. Fetch user's `passwordHash` from DB
    3. `bcrypt.compare(currentPassword, passwordHash)` — if fails, return `{ error: 'Current password is incorrect' }`
    4. Hash new password with `bcrypt.hash(newPassword, 12)`
    5. Update `users.passwordHash` in DB
    6. Return `{ success: true }`
- Show inline success / error feedback in the form (no toast needed).
- `bcrypt` is already installed (`bcryptjs` is used in `src/app/actions/auth.ts` — use `import bcrypt from 'bcryptjs'`).

---

## WHAT NOT TO DO
- Do not create any API routes — use server actions only.
- Do not add the GIS map or newsletter features — those belong to Phase 3 agents.
- Do not run the DB migration command (no schema changes needed for this task).
- Do not touch `src/middleware.ts` — use `src/proxy.ts` for any auth guards.

---

## KEY FILES TO READ BEFORE CODING
| File | Why |
|------|-----|
| `src/components/dashboard/sidebar.tsx` | Current sidebar — you will modify this |
| `src/app/(dashboard)/layout.tsx` | How sidebar is mounted in the layout |
| `src/app/(member)/member-centre/profile/page.tsx` | Current profile page — Tasks 2 & 3 go here |
| `src/app/actions/auth.ts` | Add the two new server actions here |
| `src/lib/permissions.ts` | Auth pattern reference |

---

## STATUS
- [x] Task 1 — Retractable sidebar
- [x] Task 2 — Edit Profile inline form
- [x] Task 3 — Change Password card
