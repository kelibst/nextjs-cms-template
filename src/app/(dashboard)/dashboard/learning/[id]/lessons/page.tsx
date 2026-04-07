import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db'
import { eq, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, ArrowLeft } from 'lucide-react'
import { LessonDeleteButton } from '@/components/dashboard/lesson-delete-button'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-100 text-green-700',
}

export default async function LessonsPage({ params }: Props) {
  const { id } = await params

  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1)
  if (!course) notFound()

  const lessonRows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.courseId, id))
    .orderBy(asc(lessons.sortOrder), asc(lessons.createdAt))

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/learning" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground/80">
          <ArrowLeft className="h-4 w-4" /> Learning
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium">{course.title}</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium">Lessons</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{course.title} — Lessons</h1>
          <p className="text-sm text-muted-foreground">{lessonRows.length} lessons</p>
        </div>
        <Link href={`/dashboard/learning/${id}/lessons/new`}>
          <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5">
            <Plus className="w-4 h-4" /> New Lesson
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessonRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground/70 py-12">
                  No lessons yet. Add your first lesson!
                </TableCell>
              </TableRow>
            ) : (
              lessonRows.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="text-sm text-muted-foreground font-mono">{lesson.sortOrder ?? 0}</TableCell>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[lesson.status ?? 'draft']}`}>
                      {lesson.status ?? 'draft'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lesson.durationMin != null ? `${lesson.durationMin} min` : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/learning/${id}/lessons/${lesson.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <LessonDeleteButton lessonId={lesson.id} courseId={id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
