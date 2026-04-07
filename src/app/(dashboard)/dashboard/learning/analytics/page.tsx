import { db } from '@/lib/db'
import { courses, lessons, courseEnrollments, lessonCompletions } from '@/lib/db'
import { eq, count, sql } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ArrowLeft, BookOpen, Users, GraduationCap, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LearningAnalyticsPage() {
  // Per-course enrollment + completion stats
  const courseStats = await db
    .select({
      courseId: courseEnrollments.courseId,
      enrolled: count(),
      completed: sql<number>`count(case when ${courseEnrollments.completedAt} is not null then 1 end)`,
    })
    .from(courseEnrollments)
    .groupBy(courseEnrollments.courseId)

  // All courses (published only for analytics)
  const allCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      status: courses.status,
    })
    .from(courses)

  // Lesson completions per user per course (for avg lessons done per enrollee)
  const lessonStats = await db
    .select({
      courseId: lessons.courseId,
      userId: lessonCompletions.userId,
      cnt: count(),
    })
    .from(lessonCompletions)
    .innerJoin(lessons, eq(lessonCompletions.lessonId, lessons.id))
    .groupBy(lessons.courseId, lessonCompletions.userId)

  // Build avg lessons map: courseId → average lessons completed per enrolled user
  const lessonSumMap = new Map<string, number>()
  const lessonEnrolledMap = new Map<string, number>()
  for (const row of lessonStats) {
    lessonSumMap.set(row.courseId, (lessonSumMap.get(row.courseId) ?? 0) + Number(row.cnt))
    lessonEnrolledMap.set(row.courseId, (lessonEnrolledMap.get(row.courseId) ?? 0) + 1)
  }

  // Build stats map by courseId
  const statsMap = new Map(courseStats.map((s) => [s.courseId, { enrolled: s.enrolled, completed: Number(s.completed) }]))

  // Summary totals
  const totalPublished = allCourses.filter((c) => c.status === 'published').length
  const totalEnrollments = courseStats.reduce((sum, s) => sum + s.enrolled, 0)
  const totalCompletions = courseStats.reduce((sum, s) => sum + Number(s.completed), 0)
  const activeLearners = totalEnrollments - totalCompletions

  // Merge all courses with their stats for the table
  const tableRows = allCourses.map((course) => {
    const stats = statsMap.get(course.id)
    const enrolled = stats?.enrolled ?? 0
    const completed = stats?.completed ?? 0
    const rate = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0
    const lessonSum = lessonSumMap.get(course.id) ?? 0
    const lessonEnrolled = lessonEnrolledMap.get(course.id) ?? 0
    const avgLessons = lessonEnrolled > 0 ? (lessonSum / lessonEnrolled).toFixed(1) : '0'
    return { ...course, enrolled, completed, rate, avgLessons }
  }).filter((r) => r.enrolled > 0 || r.status === 'published')

  const summaryCards = [
    { label: 'Published Courses', value: totalPublished, icon: BookOpen, color: 'text-primary bg-primary-subtle' },
    { label: 'Total Enrollments', value: totalEnrollments, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Completions', value: totalCompletions, icon: GraduationCap, color: 'text-green-700 bg-green-50' },
    { label: 'Active Learners', value: activeLearners, icon: TrendingUp, color: 'text-purple-700 bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/learning">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Learning Analytics</h1>
          <p className="text-sm text-muted-foreground">Member engagement with CPD courses</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Per-course Table */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">Per-Course Breakdown</h2>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Avg Lessons Done</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground/70 py-12">
                    No enrollment data yet.
                  </TableCell>
                </TableRow>
              ) : (
                tableRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium max-w-xs truncate">{row.title}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                        row.status === 'published' ? 'bg-green-100 text-green-700' :
                        row.status === 'archived' ? 'bg-orange-100 text-orange-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {row.status ?? 'draft'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{row.enrolled}</TableCell>
                    <TableCell className="text-sm">{row.completed}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${row.rate}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{row.rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.avgLessons}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
