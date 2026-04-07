import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getPageContent } from '@/app/actions/content'
import { AboutContentForm } from '@/components/dashboard/about-content-form'

export const dynamic = 'force-dynamic'

const ABOUT_KEYS = [
  'about.background',
  'about.vision',
  'about.mission',
  'about.objectives',
  'about.timeline',
  'about.practice_areas',
]

export default async function AboutContentPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['super_admin', 'admin'].includes(session.user.role as string)) {
    redirect('/dashboard')
  }

  const content = await getPageContent(ABOUT_KEYS)

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">About Page Content</h1>
        <p className="text-sm text-muted-foreground">
          Edit the background, vision, mission, objectives, timeline, and practice areas
        </p>
      </div>
      <AboutContentForm content={content} />
    </div>
  )
}
