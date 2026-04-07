import { db } from '@/lib/db'
import { courses } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CourseForm } from '@/components/dashboard/course-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCoursePage({ params }: Props) {
  const { id } = await params
  const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1)
  if (!course) notFound()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/learning" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground/80">
          <ArrowLeft className="h-4 w-4" /> Learning
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium">Edit Course</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">Edit Course</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{course.title}</p>
      </div>
      <CourseForm course={course} />
    </div>
  )
}
