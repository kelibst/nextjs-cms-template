# Task: Publish Button (Agent 1)

> Reference: `plans/AGENT_CONTEXT.md` for project rules (bun, proxy.ts, etc.)

## Goal
Add a "Publish" button to the page builder dashboard that explicitly pushes the page live by calling `revalidatePath` on demand. Also triggers revalidation of all DB-backed public pages.

---

## Background
- Public pages (`/`, `/about`, `/fund`, `/practice-areas`) now have `export const dynamic = 'force-dynamic'` — they always re-render
- Block saves already call `revalidatePath` in `src/app/actions/blocks.ts`
- But a manual "Publish" button gives admins an explicit confirmation that their page is live
- In production with CDN/edge caching, explicit revalidation is critical

---

## Files to Modify

### 1. `src/app/actions/blocks.ts`
Add new exported server action at the bottom:

```typescript
export async function republishPage(page: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  requireAdmin(session.user.role)

  const pathMap: Record<string, string> = {
    homepage: '/',
    about: '/about',
    fund: '/fund',
    'practice-areas': '/practice-areas',
  }

  const publicPath = pathMap[page]
  if (publicPath) {
    revalidatePath(publicPath, 'layout')
  }
  // Also sweep news and dashboard
  revalidatePath('/news', 'layout')
  revalidatePath('/dashboard/content')
}
```

### 2. `src/components/dashboard/page-builder-client.tsx`
Add "Publish" button to the header section (near the title, NOT at the bottom with "Add Block").

- Import `republishPage` from `@/app/actions/blocks`
- Import `Upload` from `lucide-react`
- Add `const [isPendingPublish, startPublish] = useTransition()`
- Add `handlePublish()` function:
```typescript
function handlePublish() {
  startPublish(async () => {
    try {
      await republishPage(page)
      toast.success('Page published successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish page')
    }
  })
}
```
- Add button to the header `<div>` (lines 154–170), after the `<p>` subtitle:
```tsx
<div className="flex items-center gap-2 mt-3">
  <Button
    size="sm"
    onClick={handlePublish}
    disabled={isPendingPublish}
    className="gap-1.5"
  >
    <Upload className="w-3.5 h-3.5" />
    {isPendingPublish ? 'Publishing...' : 'Publish Page'}
  </Button>
</div>
```

---

## Verification
1. Open `/dashboard/content/homepage`
2. Click "Publish Page" — button shows "Publishing..." then toast "Page published successfully"
3. Check that `/`, `/about`, `/fund`, `/practice-areas`, `/news` all re-render with latest data
4. Error case: if not admin → toast shows error message
