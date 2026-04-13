import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { can, type Role } from '@/lib/permissions'
import { uploadFile } from '@/lib/storage'
import { db } from '@/lib/db'
import { mediaFiles } from '../../../../drizzle/schema'

function getMaxSize(mimeType: string): number {
  if (mimeType.startsWith('video/')) return 200 * 1024 * 1024  // 200 MB
  if (mimeType.startsWith('image/')) return 10 * 1024 * 1024   // 10 MB
  return 20 * 1024 * 1024                                       // 20 MB
}

function getPrefix(mimeType: string): string {
  if (mimeType.startsWith('video/')) return 'videos'
  if (mimeType.startsWith('image/')) return 'uploads'
  return 'documents'
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!can(session.user.role as Role, 'posts:create')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const allowed =
    file.type.startsWith('image/') ||
    file.type.startsWith('video/') ||
    file.type === 'application/pdf' ||
    file.type.includes('document') ||
    file.type.includes('spreadsheet')

  if (!allowed) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  // Early size bail-out for non-video (avoids buffering huge files)
  if (!file.type.startsWith('video/') && file.size > getMaxSize(file.type)) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 })
  }

  const category = (formData.get('category') as string | null) || null
  const altText  = (formData.get('altText')  as string | null) || null

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Re-check buffer length against per-type limit (safety check after buffering)
  if (buffer.length > getMaxSize(file.type)) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const key = `${getPrefix(file.type)}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const publicUrl = await uploadFile(key, buffer, file.type, buffer.length)

  const [record] = await db.insert(mediaFiles).values({
    key,
    filename: `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`,
    originalName: file.name,
    mimeType: file.type,
    fileSize: buffer.length,
    uploadedBy: session.user.id ?? null,
    category,
    altText,
  }).returning()

  return NextResponse.json({ url: publicUrl, id: record.id })
}
