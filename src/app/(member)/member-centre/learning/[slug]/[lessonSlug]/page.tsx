import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { courses, lessons, courseEnrollments, lessonCompletions } from '@/lib/db'
import { eq, and, asc } from 'drizzle-orm'
import { markLessonComplete } from '@/app/actions/learning'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonSlug } = await params
  const [lesson] = await db.select({ title: lessons.title }).from(lessons).where(eq(lessons.slug, lessonSlug)).limit(1)
  return { title: lesson?.title ?? 'Lesson' }
}

export default async function LessonViewerPage({ params }: Props) {
  const { slug, lessonSlug } = await params
  const session = await auth()
  const userId = session?.user?.id

  // Load course
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.slug, slug), eq(courses.status, 'published')))
    .limit(1)
  if (!course) notFound()

  // Must be enrolled
  const [enrollment] = userId
    ? await db
        .select()
        .from(courseEnrollments)
        .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, course.id)))
        .limit(1)
    : [undefined]

  if (!enrollment) {
    redirect(`/member-centre/learning/${slug}`)
  }

  // Get all published lessons for nav
  const allLessons = await db
    .select({ id: lessons.id, title: lessons.title, slug: lessons.slug, sortOrder: lessons.sortOrder })
    .from(lessons)
    .where(and(eq(lessons.courseId, course.id), eq(lessons.status, 'published')))
    .orderBy(asc(lessons.sortOrder), asc(lessons.createdAt))

  // Current lesson
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.slug, lessonSlug), eq(lessons.courseId, course.id)))
    .limit(1)
  if (!lesson) notFound()

  // Completions
  const completions = userId
    ? await db
        .select({ lessonId: lessonCompletions.lessonId })
        .from(lessonCompletions)
        .where(eq(lessonCompletions.userId, userId))
    : []
  const completedSet = new Set(completions.map((c) => c.lessonId))
  const isComplete = completedSet.has(lesson.id)

  // Prev / Next
  const currentIdx = allLessons.findIndex((l) => l.id === lesson.id)
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null
  const completedCount = allLessons.filter((l) => completedSet.has(l.id)).length

  return (
    <main className="flex-1 px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/member-centre/learning" className="hover:text-foreground">Learning</Link>
        <span>/</span>
        <Link href={`/member-centre/learning/${slug}`} className="hover:text-foreground">{course.title}</Link>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 rounded-lg border border-border bg-card p-3 flex items-center gap-3">
        <span className="text-xs text-muted-foreground shrink-0">
          {completedCount} / {allLessons.length} complete
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${allLessons.length > 0 ? (completedCount / allLessons.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="max-w-3xl">
        {/* Lesson header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
            {lesson.durationMin != null && (
              <p className="mt-1 text-sm text-muted-foreground">Estimated: {lesson.durationMin} min</p>
            )}
          </div>
          {isComplete && (
            <div className="flex items-center gap-1.5 shrink-0 text-sm font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" /> Completed
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-sm prose-slate max-w-none rounded-xl border border-border bg-card p-6 mb-6"
          dangerouslySetInnerHTML={{ __html: lesson.content ?? '<p class="text-muted-foreground">No content yet.</p>' }}
        />

        {/* Mark complete */}
        {!isComplete && (
          <form
            action={async () => {
              'use server'
              await markLessonComplete(lesson.id)
            }}
            className="mb-6"
          >
            <Button type="submit" className="bg-primary hover:bg-primary-hover text-primary-foreground gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Mark as Complete
            </Button>
          </form>
        )}

        {/* Prev / Next */}
        <div className="flex items-center justify-between">
          {prevLesson ? (
            <Link
              href={`/member-centre/learning/${slug}/${prevLesson.slug}`}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="truncate max-w-50">{prevLesson.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Link
              href={`/member-centre/learning/${slug}/${nextLesson.slug}`}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="truncate max-w-50">{nextLesson.title}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href={`/member-centre/learning/${slug}`}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Back to course
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
