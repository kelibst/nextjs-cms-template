import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getPageContent } from '@/app/actions/content'
import { HomepageContentForm } from '@/components/dashboard/homepage-content-form'

export const dynamic = 'force-dynamic'

const HOMEPAGE_KEYS = [
  'homepage.hero.title',
  'homepage.hero.subtitle',
  'homepage.stats.members_count',
  'homepage.stats.members_label',
  'homepage.stats.journals_count',
  'homepage.stats.journals_label',
  'homepage.stats.events_count',
  'homepage.stats.events_label',
  'homepage.stats.years_count',
  'homepage.stats.years_label',
  'homepage.sections.news_title',
  'homepage.sections.events_title',
  'homepage.sections.practice_areas_title',
  'homepage.sections.leadership_title',
  'homepage.sections.gallery_title',
  'homepage.sections.about_title',
  'homepage.sections.fund_cta_title',
  'homepage.sections.fund_cta_subtitle',
]

export default async function HomepageContentPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['super_admin', 'admin'].includes(session.user.role as string)) {
    redirect('/dashboard')
  }

  const content = await getPageContent(HOMEPAGE_KEYS)

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Homepage Content</h1>
        <p className="text-sm text-muted-foreground">
          Edit the hero text, stats bar values, and section headlines shown on the homepage
        </p>
      </div>
      <HomepageContentForm content={content} />
    </div>
  )
}
