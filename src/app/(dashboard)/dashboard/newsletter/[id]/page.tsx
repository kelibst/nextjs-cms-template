import { db } from '@/lib/db'
import { newsletters } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ViewNewsletterPage({ params }: Props) {
  const { id } = await params
  const [newsletter] = await db.select().from(newsletters).where(eq(newsletters.id, id)).limit(1)
  if (!newsletter) notFound()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/newsletter" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground/80">
          <ArrowLeft className="h-4 w-4" /> Newsletter
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium">View</span>
      </div>

      <div className="max-w-3xl">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border/50">
            <h1 className="text-xl font-bold text-foreground">{newsletter.subject}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                Sent
              </span>
              <span>
                Sent to <strong>{newsletter.recipientCount ?? 0}</strong> recipients
              </span>
              {newsletter.sentAt && (
                <span>
                  on {new Date(newsletter.sentAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Content preview */}
          <div className="px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Content Preview</p>
            <div
              className="prose prose-sm max-w-none border border-border/50 rounded-lg p-4 bg-muted/20"
              dangerouslySetInnerHTML={{ __html: newsletter.content }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
