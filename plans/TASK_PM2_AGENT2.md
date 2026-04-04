# PM2 — Agent 2 Task Brief: Forms → Server Actions (Event, Album, Gallery Image Manager)

## Read First
Read `plans/AGENT_CONTEXT.md` for full project context before starting.

## Your Job
Wire 3 form/manager components from `apiRequest` (fetch to API routes) to direct server action calls.
Both agents (Agent 1 and Agent 2) run in parallel — you own completely separate files.

## Files You Own (modify ONLY these 3)
1. `src/components/dashboard/event-form.tsx`
2. `src/components/dashboard/album-form.tsx`
3. `src/components/dashboard/gallery-image-manager.tsx`

## Migration Pattern

### Before (current state):
```typescript
import { apiRequest, ApiError } from '@/lib/api'

const mutation = useMutation({
  mutationFn: (body: SomeType) =>
    apiRequest<Result>('/api/events', { method: 'POST', body: JSON.stringify(body) }),
  onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong'),
})
```

### After (what you must produce):
```typescript
import { createEvent } from '@/app/actions/events'

const mutation = useMutation({
  mutationFn: (body: SomeType) => createEvent(body),
  onError: (err) => toast.error(err instanceof Error ? err.message : 'Something went wrong'),
})
```

## Per-File Server Action Mapping

### event-form.tsx
Import from `@/app/actions/events`:
- `POST /api/events` → `createEvent(body)`
- `PATCH /api/events/{id}` → `updateEvent(id, body)`

### album-form.tsx
Import from `@/app/actions/gallery`:
- `POST /api/gallery` → `createAlbum(body)`
- `PATCH /api/gallery/{id}` → `updateAlbum(id, body)`

### gallery-image-manager.tsx
Import from `@/app/actions/gallery`:
- `POST /api/gallery/{albumId}/images` → `addImageToAlbum(albumId, data)`
- `PATCH /api/gallery/{albumId}/images/{imageId}` (caption update) → `updateImageCaption(albumId, imageId, caption)`
- `PATCH /api/gallery/{albumId}/images/{imageId}` (sort order update) → `updateImageOrder(albumId, imageId, order)`
- `deleteGalleryImage` — **already a server action, leave it**

All functions are already implemented and exported in `src/app/actions/gallery.ts`.

## Rules
1. Read each file fully before editing
2. Replace every `apiRequest('/api/...')` call in `mutationFn` with the corresponding server action call
3. Change `err instanceof ApiError` → `err instanceof Error` in all `onError` handlers
4. Remove `apiRequest` and `ApiError` imports **only if no longer used** in that file
5. **KEEP all upload fetch calls unchanged** — `fetch('/api/upload', ...)` with FormData must stay as-is
   - In gallery-image-manager.tsx the binary file upload to `/api/upload` is FormData and cannot be a server action
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

grep "apiRequest" src/components/dashboard/event-form.tsx src/components/dashboard/album-form.tsx src/components/dashboard/gallery-image-manager.tsx
# Should return 0 results (only upload-related lines acceptable)
```

## When Done
Update `plans/AGENT_CONTEXT.md` — add a row to the AGENT STATUS LOG:
```
| PM2 Agent 2 | Forms → Server Actions (event-form, album-form, gallery-image-manager) | DONE | <brief notes> |
```
