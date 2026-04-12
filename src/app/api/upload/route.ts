import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { can, type Role } from '@/lib/permissions'
import { uploadFile } from '@/lib/storage'
import { db } from '@/lib/db'
import { mediaFiles } from '../../../../drizzle/schema'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!can(session.user.role as Role, 'posts:create')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (!file.type.startsWith('image/') && file.type !== 'application/pdf' &&
    !file.type.includes('document') && !file.type.includes('spreadsheet')) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = file.name.split('.').pop() ?? 'bin'
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const publicUrl = await uploadFile(key, buffer, file.type, buffer.length)

  const [record] = await db.insert(mediaFiles).values({
    key,
    filename: `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`,
    originalName: file.name,
    mimeType: file.type,
    fileSize: buffer.length,
    uploadedBy: session.user.id ?? null,
  }).returning()

  return NextResponse.json({ url: publicUrl, id: record.id })
}
