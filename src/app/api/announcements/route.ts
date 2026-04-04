import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { announcements } from '../../../../drizzle/schema'
import { desc } from 'drizzle-orm'
import { can, type Role } from '@/lib/permissions'

export async function GET() {
  const all = await db.select().from(announcements).orderBy(desc(announcements.createdAt))
  return NextResponse.json(all)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!can(session.user.role as Role, 'posts:create')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, content, visibleTo, isPinned, expiresAt } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'title and content required' }, { status: 400 })

  const [created] = await db.insert(announcements).values({
    title,
    content,
    visibleTo: visibleTo ?? 'public',
    isPinned: isPinned ?? false,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning()

  return NextResponse.json(created, { status: 201 })
}
