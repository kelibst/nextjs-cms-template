import { NextRequest, NextResponse } from 'next/server'
import { db, contactSubmissions } from '@/lib/db'
import {
  sendContactAcknowledgement,
  sendContactNotification,
} from '@/lib/email'

interface ContactPayload {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export async function POST(request: NextRequest) {
  let body: ContactPayload

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON payload.' },
      { status: 400 }
    )
  }

  const { name, email, subject, message } = body

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: 'Name is required.' },
      { status: 400 }
    )
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json(
      { success: false, error: 'A valid email address is required.' },
      { status: 400 }
    )
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: 'Message is required.' },
      { status: 400 }
    )
  }

  // Save to database
  let submission: { id: string }
  try {
    const [row] = await db
      .insert(contactSubmissions)
      .values({
        name: name.trim(),
        email: email.trim(),
        subject: subject?.trim() ?? null,
        message: message.trim(),
      })
      .returning({ id: contactSubmissions.id })
    submission = row
  } catch (err) {
    console.error('[contact] DB insert failed:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to save your message. Please try again.' },
      { status: 500 }
    )
  }

  // Send emails — failures must NOT block the 200 response
  const subjectText = subject?.trim() || '(No subject)'
  try {
    await sendContactAcknowledgement(email.trim(), name.trim(), subjectText)
  } catch (err) {
    console.error('[contact] Acknowledgement email failed:', err)
  }

  try {
    await sendContactNotification({
      name: name.trim(),
      email: email.trim(),
      subject: subjectText,
      message: message.trim(),
    })
  } catch (err) {
    console.error('[contact] Admin notification email failed:', err)
  }

  return NextResponse.json({ success: true, id: submission.id })
}
