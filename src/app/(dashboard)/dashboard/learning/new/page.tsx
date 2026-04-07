import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CourseForm } from '@/components/dashboard/course-form'

export default function NewCoursePage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/learning" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground/80">
          <ArrowLeft className="h-4 w-4" /> Learning
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium">New Course</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">New Course</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Create a new CPD learning course</p>
      </div>
      <CourseForm />
    </div>
  )
}
