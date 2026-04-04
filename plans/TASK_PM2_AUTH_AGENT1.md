# PM2 — Agent 1: Forgot Password + Auth Security

## Read First
Read `plans/AGENT_CONTEXT.md` for full project context.

## Your Job (6 steps, in order)

---

### Step 1 — Schema migration
Read `drizzle/schema.ts`. Find the `users` table definition. Add exactly two columns:
```typescript
passwordResetToken: text('password_reset_token'),
passwordResetTokenExpiry: timestamp('password_reset_token_expiry'),
```

Check `package.json` for the migration script name, then run:
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx drizzle-kit generate --config=drizzle/drizzle.config.ts
bunx tsx drizzle/migrate.ts
```

---

### Step 2 — Email helper
Read `src/lib/email.ts` first (Resend is already set up). Add ONE new exported function:

```typescript
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const r = getResend()   // use whatever the lazy initializer pattern is in the file
  await r.emails.send({
    from: FROM,
    to,
    subject: 'Reset your GAPHTO password',
    html: `
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password (valid for 1 hour):</p>
      <p><a href="${resetUrl}" style="background:#166534;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">Reset Password</a></p>
      <p>Or copy this link: ${resetUrl}</p>
      <p>If you didn't request this, ignore this email — your password won't change.</p>
      <p>— GAPHTO Team</p>
    `,
  })
}
```

---

### Step 3 — Server actions
Read `src/app/actions/auth.ts` first (has existing `handleSignOut`). Add two functions:

```typescript
'use server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'   // check if bcryptjs or bcrypt is used in package.json
import { db } from '@/lib/db'
import { users } from '@/lib/db'
import { eq, ilike, gt } from 'drizzle-orm'
import { sendPasswordResetEmail } from '@/lib/email'

export async function requestPasswordReset(email: string) {
  // Find user (case-insensitive)
  const [user] = await db.select().from(users).where(ilike(users.email, email)).limit(1)
  
  // Always return same message to prevent email enumeration
  const genericResponse = { success: true, message: 'If an account exists for this email, a reset link has been sent.' }
  if (!user) return genericResponse

  // Generate secure token
  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Store hashed token
  await db.update(users).set({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: expiry,
  }).where(eq(users.id, user.id))

  // Send email with raw token in URL
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`
  try {
    await sendPasswordResetEmail(user.email, user.name, resetUrl)
  } catch (err) {
    console.error('Failed to send reset email:', err)
    // Don't expose email failure to user
  }

  return genericResponse
}

export async function resetPassword(rawToken: string, newPassword: string) {
  if (!rawToken) throw new Error('Invalid reset link')
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters')

  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  const now = new Date()

  // Find user with valid token
  const [user] = await db.select().from(users)
    .where(eq(users.passwordResetToken, hashedToken))
    .limit(1)

  if (!user || !user.passwordResetTokenExpiry || user.passwordResetTokenExpiry < now) {
    throw new Error('This reset link is invalid or has expired. Please request a new one.')
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)

  await db.update(users).set({
    passwordHash,
    passwordResetToken: null,
    passwordResetTokenExpiry: null,
    updatedAt: new Date(),
  }).where(eq(users.id, user.id))

  return { success: true }
}
```

---

### Step 4 — New auth pages

**`src/app/(auth)/forgot-password/page.tsx`:**
Match the style of `src/app/(auth)/login/page.tsx`. Simple server component wrapping the form.
Title: "Forgot Password" / Subtitle: "Enter your email and we'll send you a reset link."

**`src/app/(auth)/forgot-password/forgot-password-form.tsx`:**
Client component. Pattern: match `login-form.tsx` style.
- Single email input with Label
- Submit button with Loader2 spinner while pending
- Uses `useMutation`: `mutationFn: (email) => requestPasswordReset(email)`
- `onSuccess`: replace form with a green checkmark card: "Check your email — we sent a reset link to [email]."
- `onError`: `toast.error(err.message)`
- Link back to `/login` at bottom

**`src/app/(auth)/reset-password/page.tsx`:**
Server component. Reads `searchParams.token`. If no token, show error state.
Passes token to `<ResetPasswordForm token={token} />`.

**`src/app/(auth)/reset-password/reset-password-form.tsx`:**
Client component. Props: `{ token: string }`.
- New password input (with show/hide toggle, matching login form pattern)
- Confirm password input
- Client-side: check passwords match before submitting
- `useMutation`: `mutationFn: () => resetPassword(token, password)`
- `onSuccess`: `toast.success('Password reset! Please log in.')` → `router.push('/login')`
- `onError`: `toast.error(err.message)`

---

### Step 5 — Fix login form
Read `src/app/(auth)/login/login-form.tsx`. Find the "Forgot password?" anchor. Change `href="#"` → `href="/forgot-password"`. One line change only.

---

### Step 6 — Middleware
Create `src/middleware.ts` at the project root (`/home/kelib/Desktop/moreprojects/gaphto/src/middleware.ts`):

```typescript
import NextAuth from 'next-auth'
import authConfig from './auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session
  const role = session?.user?.role ?? ''

  const isDashboard = nextUrl.pathname.startsWith('/dashboard')
  const isMemberArea =
    nextUrl.pathname.startsWith('/member-centre') ||
    nextUrl.pathname.startsWith('/publications')
  const isFundApply = nextUrl.pathname === '/fund/apply'

  if (isDashboard) {
    if (!isLoggedIn) return Response.redirect(new URL('/login', nextUrl))
    if (!['super_admin', 'admin', 'editor'].includes(role))
      return Response.redirect(new URL('/member-centre', nextUrl))
  }

  if (isMemberArea || isFundApply) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', nextUrl)
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return Response.redirect(loginUrl)
    }
  }
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/member-centre/:path*',
    '/publications/:path*',
    '/fund/apply',
  ],
}
```

Read `src/auth.config.ts` first to understand the import path and verify `authConfig` is the default export.

---

## Verification
```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bunx tsc --noEmit    # 0 errors
bun run build        # 0 errors
```

## Files You Own (only these)
- `drizzle/schema.ts` — add 2 columns
- New migration file (auto-generated)
- `src/lib/email.ts` — add 1 function
- `src/app/actions/auth.ts` — add 2 functions
- `src/app/(auth)/forgot-password/page.tsx` — NEW
- `src/app/(auth)/forgot-password/forgot-password-form.tsx` — NEW
- `src/app/(auth)/reset-password/page.tsx` — NEW
- `src/app/(auth)/reset-password/reset-password-form.tsx` — NEW
- `src/app/(auth)/login/login-form.tsx` — fix href only
- `src/middleware.ts` — NEW

## Do NOT Touch
Dashboard files, root layout, topbar, sidebar, providers, any public pages, any API routes.

## When Done
Update `plans/AGENT_CONTEXT.md` AGENT STATUS LOG:
```
| PM2 Auth Agent 1 | Forgot Password + Middleware | DONE | <notes> |
```
