# Agent B Task — Theme System: Dashboard

> Read plans/AGENT_CONTEXT.md — PHASE 3b section — before touching any file.
> **PRECONDITION:** Confirm `--primary-deep` and `--primary-hover` exist in `src/app/globals.css` before starting. Agent A must complete first.

---

## Your Role
You are Agent B for the theme implementation. You replace hardcoded colors in all dashboard components and pages. You do NOT touch state management logic — only CSS class replacements.

## Working Directory
`/home/kelib/Desktop/moreprojects/gaphto/`

---

## What Agent A Already Did (do NOT redo)
- Installed `next-themes`
- Updated globals.css with new color tokens
- Updated providers.tsx (ThemeProvider) and layout.tsx (suppressHydrationWarning)
- Created theme-toggle.tsx
- Refactored all public pages, layout, and home components

---

## Universal Color Replacement Reference

### Brand green → semantic tokens
| Hardcoded | Replace with |
|---|---|
| `bg-green-950` | `bg-primary-deep` |
| `bg-green-800` / `hover:bg-green-800` | `bg-primary-hover` / `hover:bg-primary-hover` |
| `bg-green-700` | `bg-primary` |
| `bg-green-100` | `bg-primary-muted` |
| `bg-green-50` | `bg-primary-subtle` |
| `text-green-800` / `hover:text-green-800` | `text-primary/80` / `hover:text-primary/80` |
| `text-green-700` / `text-green-600` | `text-primary` |
| `text-green-500` | `bg-primary/80` or `text-primary/80` |
| `text-green-400` | `text-primary-foreground/60` (inside dark bg) |
| `text-green-300` | `text-primary-foreground/70` (inside dark bg) |
| `text-green-200` | `text-primary-foreground/60` (inside dark bg) |
| `text-green-100` | `text-primary-foreground/80` (inside dark bg) |
| `border-green-900` / `border-green-800` | `border-primary-deep` / `border-primary/30` |
| `border-green-700` | `border-primary` |
| `border-green-300` / `border-green-200` | `border-primary/50` / `border-primary-muted` |
| `hover:border-green-500` | `hover:border-primary` |

