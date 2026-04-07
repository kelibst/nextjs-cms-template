import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { courses, lessons, courseEnrollments, lessonCompletions, users } from '@/lib/db'
import { eq, and, asc } from 'drizzle-orm'
import { enrollInCourse } from '@/app/actions/learning'
import {
  BookOpen,
  Lock,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [course] = await db.select({ title: courses.title }).from(courses).where(eq(courses.slug, slug)).limit(1)
  return { title: course?.title ?? 'Course' }
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id

  const [course] = await db.select().from(courses).where(and(eq(courses.slug, slug), eq(courses.status, 'published'))).limit(1)
  if (!course) notFound()

  // Fetch instructor name
  let instructorName: string | null = null
  if (course.instructorId) {
    const [instructor] = await db.select({ name: users.name }).from(users).where(eq(users.id, course.instructorId)).limit(1)
    instructorName = instructor?.name ?? null
  }

  // Published lessons
  const lessonList = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.courseId, course.id), eq(lessons.status, 'published')))
    .orderBy(asc(lessons.sortOrder), asc(lessons.createdAt))

  // Is enrolled?
  const [enrollment] = userId
    ? await db
        .select()
        .from(courseEnrollments)
        .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, course.id)))
        .limit(1)
    : [undefined]
  const isEnrolled = !!enrollment

  // Completed lesson ids
  const completions = userId && isEnrolled
    ? await db
        .select({ lessonId: lessonCompletions.lessonId })
        .from(lessonCompletions)
        .where(eq(lessonCompletions.userId, userId))
    : []
  const completedSet = new Set(completions.map((c) => c.lessonId))

  const levelColors: Record<string, string> = {
    beginner: 'bg-blue-50 text-blue-600',
    intermediate: 'bg-purple-50 text-purple-600',
    advanced: 'bg-red-50 text-red-600',
  }

  return (
    <main className="flex-1 px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/member-centre/learning" className="hover:text-foreground">Learning</Link>
        <span>/</span>
        <span className="text-foreground">{course.title}</span>
      </div>

      <div className="max-w-3xl">
        {/* Course header */}
        {course.thumbnail && (
          <img src={course.thumbnail} alt={course.title} className="mb-5 h-48 w-full rounded-xl object-cover border border-border" />
        )}

        <div className="mb-5 flex flex-wrap gap-2">
          {course.category && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {course.category}
            </span>
          )}
          {course.level && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${levelColors[course.level] ?? 'bg-muted text-muted-foreground'}`}>
              {course.level}
            </span>
          )}
          {isEnrolled && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
              Enrolled
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">{course.title}</h1>
        {instructorName && (
          <p className="text-sm text-muted-foreground mb-3">Instructor: {instructorName}</p>
        )}
        {course.description && (
          <p className="text-muted-foreground mb-5">{course.description}</p>
        )}

        {/* Enroll button */}
        {!isEnrolled && (
          <form
            action={async () => {
              'use server'
              await enrollInCourse(course.id)
            }}
            className="mb-6"
          >
            <Button type="submit" className="bg-primary hover:bg-primary-hover text-primary-foreground">
              Enroll in this course
            </Button>
          </form>
        )}

        {/* Progress */}
        {isEnrolled && lessonList.length > 0 && (
          <div className="mb-5 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Your Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSet.size} / {lessonList.length} lessons
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${lessonList.length > 0 ? (completedSet.size / lessonList.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Lessons list */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground">
              Lessons ({lessonList.length})
            </h2>
          </div>

          {lessonList.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No lessons available yet.</p>
          ) : (
            <ul className="divide-y divide-border/50">
              {lessonList.map((lesson, i) => {
                const isDone = completedSet.has(lesson.id)
                const canView = isEnrolled

                return (
                  <li key={lesson.id} className={`flex items-center gap-4 px-5 py-3.5 ${canView ? 'hover:bg-muted/30' : ''}`}>
                    <span className="w-6 shrink-0 text-sm text-muted-foreground font-mono">{i + 1}</span>
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : canView ? (
                      <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Lock className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <div className="flex-1 min-w-0">
                      {canView ? (
                        <Link
                          href={`/member-centre/learning/${slug}/${lesson.slug}`}
                          className={`text-sm font-medium ${isDone ? 'text-primary line-through decoration-primary/30' : 'text-foreground hover:text-primary'}`}
                        >
                          {lesson.title}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground/60">{lesson.title}</span>
                      )}
                    </div>
                    {lesson.durationMin != null && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" /> {lesson.durationMin} min
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {!isEnrolled && lessonList.length > 0 && (
            <div className="px-5 py-4 border-t border-border/50 bg-muted/20 text-sm text-muted-foreground text-center">
              Enroll to access all lessons
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
