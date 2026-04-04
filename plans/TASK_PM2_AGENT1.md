# PM2 — Agent 1 Task Brief: Forms → Server Actions (Post, Leadership, Publication)

## Read First
Read `plans/AGENT_CONTEXT.md` for full project context before starting.

## Your Job
Wire 3 form components from `apiRequest` (fetch to API routes) to direct server action calls.
Both agents (Agent 1 and Agent 2) run in parallel — you own completely separate files.

## Files You Own (modify ONLY these 3)
1. `src/components/dashboard/post-editor.tsx`
2. `src/components/dashboard/leadership-form.tsx`
3. `src/components/dashboard/publication-form.tsx`

## Migration Pattern

### Before (current state):
```typescript
import { apiRequest, ApiError } from '@/lib/api'

const mutation = useMutation({
  mutationFn: (body: SomeType) =>
    apiRequest<Result>('/api/posts', { method: 'POST', body: JSON.stringify(body) }),
  onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
})
```

### After (what you must produce):
```typescript
import { createPost } from '@/app/actions/posts'

const mutation = useMutation({
  mutationFn: (body: SomeType) => createPost(body),
  onError: (err) => toast.error(err instanceof Error ? err.message : 'Something went wrong'),
})
```

## Per-File Server Action Imports

| File | Server actions to import |
|------|--------------------------|
| `post-editor.tsx` | `createPost`, `updatePost` from `@/app/actions/posts` |
| `leadership-form.tsx` | `createLeadership`, `updateLeadership` from `@/app/actions/leadership` |
| `publication-form.tsx` | `createPublication`, `updatePublication` from `@/app/actions/publications` |

## Rules
1. Read each file fully before editing
2. Replace every `apiRequest('/api/...')` call in `mutationFn` with the corresponding server action call
3. Change `err instanceof ApiError` → `err instanceof Error` in all `onError` handlers
4. Remove `apiRequest` and `ApiError` imports **only if no longer used** in that file
5. **KEEP all upload fetch calls unchanged** — `fetch('/api/upload', ...)` with FormData must stay
6. Do NOT touch `onSuccess`, router logic, toast messages, or any UI logic
7. Do NOT touch any file outside your 3 listed above

## Files You Must NOT Touch (PM1 Agent B domain)
`settings-form.tsx`, `new-announcement-sheet.tsx`, `member-status-toggle.tsx`, `contact-inbox.tsx`,
`post-delete-button.tsx`, `leadership-delete-button.tsx`, `event-delete-button.tsx`,
`album-delete-button.tsx`, `publication-delete-button.tsx`, `announcement-actions.tsx`

## Also Must NOT Touch
`src/app/actions/**`, `src/app/api/**`, `src/lib/api.ts`, `src/components/providers.tsx`, `src/app/layout.tsx`

## Verification (run after all 3 files done)
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit
# Should be 0 errors

grep "apiRequest" src/components/dashboard/post-editor.tsx src/components/dashboard/leadership-form.tsx src/components/dashboard/publication-form.tsx
# Should return 0 results (only upload calls acceptable)
```

## When Done
Update `plans/AGENT_CONTEXT.md` — add a row to the AGENT STATUS LOG:
```
| PM2 Agent 1 | Forms → Server Actions (post-editor, leadership-form, publication-form) | DONE | <brief notes> |
```
