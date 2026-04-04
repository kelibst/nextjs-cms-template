# PM2 Phase 5D — Analytics + Sitemap Completion

## Read First
Read `plans/AGENT_CONTEXT.md` for full project context (Phase 5 section).

## Your Goal
Add Google Analytics and update the sitemap to include all new pages added in Phases 5A–5C.

## Step 1 — Google Analytics

Next.js 16 ships `@next/third-parties` built-in. No package install needed.

### Modify `src/app/layout.tsx`
Read the file first. Add `GoogleAnalytics` to the layout — conditionally, only if the env var is set:

```typescript
import { GoogleAnalytics } from '@next/third-parties/google'

// Inside the <html> body, after <Providers> and <Toaster>:
{process.env.NEXT_PUBLIC_GA_ID && (
  <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
)}
```

This must be placed inside the `<body>` tag but outside `<Providers>` (as a sibling). The conditional ensures the build succeeds without the env var set.

## Step 2 — Update Sitemap

### Modify `src/app/sitemap.ts`
Read the current file (created by Phase 5A Agent 1). Add the new static routes introduced in Phases 5B and 5C:

Add to the `staticRoutes` array:
```typescript
{ url: `${baseUrl}/fund`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
{ url: `${baseUrl}/fund/apply`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
{ url: `${baseUrl}/member-centre/directory`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
```

The dynamic event routes are already included (Phase 5A added them). Verify they are there — if not, add the DB query for events.

## Step 3 — Verify Build

```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit    # 0 errors
bun run build        # 0 errors, no warnings about missing modules
```

## Environment Variable
The user must add to `.env.local`:
```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
The GA ID is obtained from Google Analytics → Admin → Data Streams → Web Stream → Measurement ID.
Without this var, the GA script simply won't load — the site still works fine.

## Do NOT Touch
- Any files outside `src/app/layout.tsx` and `src/app/sitemap.ts`
- No new pages, components, DB changes, or actions

## When Done
Update `plans/AGENT_CONTEXT.md` AGENT STATUS LOG:
```
| PM2 Phase 5D | Analytics + Sitemap update | DONE | <notes> |
```

Also add a Phase 5 completion summary to AGENT_CONTEXT.md:
```
## PHASE 5 — COMPLETE (2026-04-04)
All Phase 5 features shipped:
- 5A: SEO sitemap, robots.txt, OG metadata, public events page + registration
- 5B: Resend email (contact form + event confirmations), member directory
- 5C: Paystack payment for events, GAPHTO Fund loan application + dashboard review
- 5D: Google Analytics, sitemap updated
Pending Phase 4: WordPress DB migration (awaiting MySQL dump from client)
```
