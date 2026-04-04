# Agent A Task — TanStack Query: Infrastructure + Fetch-Based Forms

> Read plans/AGENT_CONTEXT.md first — specifically the PHASE 3 section — before touching any file.

---

## Your Role
You are Agent A. You install the packages, wire up the providers, create the shared API helper, and refactor all Client Components that call API routes via `fetch()`. Agent B depends on your `providers.tsx` changes before it can start — finish and verify before signalling done.

## Working Directory
`/home/kelib/Desktop/moreprojects/gaphto/`

## Package Manager
`bun`

---

## Step 1 — Install Packages

```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bun add @tanstack/react-query sonner
bun add -d @tanstack/react-query-devtools
```

---

## Step 2 — Create `src/lib/api.ts` (NEW FILE — do this before anything else)

```typescript
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit =
    options.body instanceof FormData
      ? (options.headers ?? {})
      : { 'Content-Type': 'application/json', ...(options.headers ?? {}) }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    let message = 'Request failed'
    try {
      const data = (await res.json()) as { error?: string }
      if (typeof data.error === 'string') message = data.error
    } catch { /* body was not JSON */ }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return {} as T
  return res.json() as Promise<T>
}
```

---

## Step 3 — Modify `src/components/providers.tsx`

Read the current file first, then replace entirely with:

```typescript
'use client'
import { useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: false,
      },
      mutations: { retry: false },
    },
  })
}

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session?: Parameters<typeof SessionProvider>[0]['session']
}) {
  const [queryClient] = useState(makeQueryClient)
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>{children}</SessionProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
```

---

## Step 4 — Modify `src/app/layout.tsx`

Read the file. Add `import { Toaster } from 'sonner'` at the top. Inside `<body>`, add `<Toaster position="bottom-right" richColors />` as a sibling AFTER `</Providers>` (not inside it).

---

## Step 5 — Refactor Fetch-Based Form Components

For each component below: read the file, then refactor. The pattern is the same for all:

**Replace:**
- `useState(saving)` / `useState(error)` / `useState(saved)` used for mutation state → remove these
- raw `fetch()` call → `apiRequest<T>()` from `@/lib/api`
- manual `setSaving(true/false)` logic → `useMutation.isPending`
- silent error swallowing → `onError: (err) => toast.error(...)`
- success redirect → `onSuccess: () => { toast.success('...'); router.push('...') }`

**Keep:**
- All form field `useState` (title, slug, description, etc.) — these are UI state, not mutation state
- Upload logic structure (but wrap the upload fetch in `apiRequest` too)
- All TypeScript types

**Import pattern for all refactored components:**
```typescript
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiRequest, ApiError } from '@/lib/api'
```

---

### 5a. `src/components/dashboard/leadership-form.tsx`

- Has upload step (fetch to `/api/upload`) + save step (fetch to `/api/leadership` POST or PATCH)
- Two separate `useMutation` instances OR one combined mutation function that does both steps sequentially
- On success: `toast.success(isEdit ? 'Member updated' : 'Member added')` then `router.push('/dashboard/leadership')`
- On error: `toast.error(err instanceof ApiError ? err.message : 'Something went wrong')`
- Button: `disabled={mutation.isPending}`, text: `mutation.isPending ? 'Saving…' : (isEdit ? 'Update' : 'Add Member')`

---

### 5b. `src/components/dashboard/event-form.tsx`

- Has upload step + save step to `/api/events`
- Same two-step mutation pattern as leadership-form
- On success: `toast.success(isEdit ? 'Event updated' : 'Event created')` then `router.push('/dashboard/events')`

---

### 5c. `src/components/dashboard/publication-form.tsx`

- Has upload step + save step to `/api/publications`
- On success: `toast.success(isEdit ? 'Publication updated' : 'Publication added')` then `router.push('/dashboard/publications')`

---

### 5d. `src/components/dashboard/album-form.tsx`

- No upload step — just POST/PATCH to `/api/gallery`
- On success: `toast.success(isEdit ? 'Album updated' : 'Album created')` then `router.push('/dashboard/gallery')`

---

### 5e. `src/components/dashboard/post-editor.tsx`

This is the most complex. Read it carefully before refactoring.

