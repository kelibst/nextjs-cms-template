import { db, publications } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PublicationForm } from '@/components/dashboard/publication-form'

export const dynamic = 'force-dynamic'

export default async function EditPublicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [pub] = await db.select().from(publications).where(eq(publications.id, id)).limit(1)
  if (!pub) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Edit Publication</h1>
      <PublicationForm publication={pub} />
    </div>
  )
}
