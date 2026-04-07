import { db } from '@/lib/db'
import { courses, lessons, courseEnrollments } from '@/lib/db'
import { desc, eq, count, sql } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, BookOpen, BarChart2 } from 'lucide-react'
import { CourseDeleteButton } from '@/components/dashboard/course-delete-button'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-orange-100 text-orange-600',
}

const levelColors: Record<string, string> = {
  beginner: 'bg-blue-50 text-blue-600',
  intermediate: 'bg-purple-50 text-purple-600',
  advanced: 'bg-red-50 text-red-600',
}

export default async function LearningPage() {
  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      category: courses.category,
      level: courses.level,
      status: courses.status,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .orderBy(desc(courses.createdAt))

  // Count lessons per course
  const lessonCounts = await db
    .select({ courseId: lessons.courseId, count: count(lessons.id) })
    .from(lessons)
    .groupBy(lessons.courseId)

  const countMap = new Map(lessonCounts.map((l) => [l.courseId, l.count]))

  // Enrollment and completion counts per course
  const enrollmentStats = await db
    .select({
      courseId: courseEnrollments.courseId,
      enrolled: count(),
      completed: sql<number>`count(case when ${courseEnrollments.completedAt} is not null then 1 end)`,
    })
    .from(courseEnrollments)
    .groupBy(courseEnrollments.courseId)

  const enrollMap = new Map(enrollmentStats.map((e) => [e.courseId, { enrolled: e.enrolled, completed: Number(e.completed) }]))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Learning Courses</h1>
          <p className="text-sm text-muted-foreground">{rows.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/learning/analytics">
            <Button variant="outline" size="sm" className="gap-1.5">
              <BarChart2 className="w-4 h-4" /> Analytics
            </Button>
          </Link>
          <Link href="/dashboard/learning/new">
            <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5">
              <Plus className="w-4 h-4" /> New Course
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lessons</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground/70 py-12">
                  No courses yet. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              rows.map((course) => {
                const stats = enrollMap.get(course.id)
                const enrolled = stats?.enrolled ?? 0
                const completed = stats?.completed ?? 0
                const rate = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0
                return (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium max-w-xs truncate">{course.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{course.category ?? '—'}</TableCell>
                    <TableCell>
                      {course.level && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${levelColors[course.level] ?? 'bg-muted text-muted-foreground'}`}>
                          {course.level}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[course.status ?? 'draft']}`}>
                        {course.status ?? 'draft'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {countMap.get(course.id) ?? 0} lessons
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{enrolled}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {completed > 0 ? `${completed} (${rate}%)` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/learning/${course.id}/lessons`}>
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                            <BookOpen className="w-3.5 h-3.5" /> Lessons
                          </Button>
                        </Link>
                        <Link href={`/dashboard/learning/${course.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <CourseDeleteButton id={course.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