- Has upload mutation (fetch to `/api/upload` with FormData) — wrap in `useMutation`
- Has save mutation (fetch to `/api/posts` POST or PATCH) — wrap in separate `useMutation`
- Both share `isPending` state: `disabled={uploadMutation.isPending || saveMutation.isPending}`
- Upload mutation: fires when image is selected, updates `featuredImage` state on success
- Save mutation: fires on form submit
- On save success: `toast.success('Post saved')` then `router.push('/dashboard/posts')`
- Keep all TipTap editor logic completely untouched

---

### 5f. `src/components/dashboard/gallery-image-manager.tsx`

This is the most complex component. Read the entire file before refactoring.

**Current problems:**
- Stale closure: `sortOrder: images.length` captured in a closure — wrong when images update between renders
- No error feedback on upload/delete/caption failure
- Manual `uploading` state tracked per-upload

**Fix for sortOrder stale closure — add a ref:**
```typescript
const imagesRef = useRef<typeof images>([])
useEffect(() => { imagesRef.current = images }, [images])
// Then use imagesRef.current.length for sortOrder instead of images.length
```

**Separate useMutation for each operation:**

1. `uploadMutation` — upload file then create image record:
```typescript
const uploadMutation = useMutation({
  mutationFn: async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const { url } = await apiRequest<{ url: string }>('/api/upload', { method: 'POST', body: fd })
    return apiRequest<GalleryImage>(`/api/gallery/${albumId}/images`, {
      method: 'POST',
      body: JSON.stringify({ url, caption: '', sortOrder: imagesRef.current.length }),
    })
  },
  onSuccess: (newImage) => setImages(prev => [...prev, newImage]),
  onError: () => toast.error('Failed to upload image'),
})
```

2. `captionMutation` — save caption edit:
```typescript
const captionMutation = useMutation({
  mutationFn: ({ imageId, caption }: { imageId: string; caption: string }) =>
    apiRequest(`/api/gallery/${albumId}/images/${imageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ caption }),
    }),
  onSuccess: (_, { imageId, caption }) => {
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, caption } : img))
    setEditingCaption(null)
    toast.success('Caption saved')
  },
  onError: () => toast.error('Failed to save caption'),
})
```

3. `deleteMutation` — delete image:
```typescript
const deleteMutation = useMutation({
  mutationFn: (imageId: string) =>
    apiRequest(`/api/gallery/${albumId}/images/${imageId}`, { method: 'DELETE' }),
  onSuccess: (_, imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
    toast.success('Image deleted')
  },
  onError: () => toast.error('Failed to delete image'),
})
```

For the file loop (multiple uploads), call `uploadMutation.mutateAsync(file)` in sequence inside a try/catch loop — do NOT use `mutate()` in a loop as it does not await.

---

## Step 6 — Verify

```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bun run build
```

Must produce 0 TypeScript errors and 0 Next.js build errors. Fix any type issues before marking done.

Also run:
```bash
grep -r "await fetch(" src/components/dashboard/post-editor.tsx src/components/dashboard/leadership-form.tsx src/components/dashboard/event-form.tsx src/components/dashboard/publication-form.tsx src/components/dashboard/album-form.tsx src/components/dashboard/gallery-image-manager.tsx
```
Should return 0 results (all replaced with apiRequest).

---

## Step 7 — Update AGENT_CONTEXT.md Status Log

Add a row to the AGENT STATUS LOG table in `plans/AGENT_CONTEXT.md`:

```
| Agent A | Phase 3 — TanStack Query infrastructure + fetch forms | DONE | src/lib/api.ts (new), providers.tsx (QueryClientProvider), layout.tsx (Toaster), post-editor.tsx, leadership-form.tsx, event-form.tsx, publication-form.tsx, album-form.tsx, gallery-image-manager.tsx refactored. Build: 0 errors. |
```

---

## Hard Rules
- Do NOT touch: `src/app/actions/**`, `src/app/api/**`, any Server Component (`page.tsx` in dashboard), any `*-delete-button.tsx`, `settings-form.tsx`, `new-announcement-sheet.tsx`, `member-status-toggle.tsx`, `contact-inbox.tsx`, `announcement-actions.tsx`
- Do NOT add features beyond the refactor — keep existing form field logic identical
- TypeScript must stay strict-clean (no `any`, no `@ts-ignore`)
