import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { users } from '../drizzle/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'
import { audit } from '@/lib/audit'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
        if (!user) {
          void audit({ action: 'auth.login.failed', metadata: { email: credentials.email } })
          return null
        }
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) {
          void audit({ userId: user.id, action: 'auth.login.failed', metadata: { email: user.email } })
          return null
        }
        void audit({ userId: user.id, action: 'auth.login.success', metadata: { email: user.email } })
        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // Sign-in: user object is present — fetch tokenVersion from DB
      if (user) {
        token.id = user.id ?? ''
        token.role = (user as { role?: string }).role ?? 'member'
        const [dbUser] = await db
          .select({ tokenVersion: users.tokenVersion })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1)
        token.tv = dbUser?.tokenVersion ?? 0
        return token
      }

      // Refresh: validate tokenVersion against DB to detect forced invalidation
      if (token.id) {
        const [dbUser] = await db
          .select({ tokenVersion: users.tokenVersion })
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1)
        if (!dbUser || dbUser.tokenVersion !== token.tv) {
          // Token has been invalidated (e.g. after password reset)
          return null
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.tv = token.tv
      }
      return session
    },
  },
})
