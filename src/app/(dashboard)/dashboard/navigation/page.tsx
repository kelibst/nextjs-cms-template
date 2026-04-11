import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { can } from '@/lib/permissions'
import { getAllNavLinks } from '@/app/actions/navigation'
import NavigationManager from '@/components/dashboard/navigation-manager'

export const dynamic = 'force-dynamic'

export default async function NavigationPage() {
  const session = await auth()
  if (!session?.user || !can(session.user.role as any, 'navigation:manage')) {
    redirect('/dashboard')
  }

  const links = await getAllNavLinks()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Navigation Links</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage the links that appear in the site header and footer.
          </p>
        </div>
      </div>
      <NavigationManager initialLinks={links} />
    </div>
  )
}
