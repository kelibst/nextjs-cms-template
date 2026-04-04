# Agent B Task — TanStack Query: Server-Action Components

> Read plans/AGENT_CONTEXT.md first — specifically the PHASE 3 section — before touching any file.
> **PRECONDITION:** Confirm `src/components/providers.tsx` contains `QueryClientProvider` before starting. Agent A must have completed their task first.

---

## Your Role
You are Agent B. You refactor all Client Components that call server actions — replacing manual `useState(loading/saving/saved)` with `useMutation` from TanStack Query and adding `toast` feedback from `sonner`. You also normalise all delete buttons to use the Dialog pattern.

## Working Directory
`/home/kelib/Desktop/moreprojects/gaphto/`

---

## What Agent A Already Did (do NOT redo)
- Installed `@tanstack/react-query`, `sonner`, `@tanstack/react-query-devtools`
- Created `src/lib/api.ts` — you do NOT import this (you don't use fetch())
- Modified `providers.tsx` — `QueryClientProvider` is now in the tree
- Modified `layout.tsx` — `<Toaster>` is now in the root layout
- Refactored: `post-editor.tsx`, `leadership-form.tsx`, `event-form.tsx`, `publication-form.tsx`, `album-form.tsx`, `gallery-image-manager.tsx`

---

## Import Pattern for All Your Components

```typescript
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
// Import server actions from @/app/actions/...
// Do NOT import apiRequest — you don't use fetch()
```

---

## Core Pattern: Server Action → useMutation

Server actions are plain async functions — `useMutation` calls them directly as `mutationFn`.

**For components that NAVIGATE AWAY after mutation:**
```typescript
const mutation = useMutation({
  mutationFn: () => serverAction(id),
  onSuccess: () => { toast.success('Done'); router.push('/dashboard/...') },
  onError: (err) => toast.error(err instanceof Error ? err.message : 'Action failed'),
})
```

**For components that STAY ON THE SAME PAGE after mutation:**
```typescript
const mutation = useMutation({
  mutationFn: () => serverAction(id),
  onSuccess: () => { toast.success('Done'); router.refresh() },
  onError: (err) => toast.error(err instanceof Error ? err.message : 'Action failed'),
})
// router.refresh() triggers Next.js to re-fetch the Server Component — the list updates without full navigation
```

---

## Delete Button Normalisation Rule

All delete buttons must use the Dialog component (not `window.confirm()`). Reference implementation: `src/components/dashboard/post-delete-button.tsx` — read it first, apply the same Dialog + useMutation pattern to all other delete buttons.

The Dialog import already exists in the project: `@/components/ui/dialog`.

---

## Components to Refactor

### 1. `src/components/dashboard/post-delete-button.tsx`
Currently uses Dialog + manual `useState(loading)`. Refactor to `useMutation`:
- Remove `useState(loading)`
- `mutationFn: () => deletePost(postId)` — import from `@/app/actions/posts`
- `onSuccess`: `toast.success('Post deleted')`, close dialog, `router.refresh()`
- `onError`: `toast.error('Failed to delete post')`
- Button: `disabled={mutation.isPending}`, text: `mutation.isPending ? 'Deleting…' : 'Delete'`

---

### 2. `src/components/dashboard/leadership-delete-button.tsx`
Currently uses `confirm()`. Replace entirely with Dialog + useMutation:
- Add `useState(open)` for dialog open state
- Dialog with "Are you sure?" confirmation body
- Confirm button triggers `mutation.mutate()`
- `mutationFn: () => deleteLeadership(id)` — import from `@/app/actions/leadership`
- `onSuccess`: `toast.success('Member removed')`, close dialog, `router.refresh()`
- `onError`: `toast.error('Failed to remove member')`

---

### 3. `src/components/dashboard/event-delete-button.tsx`
Same pattern as leadership-delete-button. Currently uses `confirm()`.
- `mutationFn: () => deleteEvent(id)` — import from `@/app/actions/events`
- `onSuccess`: `toast.success('Event deleted')`, close dialog, `router.refresh()`
- `onError`: `toast.error('Failed to delete event')`

---

### 4. `src/components/dashboard/album-delete-button.tsx`
Same pattern. Currently uses `confirm()`.
- `mutationFn: () => deleteAlbum(id)` — import from `@/app/actions/gallery`
- `onSuccess`: `toast.success('Album deleted')`, close dialog, `router.push('/dashboard/gallery')`
  (album delete navigates back to gallery list)
- `onError`: `toast.error('Failed to delete album')`

---

### 5. `src/components/dashboard/publication-delete-button.tsx`
Same pattern. Currently uses `confirm()`.
- `mutationFn: () => deletePublication(id)` — import from `@/app/actions/publications`
- `onSuccess`: `toast.success('Publication deleted')`, close dialog, `router.refresh()`
- `onError`: `toast.error('Failed to delete publication')`

---

### 6. `src/components/dashboard/announcement-actions.tsx`
Currently has no confirmation. Add Dialog + useMutation for delete:
- `mutationFn: () => deleteAnnouncement(id)` — import from `@/app/actions/announcements`
- `onSuccess`: `toast.success('Announcement deleted')`, close dialog, `router.refresh()`
- `onError`: `toast.error('Failed to delete announcement')`

---

### 7. `src/components/dashboard/member-status-toggle.tsx`
Currently uses `useState(status)` + direct server action call in onChange. Refactor:
- Keep `useState(status)` for the optimistic local value — this drives the toggle UI
- Add `useMutation` wrapping `updateMemberStatus(id, newStatus)` — import from `@/app/actions/members`
- On toggle change: set optimistic state AND call `mutation.mutate(newStatus)`
- `onSuccess`: `toast.success('Status updated')`, `router.refresh()`
- `onError`: rollback `setStatus(previousStatus)`, `toast.error('Failed to update status')`
- The rollback means you need to capture the previous value before the optimistic update

---

### 8. `src/components/dashboard/contact-inbox.tsx`
Currently uses `useState(localMessages)` for optimistic mark-as-read + direct server action call. Refactor:
- Keep `useState(localMessages)` — the optimistic state stays
- Keep `useState(selected)` and `useState(filter)` — these are UI state
- Replace direct server action call with `useMutation`:
  ```typescript
  const readMutation = useMutation({
    mutationFn: (id: string) => markMessageRead(id),
    onSuccess: (_, id) => {
      setLocalMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
    },
    onError: () => {
      toast.error('Failed to mark as read')
      router.refresh() // restore server state on error
    },
  })
  ```
- Do NOT call `router.refresh()` on success (optimistic update is sufficient for read-marking)

---

### 9. `src/components/dashboard/settings-form.tsx`
Currently uses `useState(saving)` + `useState(saved)` + `setTimeout` for the "Saved!" state. Refactor:
- Remove `useState(saving)`, `useState(saved)`, the `setTimeout`
- `useMutation` wrapping `saveSettings(values)` — import from `@/app/actions/settings`
- `onSuccess`: `toast.success('Settings saved')` (replaces the "Saved!" flash)
- `onError`: `toast.error('Failed to save settings')`
- Button: `disabled={mutation.isPending}`, text: `mutation.isPending ? 'Saving…' : 'Save Changes'`
- Keep `useState(values)` for the form field state

---

### 10. `src/components/dashboard/new-announcement-sheet.tsx`
Currently uses multiple `useState` for fields + `useState(saving)`. Refactor:
- Keep all field state (`title`, `content`, `visibleTo`, `isPinned`, `expiresAt`) — these are form UI state
- Keep `useState(open)` for the sheet
- Remove `useState(saving)`
- `useMutation` wrapping `createAnnouncement(data)` — import from `@/app/actions/announcements`
- `onSuccess`:
  - `toast.success('Announcement created')`
  - Reset all fields to empty
  - Close sheet: `setOpen(false)`
  - `router.refresh()`
- `onError`: `toast.error('Failed to create announcement')`
- Submit button: `disabled={mutation.isPending}`, text: `mutation.isPending ? 'Creating…' : 'Create'`

---

## Step — Verify

```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bun run build
```

Must be 0 errors. Also run:
```bash
grep -r "window.confirm\|\.confirm(" src/components/dashboard/
```
Must return 0 results.

---

## Step — Update AGENT_CONTEXT.md Status Log

Add a row to the AGENT STATUS LOG table in `plans/AGENT_CONTEXT.md`:

```
| Agent B | Phase 3 — TanStack Query server-action components | DONE | settings-form.tsx, new-announcement-sheet.tsx, member-status-toggle.tsx, contact-inbox.tsx, post-delete-button.tsx, leadership-delete-button.tsx, event-delete-button.tsx, album-delete-button.tsx, publication-delete-button.tsx, announcement-actions.tsx refactored. All confirm() dialogs replaced with Dialog component. Build: 0 errors. |
```

---

## Hard Rules
- Do NOT touch: `src/app/actions/**`, `src/app/api/**`, any Server Component, `providers.tsx`, `layout.tsx`, `src/lib/api.ts`, any `*-form.tsx`, `post-editor.tsx`, `gallery-image-manager.tsx`
- Do NOT install any packages — Agent A already installed everything
- TypeScript must stay strict-clean (no `any`, no `@ts-ignore`)
- Do NOT remove any existing UI or layout — only replace state management internals
