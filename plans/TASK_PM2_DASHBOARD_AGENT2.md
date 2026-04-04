# PM2 — Agent 2: Dashboard Layout Fix + Dark Mode + Profile Links

## Read First
Read `plans/AGENT_CONTEXT.md` for full project context.

## Your Job (3 steps)

---

### Step 1 — Fix Header/Footer showing on Dashboard (Root Layout Restructure)

**THE PROBLEM:** `src/app/layout.tsx` (root) renders `<Header />` + `<Footer />` for ALL routes including `/dashboard/**`. The dashboard has its own sidebar/topbar so the public Header/Footer must not appear there.

**THE FIX:** Create a `(public)` route group with its own layout that has Header+Footer. Move all public pages inside it. Strip Header+Footer from the root layout.

#### 1a — Read root layout
Read `src/app/layout.tsx` in full. Identify exactly which imports and JSX nodes relate to Header and Footer.

#### 1b — Strip root layout
Modify `src/app/layout.tsx`:
- Remove `import { Header } from '@/components/layout/header'`
- Remove `import { Footer } from '@/components/layout/footer'` (or whatever the import paths are)
- Remove `<Header />` and `<Footer />` from the JSX
- Keep everything else: `<html>`, `<body>`, fonts, metadata, `<Providers>`, `<Toaster>`, `<GoogleAnalytics>`, `suppressHydrationWarning`
- The body should now just be: `<Providers>{children}</Providers>` + Toaster + GA (adjust to match actual structure)

#### 1c — Create `src/app/(public)/layout.tsx`
```typescript
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
```
Note: Do NOT wrap children in `<main>` — individual pages already handle their own main wrapper. Check how the root layout previously wrapped content before deciding.

#### 1d — Move public page directories into `src/app/(public)/`
Use bash commands. Route groups with `()` do NOT change URLs — `/news` stays `/news`.

```bash
cd /home/kelib/Desktop/moreprojects/gaphto/src/app
mkdir "(public)"

# Move the homepage (IMPORTANT: just the file, not the directory)
mv page.tsx "(public)/page.tsx"

# Move public section directories
mv news "(public)/news"
mv about "(public)/about"
mv leadership "(public)/leadership"
mv gallery "(public)/gallery"
mv events "(public)/events"
mv contact "(public)/contact"
mv practice-areas "(public)/practice-areas"
mv fund "(public)/fund"
```

Check whether `src/app/publications/` exists as a PUBLIC page (not the member-gated one). The member-gated publications are in `src/app/(member)/`. If there's also a public `src/app/publications/` directory, move it too:
```bash
# Only if public publications exists at root level:
# mv publications "(public)/publications"
```

**Do NOT move:** `(auth)/`, `(dashboard)/`, `(member)/`, `sitemap.ts`, `robots.ts`, `layout.tsx`, `globals.css`, `api/`

#### 1e — Verify
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit
bun run build
```
If you get errors about missing files after the move, the issue is import path resolution — check if any component imports reference the old paths. Usually this is not an issue since paths use `@/` aliases.

---

### Step 2 — Dashboard Topbar: Add Theme Toggle + Profile Dropdown

Read `src/components/dashboard/topbar.tsx` in full first.

Currently it shows: breadcrumb navigation | user name + role badge + logout button

**Replace the right side** with:
1. `<ThemeToggle />` (import from `@/components/shared/theme-toggle`)
2. A `<DropdownMenu>` wrapping the user info (replaces the current name/badge/logout)

```tsx
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { User, Settings, LogOut } from 'lucide-react'
import { handleSignOut } from '@/app/actions/auth'

// Helper:
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

// In JSX (right side of topbar):
<div className="flex items-center gap-2">
  <ThemeToggle />
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs bg-green-700 text-white">
            {getInitials(user.name ?? '')}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:block text-sm font-medium">{user.name}</span>
        {/* role badge — keep existing role badge component if present */}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
        {user.email}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/member-centre/profile" className="flex items-center gap-2 cursor-pointer">
          <User className="h-4 w-4" />
          My Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <form action={handleSignOut}>
          <button type="submit" className="flex items-center gap-2 w-full text-destructive">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
```

Check `src/components/ui/dropdown-menu.tsx` and `src/components/ui/avatar.tsx` exist before using them. They should — they were installed in earlier phases.

---

### Step 3 — Dashboard Sidebar: User Profile Section at Bottom

Read `src/components/dashboard/sidebar.tsx` in full. Read `src/app/(dashboard)/layout.tsx` to see how user data flows in.

#### 3a — Update sidebar props
The sidebar currently receives `{ role: string }`. Extend:
```typescript
interface SidebarProps {
  role: string
  user: { name: string; email: string }
}
```

#### 3b — Update dashboard layout
Read `src/app/(dashboard)/layout.tsx`. It calls `<DashboardSidebar role={session.user.role} />`.
Update to: `<DashboardSidebar role={session.user.role} user={{ name: session.user.name ?? '', email: session.user.email ?? '' }} />`

#### 3c — Add profile section to sidebar
In the sidebar JSX, ABOVE the existing "Back to site" link section, add:

```tsx
{/* User profile */}
<div className="px-3 py-3 border-t border-primary/30">
  <Link
    href="/member-centre/profile"
    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/10 transition-colors group"
  >
    <div className="h-8 w-8 rounded-full bg-green-700 flex items-center justify-center shrink-0">
      <span className="text-white text-xs font-semibold">
        {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-sm font-medium truncate leading-tight">{user.name}</p>
      <p className="text-white/50 text-xs truncate leading-tight">{user.email}</p>
    </div>
    <ChevronRight className="h-4 w-4 text-white/30 shrink-0 group-hover:text-white/60 transition-colors" />
  </Link>
</div>
```

Make sure `ChevronRight` is imported from `lucide-react` alongside existing imports.

---

## Verification
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit    # 0 errors
bun run build        # 0 errors

# Manual checks:
# / → public header + footer visible
# /news → public header + footer visible
# /dashboard → NO public header, NO footer. Only sidebar + topbar.
# /dashboard topbar → theme toggle present, clicking user name opens dropdown with profile/settings/sign out
# /dashboard sidebar → user avatar + name + email at bottom, clicking goes to /member-centre/profile
# Toggle ThemeToggle → dark mode applies to dashboard correctly
```

## Files You Own (only these)
- `src/app/layout.tsx` — strip Header/Footer
- `src/app/(public)/layout.tsx` — NEW
- All moved directories inside `src/app/(public)/`
- `src/components/dashboard/topbar.tsx` — add theme toggle + dropdown
- `src/components/dashboard/sidebar.tsx` — add user prop + profile section
- `src/app/(dashboard)/layout.tsx` — pass user to sidebar

## Do NOT Touch
Auth files, middleware, schema, email, login/forgot-password pages, member directory, API routes.

## When Done
Update `plans/AGENT_CONTEXT.md` AGENT STATUS LOG:
```
| PM2 Dashboard Agent 2 | Layout fix + Dark Mode + Profile Links | DONE | <notes> |
```
