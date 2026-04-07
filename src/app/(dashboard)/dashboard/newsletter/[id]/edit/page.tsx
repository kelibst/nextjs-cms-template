import { db } from '@/lib/db'
import { newsletters } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewsletterForm } from '@/components/dashboard/newsletter-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditNewsletterPage({ params }: Props) {
  const { id } = await params
  const [newsletter] = await db.select().from(newsletters).where(eq(newsletters.id, id)).limit(1)
  if (!newsletter) notFound()
  if (newsletter.status !== 'draft') redirect('/dashboard/newsletter')

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/newsletter" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground/80">
          <ArrowLeft className="h-4 w-4" /> Newsletter
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium">Edit Draft</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">Edit Newsletter</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{newsletter.subject}</p>
      </div>
      <NewsletterForm newsletter={newsletter} />
    </div>
  )
}
