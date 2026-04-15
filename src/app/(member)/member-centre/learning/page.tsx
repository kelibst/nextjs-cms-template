import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { courses, lessons, courseEnrollments } from '@/lib/db'
import { eq, count, and } from 'drizzle-orm'
import { lessonCompletions } from '@/lib/db'
import { enrollInCourse } from '@/app/actions/learning'
import { BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Learning',
}

const levelColors: Record<string, string> = {
  beginner: 'bg-blue-50 text-blue-600 border-blue-100',
  intermediate: 'bg-purple-50 text-purple-600 border-purple-100',
  advanced: 'bg-red-50 text-red-600 border-red-100',
}

export default async function MemberLearningPage() {
  const session = await auth()
  const userId = session?.user?.id

  // Fetch published courses with lesson counts
  const publishedCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      thumbnail: courses.thumbnail,
      level: courses.level,
      category: courses.category,
    })
    .from(courses)
    .where(eq(courses.status, 'published'))

  // Count lessons per course
  const lessonCounts = await db
    .select({ courseId: lessons.courseId, cnt: count(lessons.id) })
    .from(lessons)
    .where(eq(lessons.status, 'published'))
    .groupBy(lessons.courseId)
  const countMap = new Map(lessonCounts.map((l) => [l.courseId, l.cnt]))

  // Fetch enrollments for this user with completion status
  const enrollments = userId
    ? await db
        .select({
          courseId: courseEnrollments.courseId,
          enrolledAt: courseEnrollments.enrolledAt,
          completedAt: courseEnrollments.completedAt,
        })
        .from(courseEnrollments)
        .where(eq(courseEnrollments.userId, userId))
    : []
  const enrolledSet = new Set(enrollments.map((e) => e.courseId))

  // For enrolled courses, build progress data
  type ProgressEntry = {
    courseId: string
    completedAt: Date | null
    title: string
    slug: string
    thumbnail: string | null
    level: string | null
    totalLessons: number
    doneLessons: number
  }

  const progressEntries: ProgressEntry[] = []
  if (userId && enrollments.length > 0) {
    for (const enr of enrollments) {
      const course = publishedCourses.find((c) => c.id === enr.courseId)
      if (!course) continue

      const total = countMap.get(enr.courseId) ?? 0

      const [{ done }] = await db
        .select({ done: count() })
        .from(lessonCompletions)
        .innerJoin(lessons, eq(lessonCompletions.lessonId, lessons.id))
        .where(and(eq(lessonCompletions.userId, userId), eq(lessons.courseId, enr.courseId)))

      progressEntries.push({
        courseId: enr.courseId,
        completedAt: enr.completedAt,
        title: course.title,
        slug: course.slug,
        thumbnail: course.thumbnail ?? null,
        level: course.level ?? null,
        totalLessons: total,
        doneLessons: done,
      })
    }
  }

  return (
    <main className="flex-1 px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">CPD Learning</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Continuing Professional Development courses for members
        </p>
      </div>

      {/* My Progress Section */}
      {progressEntries.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-base font-semibold text-foreground">My Progress</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {progressEntries.map((entry) => {
              const pct = entry.totalLessons > 0
                ? Math.round((entry.doneLessons / entry.totalLessons) * 100)
                : 0
              const isComplete = !!entry.completedAt
              return (
                <div key={entry.courseId} className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  {entry.thumbnail ? (
                    <img src={entry.thumbnail} alt={entry.title} className="h-32 w-full object-cover" />
                  ) : (
                    <div className="h-32 w-full bg-primary-subtle flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-primary/40" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-center gap-2">
                      {isComplete ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          In Progress
                        </span>
                      )}
                      {entry.level && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${levelColors[entry.level] ?? 'bg-muted text-muted-foreground'}`}>
                          {entry.level}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug mb-2 line-clamp-2">{entry.title}</h3>
                    <div className="mt-auto">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>{entry.doneLessons}/{entry.totalLessons} lessons</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-3">
                        <div
                          className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <Link
                        href={`/member-centre/learning/${entry.slug}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {isComplete ? 'Review' : 'Continue'} →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">All Courses</h2>
      </div>

      {publishedCourses.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          No courses available yet. Check back soon!
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {publishedCourses.map((course) => {
            const isEnrolled = enrolledSet.has(course.id)
            const lessonCount = countMap.get(course.id) ?? 0

            return (
              <div key={course.id} className="flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Thumbnail */}
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-primary-subtle flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-primary/40" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-4">
                  {/* Badges */}
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {course.category && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {course.category}
                      </span>
                    )}
                    {course.level && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${levelColors[course.level] ?? 'bg-muted text-muted-foreground'}`}>
                        {course.level}
                      </span>
                    )}
                    {isEnrolled && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                        Enrolled
                      </span>
                    )}
                  </div>

                  <h2 className="font-semibold text-foreground leading-snug mb-1">
                    {course.title}
                  </h2>
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {course.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</span>
                    <Link
                      href={`/member-centre/learning/${course.slug}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {isEnrolled ? 'Continue' : 'View Course'} →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
