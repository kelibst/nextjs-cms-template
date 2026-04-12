# TASK: Storage Agent 2 — Media Manager UI + Form Integration
> **PREREQUISITE: Agent 1 must be DONE before you start.**
> Read `plans/AGENT_CONTEXT.md` "ACTIVE SPRINT" section. Read `plans/TASK_STORAGE_A_INFRA.md` to understand what Agent 1 built.
> When done, update your STATUS in AGENT_CONTEXT.md.

## Your Role
Build the Media Manager UI and wire file picking into all dashboard forms. Agent 1 has already created:
- `src/lib/storage.ts` — MinIO client
- `src/lib/media-url.ts` — `getMediaUrl()` helper
- `src/app/actions/media.ts` — `getMediaFiles()`, `deleteMediaFile()`, `getMediaFile()`
- Updated `/api/upload` returns `{ url, id }`

---

## Checklist

### Step 1 — Media Manager Page (`src/app/(dashboard)/dashboard/media/page.tsx`)
This is a full-featured asset browser. Make it a `'use client'` component (or server component with a client sub-component for interactions).

**Features:**
- Page title "Media Library" with an upload button in the top-right
- **Filter tabs**: All | Images | Documents (uses `getMediaFiles({ mimeType: 'image' })` or `'application/pdf'` etc.)
- **Search input**: debounced, filters by filename via `getMediaFiles({ search })`
- **Grid layout**: responsive (2-3-4-5 cols), each card shows:
  - Image preview (using `<img>` tag with `object-cover`) for images, a file icon for PDFs/docs
  - File name (truncated) below
  - On hover: overlay with two icon buttons — "Copy URL" (clipboard) and "Delete" (trash, with confirmation)
- **Upload zone**: Click "Upload" button → opens file input (multiple allowed) → uploads each to `/api/upload` → refreshes grid
- **File detail dialog** (shadcn Dialog): clicking a card opens a dialog with larger preview + metadata (filename, size, type, upload date)
- **Pagination**: "Load more" button at the bottom (or simple page nav)
- Use `sonner` toast for copy/delete feedback
- Permission: accessible to users with `posts:create` permission (check via session)

### Step 2 — Reusable File Picker Modal (`src/components/dashboard/media-picker-modal.tsx`)
A modal sheet that embeds a slimmer version of the media manager for use inside forms.

**Props:**
```ts
interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  accept?: 'image' | 'document' | 'all'; // filters shown files
  title?: string; // defaults to "Choose Media"
}
```

**Features:**
- shadcn `Dialog` or `Sheet` (Sheet recommended for right-side slide-in feel)
- Same search + filter + grid as Media Manager
- Clicking a file card calls `onSelect(url)` then `onClose()`
- "Upload new" button at top: upload inline, then auto-select the uploaded file
- No delete action in picker (read-only browsing + upload only)

### Step 3 — Wire MediaPickerModal into Post Editor
File: `src/components/dashboard/post-editor.tsx`
Read the file first. Find the featured image upload section.

Replace the inline `<input type="file">` for featured image with:
- Small thumbnail preview (if `featuredImage` is set)
- Two buttons: "Choose from Media Library" (opens MediaPickerModal) + "Upload New" (opens file input, uploads, sets URL)
- Clear button (×) to remove the image
- On `onSelect(url)` from the modal: set the featured image field value

### Step 4 — Wire into Event Form
File: `src/components/dashboard/event-form.tsx`
Same pattern as Step 3 — replace featured image file input with picker + preview.

### Step 5 — Wire into Leadership Form
File: `src/components/dashboard/leadership-form.tsx`
Same pattern — replace member photo file input with picker + preview.

### Step 6 — Wire into Publication Form
File: `src/components/dashboard/publication-form.tsx`
For the file URL field: add "Choose from Media Library" button (filter `accept='document'`) + "Upload New" for direct upload.
Show the selected filename (not a thumbnail, since it's a PDF/doc).

### Step 7 — Wire into Gallery Image Manager
File: `src/components/dashboard/gallery-image-manager.tsx`
Read the file. Keep the existing multi-upload flow intact. Add a secondary option:
- A "Choose from Library" button that opens MediaPickerModal (filter: images only)
- Selecting from the picker adds that image to the album (calls `addImageToAlbum`)

### Step 8 — Block Editor Image Pickers
Read the following files, then add MediaPickerModal to each:

**`src/components/dashboard/block-editor/hero-block-editor.tsx`**
- Find the `heroImage` field (URL text input or similar)
- Replace with: thumbnail preview + "Choose from Media" button + clear button

**`src/components/dashboard/block-editor/image-banner-block-editor.tsx`** (may not exist yet — check index.ts)
- If exists: add picker for `imageUrl`
- If not: skip

**`src/components/dashboard/block-editor/rich-text-block-editor.tsx`**
- If it has an image insertion feature: add picker there
- Otherwise skip

Check `src/components/dashboard/block-editor/index.ts` to see which editors exist.

### Step 9 — Dashboard Sidebar
File: `src/components/dashboard/sidebar.tsx`
Read the file. Find the "Media" group (contains Gallery and Publications links).
Add a new nav item before Gallery:
```tsx
{ href: '/dashboard/media', label: 'Media Library', icon: ImageIcon, permission: 'posts:create' }
```
Import `ImageIcon` from `lucide-react`. Check existing pattern for how nav items are rendered.

### Step 10 — URL Compatibility Sweep
Replace hardcoded `/images/` path construction in high-traffic spots with `getMediaUrl()`:

1. `src/lib/data.ts` — find `localImagePath()` function. Update the return to use `getMediaUrl()`:
   ```ts
   import { getMediaUrl } from '@/lib/media-url';
   // ... inside localImagePath:
   return getMediaUrl(`/images/${stripped}`);
   ```
   This is a no-op for existing paths (they start with `/` so getMediaUrl returns them unchanged) but enables future MinIO keys to work too.

2. `src/app/(public)/gallery/gallery-client.tsx` line ~55:
   ```ts
   // Before: const src = `/images/${img.localPath}`
   // After:
   import { getMediaUrl } from '@/lib/media-url';
   const src = getMediaUrl(img.url || `/images/${img.localPath}`);
   ```

3. `src/components/home/leadership-preview.tsx` — wrap `localImage` path with `getMediaUrl()`

---

## Key Imports / Patterns

```ts
// Server action import
import { getMediaFiles, deleteMediaFile } from '@/app/actions/media';

// URL helper
import { getMediaUrl } from '@/lib/media-url';

// UI components (already installed)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Icons
import { ImageIcon, Trash2, Copy, Upload, X } from 'lucide-react';
```

---

## Verification
After completing all steps:
1. `bunx tsc --noEmit` — zero errors
2. `bun dev` — start the dev server
3. Navigate to `/dashboard/media` — should show empty grid (or any previously uploaded files)
4. Upload an image — should appear in grid and in MinIO console at `http://localhost:9001`
5. Open a post editor → click "Choose from Media Library" → picker opens → select image → featured image updates
6. Check that existing gallery public pages still load (legacy `/images/` paths unbroken)

## On Completion
Update `plans/AGENT_CONTEXT.md`:
- Change Agent 2 Status from `WAITING` → `DONE ✅`
- Add a work log entry under `## Agent Work Log`
