# TASK: Agent 1 — Logo Fix + Hero Enhancement
> Sprint: UI/UX Polish (2026-04-11)
> Read AGENT_CONTEXT.md for full project context before starting.

---

## GOAL
Fix the logo so it looks sharp, round, and proportionate in both light and dark modes — across the public header and the dashboard topbar. Then visually elevate the homepage hero section.

---

## PART 1 — Logo Fix

### Problem
- Header logo: `width={120} height={36}` — too wide, no rounded container, no dark mode handling
- In dark mode the original dark logo pixels disappear against the dark background
- Dashboard topbar likely has the same issue

### Files to change
- `src/components/layout/header.tsx` (lines ~81–88)
- `src/components/dashboard/topbar.tsx` (verify logo usage, apply same fix)

### Approach
Wrap the `<Image>` in a **round container** that constrains the logo to a square/circle shape:

```tsx
// Replace current Image block in header with:
<div className="relative flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border border-border bg-white dark:bg-white/10 shadow-sm">
  <Image
    src="/images/logo/logo.png"
    alt="GAPHTO"
    fill
    className="object-contain p-1"
    priority
  />
</div>
```

**Dark mode handling** — choose one:
- Option A (CSS filter): add `dark:brightness-0 dark:invert` on the Image (or wrapper) so the logo inverts to white in dark mode. Simple, no extra asset needed.
- Option B (swap image): use `useTheme()` from `next-themes` and conditionally set `src` to `/images/logo/logo-white.png` in dark mode. Requires a separate white version of the logo.

**Recommended: Option A** (no extra asset, header is already 'use client' so useTheme available if needed, but CSS filter is simpler).

### Sizing guidance
- Container: `h-10 w-10` (40×40px) — matches typical header height proportion
- Or `h-9 w-9` if it looks too big — test visually
- The logo text beside it (if any) should remain; only the image treatment changes

### Dashboard topbar
Read `src/components/dashboard/topbar.tsx` first. Apply the same round container + dark mode filter.

---

## PART 2 — Homepage Hero Enhancement

### File
`src/components/home/hero-carousel.tsx`

### Current state
- Full-width hero with radial gradient, dot-grid overlay, glow effect
- Left: title, subtitle, CTA buttons, stats badges
- Right: Latest news carousel with thumbnail tabs
- Auto-rotates every 5 seconds

### Improvements to make

**Visual polish (all in hero-carousel.tsx):**

1. **Stronger gradient background** — The current radial gradient is subtle. Make the left side distinctly branded:
   ```tsx
   // Upgrade gradient — more directional, richer
   className="... bg-gradient-to-br from-primary-deep via-primary/90 to-primary/60 dark:from-primary-deep dark:via-primary-deep/80 dark:to-black/60"
   ```

2. **Title typography** — Make the headline more impactful:
   - Increase size: `text-4xl md:text-5xl lg:text-6xl`
   - Add subtle letter-spacing: `tracking-tight`
   - Strong font weight: `font-extrabold` or `font-black`
   - Add text shadow for legibility: `[text-shadow:0_2px_16px_rgba(0,0,0,0.25)]`

3. **CTA button prominence** — Primary CTA button should pop more:
   - Add subtle pulse/glow: `shadow-lg shadow-primary/40 hover:shadow-primary/60`
   - Or add an animated ring: `ring-2 ring-white/20 ring-offset-2 ring-offset-transparent`

4. **Stats badges** — Polish with slightly more contrast and a subtle border

5. **Right panel** — Add a subtle frosted-glass card effect on the news carousel:
   ```tsx
   className="... bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl"
   ```

**Important:** Keep all existing functionality intact (carousel, auto-rotate, tabs, pause-on-hover). Only enhance visual styling.

---

## PART 3 — Inner Page Hero (bonus if time)

File: `src/components/shared/inner-page-hero.tsx` (or `article-hero.tsx`)

The hero sections on inner pages (About, News, Events etc.) likely use a simpler banner. Check the component and ensure:
- Gradient is rich (not flat gray)
- Typography is impactful
- Has breadcrumb support

---

## ACCEPTANCE CRITERIA
- [ ] Logo is round and proportionate in the public header (light + dark mode)
- [ ] Logo is round and proportionate in the dashboard topbar (light + dark mode)  
- [ ] In dark mode, the logo is clearly visible (white/inverted or using dark variant)
- [ ] Homepage hero has stronger visual presence (gradient, typography, CTA)
- [ ] No regressions — carousel still works, nav still works

---

## STATUS
- [x] Part 1 — Logo fix in header.tsx
- [x] Part 1 — Logo fix in topbar.tsx (topbar has no logo Image — uses Avatar initials; confirmed no change needed)
- [x] Part 2 — Hero visual enhancement
- [x] Update AGENT_CONTEXT.md status log when done
