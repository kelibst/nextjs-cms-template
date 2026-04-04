# Agent A Task — Theme System: Foundation + Public Pages

> Read plans/AGENT_CONTEXT.md — PHASE 3b section — before touching any file.

---

## Your Role
You are Agent A for the theme implementation. You install next-themes, rewire the CSS token system, and replace all hardcoded colors on the public-facing site. Agent B depends on your globals.css changes before starting on the dashboard.

## Working Directory
`/home/kelib/Desktop/moreprojects/gaphto/`

## Package Manager: `bun`

---

## Step 1 — Install
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bun add next-themes
```

---

## Step 2 — `src/app/globals.css`

Read the file first. Make these exact changes:

### In `:root {}` block — replace primary (currently gray) with GAPHTO green and add 4 new tokens:
```css
--primary: oklch(0.527 0.154 150.069);          /* green-700 */
--primary-foreground: oklch(1 0 0);              /* pure white */
--primary-hover: oklch(0.448 0.119 151.328);     /* green-800 */
--primary-subtle: oklch(0.982 0.018 155.826);    /* green-50 */
--primary-muted: oklch(0.962 0.044 156.743);     /* green-100 */
--primary-deep: oklch(0.206 0.074 152.934);      /* green-950 */
```

### In `.dark {}` block — replace gray primary with lighter green:
```css
--primary: oklch(0.696 0.17 162.48);             /* emerald-400 */
--primary-foreground: oklch(0.145 0 0);          /* dark text on light green */
--primary-hover: oklch(0.627 0.194 149.214);     /* green-500 */
--primary-subtle: oklch(0.206 0.074 152.934);    /* green-950 (inverted) */
--primary-muted: oklch(0.237 0.066 152.77);      /* green-900ish */
--primary-deep: oklch(0.206 0.074 152.934);      /* same as light — sidebar stays dark */
```

### In `@theme inline {}` block — add these 4 lines after `--color-primary-foreground`:
```css
--color-primary-hover: var(--primary-hover);
--color-primary-subtle: var(--primary-subtle);
--color-primary-muted: var(--primary-muted);
--color-primary-deep: var(--primary-deep);
```

---

## Step 3 — `src/components/providers.tsx`

Read file. Add ThemeProvider as the **outermost** wrapper. Keep QueryClientProvider and SessionProvider inside it unchanged.

```tsx
import { ThemeProvider } from 'next-themes'

// Structure:
// <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
//   <QueryClientProvider client={queryClient}>
//     <SessionProvider session={session}>{children}</SessionProvider>
//     {devtools}
//   </QueryClientProvider>
// </ThemeProvider>
```

---

## Step 4 — `src/app/layout.tsx`

Read file. Add `suppressHydrationWarning` to the `<html>` opening tag. No other changes.

```tsx
<html lang="en" suppressHydrationWarning className={cn(...)}>
```

---

## Step 5 — NEW: `src/components/shared/theme-toggle.tsx`

```tsx
'use client'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

---

## Universal Color Replacement Reference

Use this mapping for all files below. Read each file carefully before editing.

### Brand green → semantic tokens
| Hardcoded | Replace with |
|---|---|
| `bg-green-950` | `bg-primary-deep` |
| `bg-green-800` | `bg-primary-hover` |
| `hover:bg-green-800` | `hover:bg-primary-hover` |
| `bg-green-700` | `bg-primary` |
| `bg-green-100` | `bg-primary-muted` |
| `bg-green-50` | `bg-primary-subtle` |
| `text-green-800` | `text-primary/80` |
| `hover:text-green-800` | `hover:text-primary/80` |
| `text-green-700` | `text-primary` |
| `text-green-600` | `text-primary` |
| `text-green-500` | `text-primary/80` |
| `text-green-400` | `text-primary-foreground/60` (when on dark bg) |
| `text-green-300` | `text-primary-foreground/70` (when on dark bg) |
| `text-green-200` | `text-primary-foreground/60` (when on dark bg) |
| `text-green-100` | `text-primary-foreground/80` (when on dark bg) |
| `border-green-950` / `border-green-900` | `border-primary-deep` |
| `border-green-800` | `border-primary/30` |
| `border-green-700` | `border-primary` |
| `border-green-400` | `border-primary/50` |
| `border-green-300` | `border-primary/50` |
| `border-green-200` | `border-primary-muted` |
| `border-green-100` | `border-primary-subtle` |
| `focus:ring-green-500` | `focus:ring-primary` |
| `shadow-green-200` | `shadow-primary/20` |

