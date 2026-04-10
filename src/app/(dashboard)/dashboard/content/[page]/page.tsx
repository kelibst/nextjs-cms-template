import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getPageBlocks } from '@/app/actions/blocks'
import { PageBuilderClient } from '@/components/dashboard/page-builder-client'

export const dynamic = 'force-dynamic'

const VALID_PAGES = [
  'homepage', 'about', 'fund', 'practice-areas',
  'news', 'blog', 'events', 'gallery', 'leadership', 'contact', 'publications',
] as const
type ValidPage = (typeof VALID_PAGES)[number]

function isValidPage(page: string): page is ValidPage {
  return VALID_PAGES.includes(page as ValidPage)
}

interface PageBuilderPageProps {
  params: Promise<{ page: string }>
}

export default async function PageBuilderPage({ params }: PageBuilderPageProps) {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['super_admin', 'admin'].includes(session.user.role as string)) {
    redirect('/dashboard')
  }

  const { page } = await params
  if (!isValidPage(page)) redirect('/dashboard/content')

  const blocks = await getPageBlocks(page)

  return <PageBuilderClient blocks={blocks} page={page} />
}
