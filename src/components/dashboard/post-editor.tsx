'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiRequest } from '@/lib/api'
import { createPost, updatePost } from '@/app/actions/posts'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import type { Post } from '../../../drizzle/schema'
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
import {
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Quote, Code, ImageIcon,
} from 'lucide-react'
import { ImageField } from '@/components/dashboard/media-picker-modal'

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

interface PostEditorProps {
  post?: Post
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(!!post)
  const [category, setCategory] = useState(post?.category ?? 'news')
  const [status, setStatus] = useState(post?.status ?? 'draft')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage ?? '')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your post content here…' }),
      CharacterCount,
    ],
    content: post?.content ?? '',
  })

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slugEdited) setSlug(slugify(val))
  }

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      return apiRequest<{ url: string }>('/api/upload', { method: 'POST', body: fd })
    },
    onError: () => {
      toast.error('Failed to upload image')
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (overrideStatus?: string) => {
      if (!editor) throw new Error('Editor not ready')
      const body = {
        title,
        slug,
        category,
        status: overrideStatus ?? status,
        excerpt,
        featuredImage,
        content: editor.getHTML(),
      }
      if (post) {
        return updatePost(post.id, body)
      } else {
        return createPost(body)
      }
    },
    onSuccess: () => {
      toast.success('Post saved')
      router.push('/dashboard/posts')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    },
  })

  const insertImage = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const data = await uploadMutation.mutateAsync(file)
      editor?.chain().focus().setImage({ src: data.url }).run()
    }
    input.click()
  }, [editor, uploadMutation])

  const isPending = uploadMutation.isPending || saveMutation.isPending

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Title + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
            className="text-2xl font-bold h-auto py-2 border-0 border-b rounded-none px-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/50"
          />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
            <span>Slug:</span>
            <input
              className="flex-1 bg-transparent border-b border-dashed border-border focus:outline-none text-muted-foreground"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true) }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => saveMutation.mutate('draft')} disabled={isPending}>
            Save Draft
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground" onClick={() => saveMutation.mutate('published')} disabled={isPending}>
            Publish
          </Button>
          {post && (
            <Button variant="ghost" size="sm" onClick={() => window.open(`/news/${post.slug}`, '_blank')}>
              Preview
            </Button>
          )}
        </div>
      </div>

      {/* Meta fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
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

      {/* Excerpt */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Excerpt</label>
          <span className="text-xs text-muted-foreground/70">{excerpt.length}/300</span>
        </div>
        <Textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value.slice(0, 300))}
          placeholder="Brief summary of the post…"
          rows={2}
        />
      </div>

      {/* Featured image */}
      <ImageField
        label="Featured Image"
        value={featuredImage}
        onChange={setFeaturedImage}
        accept="image"
        pickerTitle="Choose Featured Image"
      />

      {/* Editor */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Content</label>
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 border border-border rounded-t-lg bg-muted/50 p-2">
          {[
            { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), title: 'Bold' },
            { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), title: 'Italic' },
            { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), title: 'H2' },
            { icon: Heading3, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), title: 'H3' },
            { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), title: 'Bullet List' },
            { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), title: 'Ordered List' },
            { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), title: 'Blockquote' },
            { icon: Code, action: () => editor?.chain().focus().toggleCodeBlock().run(), title: 'Code' },
            { icon: ImageIcon, action: insertImage, title: 'Insert Image' },
          ].map(({ icon: Icon, action, title }) => (
            <button
              key={title}
              type="button"
              title={title}
              onClick={action}
              className="p-1.5 rounded hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
        <div className="border border-t-0 border-border rounded-b-lg p-4 min-h-[400px] prose prose-sm max-w-none focus-within:ring-2 focus-within:ring-primary/20">
          <EditorContent editor={editor} className="outline-none" />
        </div>
      </div>
    </div>
  )
}