### Gray neutrals → semantic tokens
| Hardcoded | Replace with |
|---|---|
| `bg-white` (content/section bg) | `bg-background` |
| `bg-white` (card/panel bg) | `bg-card` |
| `bg-gray-50` | `bg-muted/50` |
| `bg-gray-100` | `bg-muted` |
| `bg-gray-200` | `bg-muted` |
| `text-gray-900` | `text-foreground` |
| `text-gray-800` | `text-foreground` |
| `text-gray-700` | `text-foreground/80` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-500` | `text-muted-foreground` |
| `text-gray-400` | `text-muted-foreground/70` |
| `text-gray-300` | `text-muted-foreground/40` |
| `border-gray-200` | `border-border` |
| `border-gray-100` | `border-border/50` |
| `divide-gray-100` | `divide-border/50` |

### Inline hex styles → CSS variables
```tsx
// In hero-carousel.tsx only:
style={{ background: '#d1fae5' }}    →   style={{ background: 'var(--primary-subtle)' }}
style={{ background: '#f0faf0' }}    →   style={{ background: 'var(--background)' }}
// dot grid color #16a34a33:
backgroundImage: 'radial-gradient(circle, #16a34a33 1px, transparent 1px)'
→ backgroundImage: `radial-gradient(circle, oklch(from var(--primary) l c h / 0.2) 1px, transparent 1px)`
```

### Status badge rule (keep palette colors, add dark: variants)
```
bg-green-100 text-green-700 border-green-200  →  same + dark:bg-green-900/30 dark:text-green-400 dark:border-green-800
bg-blue-100 text-blue-700 border-blue-200     →  same + dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800
bg-amber-100 text-amber-800 border-amber-200  →  same + dark:bg-amber-900/30 dark:text-amber-400
bg-purple-100 text-purple-700                 →  same + dark:bg-purple-900/30 dark:text-purple-400
bg-red-50/100 text-red-600/700                →  same + dark:bg-red-900/30 dark:text-red-400
bg-gray-100 text-gray-600                     →  bg-muted text-muted-foreground (auto-adapts)
```

---

## Step 6 — `src/components/layout/header.tsx`

Read full file. Apply color mapping:
- `bg-white` (header container) → `bg-background`
- `bg-green-700` (avatar bg) → `bg-primary`
- `text-green-700` (logo) → `text-primary`
- `group-hover:text-green-800` → `group-hover:text-primary/80`
- `text-gray-500` (subtitle, icons) → `text-muted-foreground`
- `text-gray-700 hover:text-green-700 hover:bg-green-50` (nav links) → `text-foreground/80 hover:text-primary hover:bg-primary-subtle`
- `bg-gray-200` (skeleton) → `bg-muted`
- `hover:bg-green-50` (user trigger) → `hover:bg-primary-subtle`
- `text-gray-700` (username in dropdown) → `text-foreground/80`
- `text-gray-500` (email, chevron) → `text-muted-foreground`
- `border-green-700 text-green-700 hover:bg-green-700 hover:text-white` (Sign In btn) → `border-primary text-primary hover:bg-primary hover:text-primary-foreground`
- `bg-white border-t border-gray-100` (mobile menu panel) → `bg-background border-t border-border/50`
- `text-gray-700 hover:text-green-700 hover:bg-green-50` (mobile links) → `text-foreground/80 hover:text-primary hover:bg-primary-subtle`
- `border-gray-100` (mobile dividers) → `border-border/50`
- `text-gray-900` (mobile username) → `text-foreground`
- `hover:bg-green-50` (mobile member centre) → `hover:bg-primary-subtle`
- Mobile sign-in button: apply same primary token pattern
- Add `import { ThemeToggle } from '@/components/shared/theme-toggle'`
- Insert `<ThemeToggle />` in the flex container before the auth/session buttons

---

## Step 7 — `src/components/layout/footer.tsx`

Read file. Apply mapping:
- `bg-green-950` → `bg-primary-deep`
- `text-green-100` → `text-primary-foreground/90`
- `text-green-300` → `text-primary-foreground/70`
- `hover:text-white` → `hover:text-primary-foreground`
- `text-white` (section headings) → `text-primary-foreground`
- `border-t border-green-900` → `border-t border-primary/30`
- `text-green-400` (copyright) → `text-primary-foreground/60`

---

## Step 8 — All `src/components/home/*.tsx`

Read each file, apply mapping. Key specifics:

### hero-carousel.tsx
- Replace inline hex styles (see Step 6 inline hex reference above)
- `bg-green-100 text-green-800 border border-green-200` (badge) → `bg-primary-muted text-primary/90 border border-primary-muted`
- `bg-green-500 animate-pulse` → `bg-primary animate-pulse`
- `text-gray-900` (headings) → `text-foreground`
- `text-green-700` (accent span) → `text-primary`
- `text-gray-500` → `text-muted-foreground`
- `bg-green-700 hover:bg-green-800 text-white shadow-green-200` (CTA btn) → `bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary/20`
- `border-2 border-green-700 text-green-700 hover:bg-green-50` (outline btn) → `border-2 border-primary text-primary hover:bg-primary-subtle`
- `bg-white rounded-2xl border border-gray-100 shadow-xl` (news panel) → `bg-card rounded-2xl border border-border shadow-xl`
- `border-b border-gray-100` → `border-b border-border/50`
- `text-gray-900` (Latest News) → `text-foreground`
- `text-green-700 hover:text-green-900` (links) → `text-primary hover:text-primary/80`
- `border-r border-gray-100` → `border-r border-border/50`
- `border-l-[3px] border-green-600` → `border-l-[3px] border-primary`
- `bg-green-500` (progress bar) → `bg-primary`
- `border-t border-gray-100 bg-amber-50/50` (event footer) → `border-t border-border/50 bg-amber-50/50 dark:bg-amber-950/20`
- `text-gray-700 hover:text-green-700` (event title) → `text-foreground/80 hover:text-primary`
- `bg-green-100 rounded-full blur-3xl` (glow) → `bg-primary-muted rounded-full blur-3xl`
- Keep the CATEGORY_CONFIG badge object — only change the `gaphto-news` entry's classes; leave `health-news` (blue) and `blog` (amber) as status colors (add dark: variants per status badge rule)

### stats-bar.tsx
- `bg-green-800 text-white` → `bg-primary-hover text-primary-foreground`
- `text-green-200` → `text-primary-foreground/80`

### news-preview.tsx
- `bg-gray-50` → `bg-muted/50`
- `text-gray-900` → `text-foreground`
- `text-gray-500` → `text-muted-foreground`
- `text-green-700 hover:text-green-800` (View All + Read More + category label) → `text-primary hover:text-primary/80`
- `bg-green-50` (placeholder) → `bg-primary-subtle`
- `text-gray-400` (dates) → `text-muted-foreground/70`
- `text-gray-900 group-hover:text-green-700` (titles) → `text-foreground group-hover:text-primary`
- `bg-green-100 text-green-800 border-green-200` (gaphto-news badge) → `bg-primary-muted text-primary/90 border-primary-muted`
- Keep blue/amber badge variants, add dark: variants

### events-preview.tsx
- `bg-white` → `bg-background`
- `text-gray-900` → `text-foreground`
- `text-gray-500` → `text-muted-foreground`
- `text-gray-400` → `text-muted-foreground/70`
- `border-gray-200 hover:border-green-300` (card) → `border-border hover:border-primary/50`
- `bg-green-700 text-white` (date chip) → `bg-primary text-primary-foreground`
- `bg-green-50 text-green-700 border border-green-200` (Physical badge) → `bg-primary-subtle text-primary border border-primary-subtle`
- `text-gray-900` (event title) → `text-foreground`
- `text-gray-700` (price) → `text-foreground/80`
- `bg-green-700 hover:bg-green-800 text-white` (Register btn) → `bg-primary hover:bg-primary-hover text-primary-foreground`
- Keep blue Online badge; add `dark:bg-blue-900/30 dark:text-blue-400` variant

### practice-areas.tsx
- `bg-gray-50` → `bg-muted/50`
- `text-gray-900` → `text-foreground`
- `text-gray-500` → `text-muted-foreground`
- `bg-white hover:border-green-300` (card) → `bg-card hover:border-primary/50`
- `bg-green-600` (accent bar) → `bg-primary`
- `bg-green-50 text-green-700 group-hover:bg-green-700 group-hover:text-white` (icon box) → `bg-primary-subtle text-primary group-hover:bg-primary group-hover:text-primary-foreground`
- `text-gray-900 group-hover:text-green-700` (title) → `text-foreground group-hover:text-primary`
- `text-green-700 hover:text-green-800` (Learn More) → `text-primary hover:text-primary/80`

### leadership-preview.tsx
- `bg-white` → `bg-background`
- `text-gray-900` → `text-foreground`
- `text-gray-500` → `text-muted-foreground`
- `border-green-100 group-hover:border-green-400` → `border-primary-subtle group-hover:border-primary`
- `text-green-700` (role) → `text-primary`
- `text-green-700 hover:text-green-800` (Meet Team link) → `text-primary hover:text-primary/80`

### gallery-teaser.tsx
- `bg-gray-50` → `bg-muted/50`
- `text-gray-900` → `text-foreground`
- `text-gray-500` → `text-muted-foreground`
- `text-green-700 hover:text-green-800` (View Gallery) → `text-primary hover:text-primary/80`
- `bg-gray-100` (placeholder) → `bg-muted`

### about-section.tsx
- `bg-white` → `bg-background`
- `text-green-600` (About GAPHTO label) → `text-primary`
- `text-gray-900` → `text-foreground`
- `text-gray-500` → `text-muted-foreground`
- `text-gray-700` (body) → `text-foreground/80`
- `bg-green-50 text-green-800 border border-green-200` (stat pill) → `bg-primary-subtle text-primary/90 border border-primary-subtle`
- `bg-green-100` (offset block) → `bg-primary-muted`
- `text-green-700 hover:text-green-800` (Learn More) → `text-primary hover:text-primary/80`

### fund-cta.tsx
- `bg-green-700` (section bg) → `bg-primary`
- `text-green-100` (subtitle) → `text-primary-foreground/80`
- `text-green-800` (white-btn text) → `text-primary-deep`
- `hover:bg-green-50` → `hover:bg-primary-subtle`
- Keep `border-white text-white hover:bg-white/10` (outline buttons) — white on primary is correct

---

## Step 9 — `src/app/page.tsx`

Read file. Apply universal mapping for any hardcoded gray/green classes found.

---

## Step 10 — `src/components/shared/page-header.tsx`

Read file. The gradient background:
- `from-green-900 via-green-800 to-green-700` → `from-primary-deep via-primary-hover to-primary`
- `bg-green-600/20` → `bg-primary/20`
- `text-green-200/80` (breadcrumb) → `text-primary-foreground/70`
- `text-green-400/60` (slash) → `text-primary-foreground/50`
- `text-green-100/80` (subtitle) → `text-primary-foreground/80`
- `text-white` (title) → `text-primary-foreground`

---

## Step 11 — Public content pages

Read each file, apply universal mapping.

### `src/app/news/news-client.tsx`
- Active tab: `bg-green-700 text-white border-green-700` → `bg-primary text-primary-foreground border-primary`
- Inactive tab: gray variants → `bg-card text-foreground/80 border-border hover:border-primary hover:text-primary`
- Load More btn: `border-green-700 text-green-700 hover:bg-green-700 hover:text-white` → `border-primary text-primary hover:bg-primary hover:text-primary-foreground`

### `src/app/news/[slug]/page.tsx`
- `bg-green-900` (backdrop) → `bg-primary-deep`
- `text-green-700 hover:text-green-900` (Back) → `text-primary hover:text-primary/80`
- `bg-green-100 text-green-800` (badge) → `bg-primary-muted text-primary/90`
- Keep `prose-green` class (typography plugin, intentional)

### Leadership, gallery, about, contact, practice-areas, publications pages
Apply universal mapping. Look specifically for:
- `bg-green-*` → primary tokens
- `text-green-*` → primary tokens
- `bg-gray-*` → muted tokens
- `text-gray-*` → foreground/muted-foreground tokens
- `border-gray-*` → border tokens
- Emerald colors (`emerald-50/100/200/700/800`) in about page: map same as green equivalents (emerald-50→primary-subtle, emerald-100→primary-muted, emerald-700/800→primary/primary/80)

### `src/app/(auth)/login/login-form.tsx` + `src/app/(auth)/register/register-form.tsx`
- `text-gray-700` (labels) → `text-foreground/80`
- `text-green-700 hover:text-green-600` (links) → `text-primary hover:text-primary/80`
- `bg-green-700 hover:bg-green-600 text-white` (submit btn) → `bg-primary hover:bg-primary-hover text-primary-foreground`
- `text-gray-600` → `text-muted-foreground`
- Error box: `border-red-200 bg-red-50 text-red-700` → same + `dark:border-red-800 dark:bg-red-950/30 dark:text-red-400`

### `src/app/(member)/member-centre/page.tsx` (and any sub-pages)
- `bg-green-900` / `bg-green-800` (top bar) → `bg-primary-deep`
- `border-green-800` → `border-primary/30`
- `text-green-200` → `text-primary-foreground/70`
- `bg-green-50 text-green-800` (active nav) → `bg-primary-subtle text-primary`
- `text-gray-700 hover:bg-gray-100` (nav links) → `text-foreground/80 hover:bg-muted`
- Gradient banner: `from-green-800 to-green-700` → `from-primary-hover to-primary`
- `border-gray-200 bg-white` (stat cards) → `border-border bg-card`
- `text-gray-500` / `text-gray-900` → `text-muted-foreground` / `text-foreground`
- `bg-green-500` (active dot) → `bg-primary`
- `text-green-700` (quick link icons/text) → `text-primary`
- `hover:border-green-300 hover:bg-green-50 hover:text-green-800` (quick link hover) → `hover:border-primary/50 hover:bg-primary-subtle hover:text-primary`
- `border-gray-200 bg-white` (card containers) → `border-border bg-card`
- `hover:bg-gray-50` → `hover:bg-muted/50`
- `border-b border-gray-100` → `border-b border-border/50`

---

## Step 12 — Verify

```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bun run build
```

Must be 0 TypeScript errors, 0 build errors.

Spot-check:
```bash
grep -r "bg-green-[0-9]" src/components/layout/ src/components/home/ src/app/\(auth\)/ src/app/\(member\)/
grep -r "bg-gray-[0-9]" src/components/layout/ src/components/home/
```
These should return 0 results (only status badge dark: variants are acceptable).

---

## Step 13 — Update AGENT_CONTEXT.md Status Log

Add to AGENT STATUS LOG:
```
| Agent A | Phase 3b — Theme: foundation + public pages | DONE | globals.css (primary=green, 4 new tokens), providers.tsx (ThemeProvider), layout.tsx (suppressHydrationWarning), theme-toggle.tsx (new), header.tsx + footer.tsx, all home components, all public pages. Build: 0 errors. |
```

---

## Hard Rules
- Do NOT touch any file in `src/app/(dashboard)/` or `src/components/dashboard/`
- Do NOT touch `src/app/actions/**`, `src/app/api/**`, `src/lib/db.ts`, `src/auth.ts`
- Do NOT touch useMutation/useState logic anywhere — only class replacements
- TypeScript must remain strict-clean
