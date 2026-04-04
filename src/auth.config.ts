import type { NextAuthConfig } from 'next-auth'

// Edge-compatible auth config (no Node.js built-ins like bcrypt or pg)
// Used by middleware only. Full auth logic is in auth.ts
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return !!auth
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? ''
        token.role = (user as { role?: string }).role ?? 'member'
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
}
