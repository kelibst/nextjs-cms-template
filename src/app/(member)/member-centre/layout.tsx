import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { MemberSidebar } from '@/components/member/member-sidebar'

export default async function MemberCentreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login?callbackUrl=/member-centre')
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Top bar */}
      <div className="border-b border-primary/30 bg-primary-deep px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-wide text-white">
            {process.env.NEXT_PUBLIC_SITE_NAME ?? 'My CMS'}
          </Link>
          <span className="text-sm text-white/70">Member Portal</span>
        </div>
      </div>

      <div className="flex">
        <MemberSidebar />
        {children}
      </div>
    </div>
  )
}
