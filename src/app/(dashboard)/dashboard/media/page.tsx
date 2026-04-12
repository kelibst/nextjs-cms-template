import { auth } from '@/auth'
import { can, type Role } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import { MediaManagerClient } from './media-manager-client'

export default async function MediaPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = ((session.user as { role?: string }).role ?? 'member') as Role
  if (!can(role, 'posts:create')) {
    redirect('/dashboard')
  }

  return (
    <div className="p-6">
      <MediaManagerClient />
    </div>
  )
}
