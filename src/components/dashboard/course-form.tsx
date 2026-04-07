'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createCourse, updateCourse } from '@/app/actions/learning'
import type { Course } from '../../../drizzle/schema'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface CourseFormProps {
  course?: Course
}

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(course?.title ?? '')
  const [slug, setSlug] = useState(course?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(!!course)
  const [description, setDescription] = useState(course?.description ?? '')
  const [thumbnail, setThumbnail] = useState(course?.thumbnail ?? '')
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(course?.level ?? 'beginner')
  const [category, setCategory] = useState(course?.category ?? '')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(course?.status ?? 'draft')

  const isEdit = !!course

  const mutation = useMutation({
    mutationFn: async () => {
      const body = { title, slug, description: description || undefined, thumbnail: thumbnail || null, level, category: category || null, status }
      if (isEdit) {
        return updateCourse(course.id, body)
      } else {
        return createCourse(body)
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Course updated' : 'Course created')
      router.push('/dashboard/learning')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    },
  })

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="space-y-1">
        <label className="text-sm font-medium">Title *</label>
        <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Course title" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">Slug</label>
        <Input
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
          placeholder="course-slug"
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the course…"
          rows={3}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Thumbnail URL</label>
        <Input
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          placeholder="https://..."
        />
        {thumbnail && (
          <img src={thumbnail} alt="Thumbnail preview" className="mt-2 h-28 w-full object-cover rounded-lg border" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Level</label>
          <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Status</label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Category</label>
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Disease Control, Nutrition…"
        />
      </div>

      <div className="flex gap-3">
        <Button
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !title}
        >
          {mutation.isPending ? 'Saving…' : isEdit ? 'Update Course' : 'Create Course'}
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/learning')}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
