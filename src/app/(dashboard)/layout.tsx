import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardTopbar } from '@/components/dashboard/topbar'

const ALLOWED_ROLES = ['super_admin', 'admin', 'editor']

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect('/login')
  if (!ALLOWED_ROLES.includes(session.user.role)) redirect('/member-centre')

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      <DashboardSidebar role={session.user.role} user={{ name: session.user.name ?? '', email: session.user.email ?? '' }} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
