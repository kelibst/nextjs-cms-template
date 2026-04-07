import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutTemplate, Info } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ContentHubPage() {
  const session = await auth()
  if (!session) redirect('/login')
  if (!['super_admin', 'admin'].includes(session.user.role as string)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Content Editor</h1>
        <p className="text-sm text-muted-foreground">
          Edit the text and content displayed on public-facing pages
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/content/homepage"
          className="group bg-card rounded-xl border border-border p-5 space-y-2 hover:border-primary/50 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <LayoutTemplate className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Homepage Content</h2>
              <p className="text-xs text-muted-foreground">Hero, stats bar &amp; section headlines</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Update the hero title and subtitle, the four statistics displayed in the stats bar,
            and the heading text for each homepage section.
          </p>
        </Link>

        <Link
          href="/dashboard/content/about"
          className="group bg-card rounded-xl border border-border p-5 space-y-2 hover:border-primary/50 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">About Page Content</h2>
              <p className="text-xs text-muted-foreground">Background, vision, mission &amp; more</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Edit the organisation background (rich text), vision, mission, objectives list,
            historical timeline, and practice areas.
          </p>
        </Link>
      </div>
    </div>
  )
}
