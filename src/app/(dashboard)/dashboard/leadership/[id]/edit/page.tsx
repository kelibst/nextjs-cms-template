import { db, leadership } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { LeadershipForm } from '@/components/dashboard/leadership-form'

export const dynamic = 'force-dynamic'

export default async function EditLeadershipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [leader] = await db.select().from(leadership).where(eq(leadership.id, id)).limit(1)
  if (!leader) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Edit Leadership Member</h1>
      <LeadershipForm leader={leader} />
    </div>
  )
}