### Gray neutrals → semantic tokens
| Hardcoded | Replace with |
|---|---|
| `bg-white` (cards/panels) | `bg-card` |
| `bg-gray-50` | `bg-muted/50` |
| `bg-gray-100` | `bg-muted` |
| `bg-gray-200` | `bg-muted` |
| `text-gray-900` | `text-foreground` |
| `text-gray-700` | `text-foreground/80` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-500` | `text-muted-foreground` |
| `text-gray-400` | `text-muted-foreground/70` |
| `text-gray-300` | `text-muted-foreground/40` |
| `border-gray-200` | `border-border` |
| `border-gray-100` | `border-border/50` |
| `divide-gray-100` | `divide-border/50` |
| `hover:bg-gray-50` | `hover:bg-muted/50` |
| `hover:bg-gray-100` / `hover:bg-gray-200` | `hover:bg-muted` |

### Status badge rule — add dark: variants, keep light mode palette
```
bg-green-100 text-green-700  → same + dark:bg-green-900/30 dark:text-green-400
bg-green-50 text-green-700   → same + dark:bg-green-900/30 dark:text-green-400
bg-green-50 text-green-600   → same + dark:bg-green-900/30 dark:text-green-400
bg-red-100 text-red-600      → same + dark:bg-red-900/30 dark:text-red-400
bg-red-50 text-red-600       → same + dark:bg-red-900/30 dark:text-red-400
bg-blue-100 text-blue-700    → same + dark:bg-blue-900/30 dark:text-blue-400
bg-blue-50 text-blue-700     → same + dark:bg-blue-900/30 dark:text-blue-400
bg-amber-100 text-amber-800  → same + dark:bg-amber-900/30 dark:text-amber-400
bg-purple-100 text-purple-700 → same + dark:bg-purple-900/30 dark:text-purple-400
bg-purple-50 text-purple-700  → same + dark:bg-purple-900/30 dark:text-purple-400
bg-gray-100 text-gray-600    → bg-muted text-muted-foreground (auto-adapts, no dark: needed)
bg-slate-100 text-slate-*    → bg-muted text-muted-foreground
bg-orange-50 text-orange-*   → same + dark:bg-orange-900/30 dark:text-orange-400
```

---

## SIDEBAR RULE (critical)
**`bg-primary-deep` is THE SAME VALUE in both light and dark mode.**
This is intentional — the sidebar is permanently deep green (like a SaaS product sidebar).
Do NOT add any `dark:` variants to sidebar background or text classes. The mapping handles it.

---

## Components to Modify (colors only)

### `src/components/dashboard/sidebar.tsx`
Read file. Apply:
- `bg-green-950` (aside) → `bg-primary-deep`
- `border-b border-green-800` → `border-b border-primary/30`
- `bg-green-700 text-green-100` (Admin/Editor badge) → `bg-primary text-primary-foreground`
- `text-green-500` (section labels like "CONTENT") → `text-primary-foreground/50`
- `bg-green-700 text-white` (active nav item bg) → `bg-primary text-primary-foreground`
- `text-green-300 hover:bg-green-800 hover:text-white` (inactive nav items) → `text-primary-foreground/70 hover:bg-primary/20 hover:text-primary-foreground`
- `border-t border-green-800` (bottom section) → `border-t border-primary/30`
- `text-green-400 hover:text-white hover:bg-green-800` (back-to-site link) → `text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary/20`

---

### `src/components/dashboard/topbar.tsx`
Read file. Apply:
- `bg-white border-b border-gray-200` → `bg-card border-b border-border`
- `text-gray-500` (breadcrumb) → `text-muted-foreground`
- `text-gray-900` (current section) → `text-foreground`
- `text-gray-900` (username) → `text-foreground`
- `bg-purple-100 text-purple-700` (super_admin) → same + `dark:bg-purple-900/30 dark:text-purple-400`
- `bg-blue-100 text-blue-700` (admin) → same + `dark:bg-blue-900/30 dark:text-blue-400`
- `bg-green-100 text-green-700` (editor) → `bg-primary-muted text-primary`
- `bg-gray-100 text-gray-600` (fallback) → `bg-muted text-muted-foreground`
- `text-gray-500 hover:text-red-600` (sign out) → `text-muted-foreground hover:text-destructive`

---

### `src/components/dashboard/data-table.tsx`
Read file. Apply:
- `bg-white rounded-xl border border-gray-200` → `bg-card rounded-xl border border-border`
- `bg-gray-50` (header row) → `bg-muted/50`
- `bg-gray-100 rounded animate-pulse` (skeleton) → `bg-muted rounded animate-pulse`
- `text-gray-400` (empty state) → `text-muted-foreground`

---

### `src/components/dashboard/post-editor.tsx`
Read file. Apply color replacements — do NOT touch useMutation, apiRequest calls, upload logic, TipTap editor setup, or form field state:
- `text-gray-900 placeholder:text-gray-300` (title) → `text-foreground placeholder:text-muted-foreground/50`
- `text-gray-400` (Slug: label) → `text-muted-foreground/70`
- `border-dashed border-gray-300` → `border-dashed border-border`
- `text-gray-500` (slug value) → `text-muted-foreground`
- `text-xs font-medium text-gray-600` (field labels) → `text-xs font-medium text-muted-foreground`
- `border border-gray-200 rounded-t-lg bg-gray-50` (toolbar) → `border border-border rounded-t-lg bg-muted/50`
- `hover:bg-gray-200` (toolbar buttons) → `hover:bg-muted`
- `text-gray-600` (toolbar icons) → `text-muted-foreground`
- `border border-gray-200` (editor area border) → `border border-border`
- `focus-within:ring-green-500/20` → `focus-within:ring-primary/20`
- `bg-green-700 hover:bg-green-800 text-white` (Save/Publish btn) → `bg-primary hover:bg-primary-hover text-primary-foreground`

---

### `src/components/dashboard/leadership-form.tsx`
Read file. Colors only — do NOT touch useMutation/apiRequest logic:
- `bg-gray-50 rounded-lg` (toggle row bg) → `bg-muted/50 rounded-lg`
- `bg-green-700 hover:bg-green-800 text-white` (save btn) → `bg-primary hover:bg-primary-hover text-primary-foreground`

---

### `src/components/dashboard/event-form.tsx`
Read file. Colors only:
- `bg-green-700 hover:bg-green-800 text-white` (save btn) → `bg-primary hover:bg-primary-hover text-primary-foreground`

---

### `src/components/dashboard/publication-form.tsx`
Read file. Colors only:
- `bg-gray-50 rounded-lg` (Members Only row) → `bg-muted/50 rounded-lg`
- `bg-gray-100 px-2 py-0.5 rounded` (file type badge) → `bg-muted px-2 py-0.5 rounded`
- `text-gray-500` (file info) → `text-muted-foreground`
- `bg-green-700 hover:bg-green-800 text-white` (save btn) → `bg-primary hover:bg-primary-hover text-primary-foreground`

---

### `src/components/dashboard/album-form.tsx`
Read file. Colors only:
- `bg-green-700 hover:bg-green-800 text-white` (save btn) → `bg-primary hover:bg-primary-hover text-primary-foreground`

---

### `src/components/dashboard/gallery-image-manager.tsx`
Read file. Colors only — do NOT touch useMutation, useRef, setImages state:
- `border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-700` (upload label) → `border-border text-muted-foreground hover:border-primary hover:text-primary`
- `text-gray-400` (no images text) → `text-muted-foreground/70`
- `border-gray-200 bg-gray-50` (image card) → `border-border bg-muted/30`
- `text-gray-500 hover:text-green-700` (caption text) → `text-muted-foreground hover:text-primary`
- `text-gray-300 italic` (Add caption placeholder) → `text-muted-foreground/40 italic`
- `bg-green-700 text-white` (caption save btn) → `bg-primary text-primary-foreground`

---

### `src/components/dashboard/settings-form.tsx`
**COLORS ONLY — do NOT touch useMutation, useState(values), saveSettings call, or button text logic:**
- `bg-white rounded-xl border border-gray-200` (group container) → `bg-card rounded-xl border border-border`
- `text-gray-700 uppercase` (group heading) → `text-foreground/80 uppercase`
- `text-gray-600` (field labels) → `text-muted-foreground`
- `bg-green-700 hover:bg-green-800 text-white` (save btn) → `bg-primary hover:bg-primary-hover text-primary-foreground`

---

### `src/components/dashboard/new-announcement-sheet.tsx`
**COLORS ONLY — do NOT touch useMutation, field states, reset logic:**
- `bg-green-700 hover:bg-green-800 text-white` (trigger btn) → `bg-primary hover:bg-primary-hover text-primary-foreground`
- `bg-green-700 hover:bg-green-800 text-white` (Create btn inside sheet) → `bg-primary hover:bg-primary-hover text-primary-foreground`

---

### `src/components/dashboard/member-status-toggle.tsx`
**COLORS ONLY — do NOT touch useMutation, optimistic state, setStatus, rollback logic:**
- Scan for any hardcoded green/gray classes and apply mapping
- The Switch component uses shadcn's `data-[state=checked]` which maps to `--primary` automatically — no changes needed if it already uses shadcn Switch

---

### `src/components/dashboard/contact-inbox.tsx`
**COLORS ONLY — do NOT touch useMutation, localMessages state, markMessageRead, handleSelect:**
- `bg-white rounded-xl border border-gray-200` (outer) → `bg-card rounded-xl border border-border`
- `border-b border-gray-200` → `border-b border-border`
- `border-r border-gray-200` → `border-r border-border`
- `border-b border-gray-100` (filter area) → `border-b border-border/50`
- `bg-green-700 text-white` (active filter) → `bg-primary text-primary-foreground`
- `bg-gray-100 text-gray-600 hover:bg-gray-200` (inactive filter) → `bg-muted text-muted-foreground hover:bg-muted/80`
- `text-gray-400` (No messages) → `text-muted-foreground/70`
- `border-b border-gray-100 hover:bg-gray-50` (message row) → `border-b border-border/50 hover:bg-muted/50`
- `bg-green-50` (selected message) → `bg-primary-subtle`
- `text-gray-900` (unread name) → `text-foreground`
- `text-gray-700` (read name) → `text-foreground/80`
- `text-gray-400` (date in list) → `text-muted-foreground/70`
- `text-gray-500` (subject) → `text-muted-foreground`
- `text-gray-400` (empty detail) → `text-muted-foreground`
- `text-gray-900` (subject heading) → `text-foreground`
- `text-gray-500` (from line) → `text-muted-foreground`
- `text-gray-700` (from name) → `text-foreground/80`
- `text-green-700 hover:text-green-800` (Reply by Email) → `text-primary hover:text-primary/80`
- `bg-gray-50 rounded-lg text-gray-700` (message body) → `bg-muted/50 rounded-lg text-foreground/80`

---

### All delete buttons + announcement-actions
For these files — add only `dark:hover:bg-red-950/30` to the ghost trigger button. Nothing else changes.

Files:
- `src/components/dashboard/post-delete-button.tsx`
- `src/components/dashboard/leadership-delete-button.tsx`
- `src/components/dashboard/event-delete-button.tsx`
- `src/components/dashboard/album-delete-button.tsx`
- `src/components/dashboard/publication-delete-button.tsx`
- `src/components/dashboard/announcement-actions.tsx`

Pattern: find the ghost trigger button (the trash/delete icon button) and add `dark:hover:bg-red-950/30` to its className.

---

## Dashboard Layout and Pages

### `src/app/(dashboard)/layout.tsx`
- `bg-gray-50` (outer div) → `bg-muted/30`

### All `src/app/(dashboard)/dashboard/**/*.tsx` pages

Read each file, apply these universal rules:

**Page headings/text:**
- `text-gray-900` → `text-foreground`
- `text-gray-500` → `text-muted-foreground`
- `text-gray-400` → `text-muted-foreground/70`

**Table/card containers:**
- `bg-white rounded-xl border border-gray-200` → `bg-card rounded-xl border border-border`
- `bg-gray-50` (table header row) → `bg-muted/50`
- `divide-y divide-gray-100` → `divide-y divide-border/50`
- `hover:bg-gray-50` (table row hover) → `hover:bg-muted/50`

**Action buttons (New Post, New Event, etc.):**
- `bg-green-700 hover:bg-green-800 text-white` → `bg-primary hover:bg-primary-hover text-primary-foreground`

**Icon backgrounds (stat cards):**
- `bg-green-50` (with green icon) → `bg-primary-subtle`
- `text-green-600` (green icon) → `text-primary`
- Keep `bg-blue-50`, `bg-purple-50`, `bg-orange-50` — non-brand status icons

**Status badges — apply dark: variants per status badge rule above**

**Links in tables:**
- `hover:text-green-700 hover:underline` → `hover:text-primary hover:underline`

**Empty state text:**
- `text-gray-400` → `text-muted-foreground/70`

**Dashboard overview page (`page.tsx`) specific:**
- `bg-green-50 text-green-600` (Members stat icon) → `bg-primary-subtle text-primary`
- `divide-y divide-gray-100` (recent items lists) → `divide-y divide-border/50`

**Gallery page specific:**
- `bg-gray-100` (album cover placeholder) → `bg-muted`
- `text-gray-300` (Images icon placeholder) → `text-muted-foreground/40`
- `text-gray-400` (album metadata) → `text-muted-foreground/70`

---

## Verify

```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bun run build
```

Must be 0 errors.

```bash
grep -r "bg-green-[0-9]" src/components/dashboard/ src/app/\(dashboard\)/
grep -r "bg-gray-[0-9]" src/components/dashboard/ src/app/\(dashboard\)/
grep -r "text-green-[0-9]" src/components/dashboard/ src/app/\(dashboard\)/
grep -r "text-gray-[0-9]" src/components/dashboard/ src/app/\(dashboard\)/
```

These should return 0 results (status badge dark: variants are the only acceptable remaining palette classes).

---

## Update AGENT_CONTEXT.md Status Log

Add to AGENT STATUS LOG:
```
| Agent B | Phase 3b — Theme: dashboard components + pages | DONE | sidebar, topbar, data-table, all dashboard form components (colors only), contact-inbox, settings-form, delete buttons (dark: variants), announcement-actions, all dashboard pages refactored. Build: 0 errors. |
```

---

## Hard Rules
- Do NOT touch `src/app/globals.css` — Agent A owns it
- Do NOT touch `providers.tsx`, `layout.tsx`, `theme-toggle.tsx` — Agent A owns them
- Do NOT touch any public pages (home, news, leadership, gallery, etc.)
- Do NOT touch `src/app/actions/**`, `src/app/api/**`, `src/auth.ts`, `src/lib/db.ts`
- Do NOT touch useMutation, useState form fields, router logic, server action calls
- TypeScript must remain strict-clean
