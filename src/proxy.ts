import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

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
  if (isDashboard) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl))
    if (!['super_admin', 'admin', 'editor'].includes(role))
      return NextResponse.redirect(new URL('/member-centre', nextUrl))
  }

  if (isMemberArea) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/login', nextUrl)
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/member-centre/:path*',
    '/publications/:path*',
  ],
}
