import { db } from '@/lib/db'
import { courses, lessons } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LessonForm } from '@/components/dashboard/lesson-form'

interface Props {
  params: Promise<{ id: string; lessonId: string }>
}

export default async function EditLessonPage({ params }: Props) {
  const { id, lessonId } = await params

  const [course] = await db.select({ title: courses.title }).from(courses).where(eq(courses.id, id)).limit(1)
  if (!course) notFound()

  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1)
  if (!lesson) notFound()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/learning/${id}/lessons`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground/80">
          <ArrowLeft className="h-4 w-4" /> {course.title} Lessons
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium">Edit Lesson</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">Edit Lesson</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{lesson.title}</p>
      </div>
      <LessonForm courseId={id} lesson={lesson} />
    </div>
  )
}
