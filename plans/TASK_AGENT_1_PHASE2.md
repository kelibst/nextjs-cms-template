# TASK BRIEF — Agent 1: Phase 2 Auth Infrastructure
> Read AGENT_CONTEXT.md: /home/kelib/Desktop/moreprojects/gaphto/plans/AGENT_CONTEXT.md
> Work in: /home/kelib/Desktop/moreprojects/gaphto/

---

## YOUR SCOPE
Set up the full authentication layer: database, NextAuth v5, session management, middleware, and update the header to reflect auth state. Agent 2 builds the UI pages in parallel — do NOT touch src/app/(auth)/** or src/app/(member)/**.

---

## STEP 1 — Start Docker + seed DB

```bash
cd /home/kelib/Desktop/moreprojects/gaphto
docker compose -f infrastructure/docker-compose.yml up -d
```

Wait ~5 seconds for postgres to be healthy, then:

```bash
cp infrastructure/.env.example .env.local
```

Verify .env.local has:
```
DATABASE_URL="postgresql://gaphto:gaphto_secret@localhost:5432/gaphto"
NEXTAUTH_SECRET="gaphto-dev-secret-2024"
NEXTAUTH_URL="http://localhost:3000"
```

Generate and run migrations:
```bash
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

If migrate command fails, try:
```bash
bunx drizzle-kit push
```

Then seed:
```bash
bun db:seed
```

This creates 4 test users: superadmin@gaphto.org, admin@gaphto.org, editor@gaphto.org, member@gaphto.org — all with password `Test1234!`

---

## STEP 2 — Install NextAuth v5

```bash
bun add next-auth@beta
```

Do NOT install @auth/drizzle-adapter — we use a custom credentials provider with our own Drizzle queries to keep it simple.

---

## STEP 3 — Auth config: `src/auth.ts`

```ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { users } from '../../drizzle/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
```

---

## STEP 4 — Database client: `src/lib/db.ts`

```ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../../drizzle/schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
export const db = drizzle(pool, { schema })
```

---

## STEP 5 — NextAuth route handler: `src/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

---

## STEP 6 — TypeScript types: `src/types/next-auth.d.ts`

Extend the NextAuth session types so `session.user.role` and `session.user.id` are typed:

```ts
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string | null
      role: string
    }
  }
  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
```

---

## STEP 7 — Middleware: `src/middleware.ts`

Protect member and dashboard routes. Redirect unauthenticated users to /login with callbackUrl.

```ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const MEMBER_ROUTES = ['/member-centre', '/publications']
const DASHBOARD_ROUTES = ['/dashboard']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isMemberRoute = MEMBER_ROUTES.some(r => pathname.startsWith(r))
  const isDashboardRoute = DASHBOARD_ROUTES.some(r => pathname.startsWith(r))

  if ((isMemberRoute || isDashboardRoute) && !session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isDashboardRoute && session) {
    const allowedRoles = ['super_admin', 'admin', 'editor']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.redirect(new URL('/member-centre', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/member-centre/:path*', '/publications/:path*', '/dashboard/:path*'],
}
```

---

## STEP 8 — Update layout: `src/app/layout.tsx`

Wrap the app in a SessionProvider. Import `SessionProvider` from `next-auth/react` in a new `src/components/providers.tsx` client component:

```tsx
// src/components/providers.tsx
'use client'
import { SessionProvider } from 'next-auth/react'
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

Then in layout.tsx: import auth from `@/auth`, get session with `await auth()`, pass it to `<SessionProvider session={session}>`.

---

## STEP 9 — Update Header for auth state: `src/components/layout/header.tsx`

The header is currently a client component with static "Member Login" button. Update it to show auth state:

- Import `useSession` and `signOut` from `next-auth/react`
- If session: show user avatar (initials fallback) + name + dropdown with "Member Centre", "Sign Out"
- If no session: show "Sign In" button linking to /login
- Use Shadcn `DropdownMenu` for the user menu — install it: `bunx shadcn@latest add dropdown-menu`

---

## STEP 10 — Verify
```bash
bunx tsc --noEmit
```
Must pass with 0 errors.

---

## WHEN DONE
Update AGENT_CONTEXT.md Agent 1 Phase 2 row to DONE.
