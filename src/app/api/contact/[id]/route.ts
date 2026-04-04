import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { contactSubmissions } from '../../../../../drizzle/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const [updated] = await db
    .update(contactSubmissions)
    .set({ isRead: body.isRead })
    .where(eq(contactSubmissions.id, id))
    .returning()
  return NextResponse.json(updated)
}
