import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getPageBlocks } from '@/app/actions/blocks'
import Link from 'next/link'
import { LayoutTemplate } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PAGES = [
  { key: 'homepage', label: 'Homepage', description: 'Hero, stats, objectives, and more', icon: '🏠' },
  { key: 'about', label: 'About Page', description: 'History, vision, mission, objectives', icon: '📄' },
  { key: 'fund', label: 'Fund Page', description: 'Welfare fund hero, description, and CTA', icon: '💰' },
  { key: 'practice-areas', label: 'Practice Areas', description: 'Practice areas hero and grid', icon: '🏥' },
  { key: 'news', label: 'News & Updates', description: 'News listing hero and sections', icon: '📰' },
  { key: 'blog', label: 'Blog', description: 'Blog listing hero and sections', icon: '✍️' },
  { key: 'events', label: 'Events & CPD', description: 'Events page hero', icon: '🗓️' },
  { key: 'gallery', label: 'Photo Gallery', description: 'Gallery hero and intro', icon: '🖼️' },
  { key: 'leadership', label: 'Our Leadership', description: 'Leadership page hero', icon: '👥' },
  { key: 'contact', label: 'Contact Us', description: 'Contact page hero', icon: '📬' },
  { key: 'publications', label: 'Publications', description: 'Publications hero and intro', icon: '📚' },
]

export default async function ContentHubPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['super_admin', 'admin'].includes(session.user.role as string)) {
    redirect('/dashboard')
  }

  const blockCounts = Object.fromEntries(
    await Promise.all(
      PAGES.map(async (p) => {
        const blocks = await getPageBlocks(p.key)
        return [p.key, blocks.length] as const
      })
    )
  )

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Page Builder</h1>
        <p className="text-sm text-muted-foreground">
          Manage the block content for every page — including hero style, label, and sections.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PAGES.map((page) => (
          <div key={page.key} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                {page.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground">{page.label}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{page.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {blockCounts[page.key] ?? 0}{' '}
                {blockCounts[page.key] === 1 ? 'block' : 'blocks'}
              </span>
              <Link
                href={`/dashboard/content/${page.key}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                Edit Content
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Block-based editing</p>
          <p className="text-xs text-muted-foreground">
            Each page starts with a Hero block — configure the title, label badge, subtitle, background image, and layout alignment. Add more blocks below.
          </p>
        </div>
      </div>
    </div>
  )
}
