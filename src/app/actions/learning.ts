'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import {
  courses,
  lessons,
  courseEnrollments,
  lessonCompletions,
} from '../../../drizzle/schema'
import { eq, and, count } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { can, type Role } from '@/lib/permissions'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── Course Actions ───────────────────────────────────────────────────────────

type CourseInput = {
  title: string
  slug?: string
  description?: string
  thumbnail?: string | null
  level?: 'beginner' | 'intermediate' | 'advanced'
  category?: string | null
  status?: 'draft' | 'published' | 'archived'
}

export async function createCourse(data: CourseInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'learning:manage')) throw new Error('Forbidden')

  await db.insert(courses).values({
    title: data.title,
    slug: data.slug ?? `${slugify(data.title)}-${Date.now()}`,
    description: data.description ?? null,
    thumbnail: data.thumbnail ?? null,
    level: data.level ?? 'beginner',
    category: data.category ?? null,
    status: data.status ?? 'draft',
    instructorId: session.user.id ?? null,
  })

  revalidatePath('/dashboard/learning')
  redirect('/dashboard/learning')
}

export async function updateCourse(id: string, data: CourseInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'learning:manage')) throw new Error('Forbidden')

  await db.update(courses).set({
    title: data.title,
    slug: data.slug ?? slugify(data.title),
    description: data.description ?? null,
    thumbnail: data.thumbnail ?? null,
    level: data.level ?? 'beginner',
    category: data.category ?? null,
    status: data.status ?? 'draft',
    updatedAt: new Date(),
  }).where(eq(courses.id, id))

  revalidatePath('/dashboard/learning')
  redirect('/dashboard/learning')
}

export async function deleteCourse(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'learning:manage')) throw new Error('Forbidden')

  await db.delete(courses).where(eq(courses.id, id))
  revalidatePath('/dashboard/learning')
}

// ─── Lesson Actions ───────────────────────────────────────────────────────────

type LessonInput = {
  title: string
  slug?: string
  content?: string | null
  sortOrder?: number
  durationMin?: number | null
  status?: 'draft' | 'published'
}

export async function createLesson(courseId: string, data: LessonInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'learning:manage')) throw new Error('Forbidden')

  await db.insert(lessons).values({
    courseId,
    title: data.title,
    slug: data.slug ?? slugify(data.title),
    content: data.content ?? null,
    sortOrder: data.sortOrder ?? 0,
    durationMin: data.durationMin ?? null,
    status: data.status ?? 'draft',
  })

  revalidatePath(`/dashboard/learning/${courseId}/lessons`)
  redirect(`/dashboard/learning/${courseId}/lessons`)
}

export async function updateLesson(id: string, courseId: string, data: LessonInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'learning:manage')) throw new Error('Forbidden')

  await db.update(lessons).set({
    title: data.title,
    slug: data.slug ?? slugify(data.title),
    content: data.content ?? null,
    sortOrder: data.sortOrder ?? 0,
    durationMin: data.durationMin ?? null,
    status: data.status ?? 'draft',
  }).where(eq(lessons.id, id))

  revalidatePath(`/dashboard/learning/${courseId}/lessons`)
  redirect(`/dashboard/learning/${courseId}/lessons`)
}

export async function deleteLesson(id: string, courseId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'learning:manage')) throw new Error('Forbidden')

  await db.delete(lessons).where(eq(lessons.id, id))
  revalidatePath(`/dashboard/learning/${courseId}/lessons`)
}

export async function updateLessonOrder(courseId: string, lessonIds: string[]) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  if (!can(session.user.role as Role, 'learning:manage')) throw new Error('Forbidden')

  for (let i = 0; i < lessonIds.length; i++) {
    await db.update(lessons)
      .set({ sortOrder: i })
      .where(and(eq(lessons.id, lessonIds[i]), eq(lessons.courseId, courseId)))
  }

  revalidatePath(`/dashboard/learning/${courseId}/lessons`)
}

// ─── Member Actions ───────────────────────────────────────────────────────────

export async function enrollInCourse(courseId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const userId = session.user.id
  if (!userId) throw new Error('No user id')

  // Check if already enrolled
  const existing = await db
    .select()
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
    .limit(1)

  if (existing.length > 0) return // already enrolled

  await db.insert(courseEnrollments).values({ userId, courseId })
  revalidatePath('/member-centre/learning')
}

export async function markLessonComplete(lessonId: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const userId = session.user.id
  if (!userId) throw new Error('No user id')

  // Check if already completed
  const existing = await db
    .select()
    .from(lessonCompletions)
    .where(and(eq(lessonCompletions.userId, userId), eq(lessonCompletions.lessonId, lessonId)))
    .limit(1)

  if (existing.length > 0) return // already completed

  await db.insert(lessonCompletions).values({ userId, lessonId })

  // Auto-detect course completion: check if all published lessons are now done
  const lessonRow = await db
    .select({ courseId: lessons.courseId })
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1)

  if (lessonRow.length > 0) {
    const { courseId } = lessonRow[0]

    const [{ totalLessons }] = await db
      .select({ totalLessons: count() })
      .from(lessons)
      .where(and(eq(lessons.courseId, courseId), eq(lessons.status, 'published')))

    const [{ doneLessons }] = await db
      .select({ doneLessons: count() })
      .from(lessonCompletions)
      .innerJoin(lessons, eq(lessonCompletions.lessonId, lessons.id))
      .where(and(eq(lessonCompletions.userId, userId), eq(lessons.courseId, courseId)))

    if (totalLessons > 0 && doneLessons >= totalLessons) {
      await db
        .update(courseEnrollments)
        .set({ completedAt: new Date() })
        .where(
          and(
            eq(courseEnrollments.userId, userId),
            eq(courseEnrollments.courseId, courseId),
          )
        )
    }

    // Revalidate the specific course page
    const courseRow = await db
      .select({ slug: courses.slug })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1)
    if (courseRow.length > 0) {
      revalidatePath(`/member-centre/learning/${courseRow[0].slug}`)
    }
  }

  revalidatePath('/member-centre/learning')
}
