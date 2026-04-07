'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createNewsletter, updateNewsletter, sendNewsletter } from '@/app/actions/newsletter'
import type { Newsletter } from '../../../drizzle/schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapLink from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Quote, Send,
} from 'lucide-react'

interface NewsletterFormProps {
  newsletter?: Newsletter
}

export function NewsletterForm({ newsletter }: NewsletterFormProps) {
  const router = useRouter()
  const [subject, setSubject] = useState(newsletter?.subject ?? '')
  const [showSendDialog, setShowSendDialog] = useState(false)

  const isEdit = !!newsletter

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TipTapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your newsletter content here…' }),
    ],
    content: newsletter?.content ?? '',
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editor) throw new Error('Editor not ready')
      const body = { subject, content: editor.getHTML() }
      if (isEdit) {
        return updateNewsletter(newsletter.id, body)
      } else {
        return createNewsletter(body)
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Newsletter updated' : 'Draft saved')
      router.push('/dashboard/newsletter')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    },
  })

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!newsletter?.id) throw new Error('No newsletter id')
      return sendNewsletter(newsletter.id)
    },
    onSuccess: () => {
      toast.success('Newsletter sent successfully!')
      setShowSendDialog(false)
      router.push('/dashboard/newsletter')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to send newsletter')
      setShowSendDialog(false)
    },
  })

  const isPending = saveMutation.isPending || sendMutation.isPending

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="space-y-1">
        <label className="text-sm font-medium">Subject *</label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Newsletter subject line"
        />
      </div>

      {/* Content Editor */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Content</label>
        <div className="flex flex-wrap gap-1 border border-border rounded-t-lg bg-muted/50 p-2">
          {[
            { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), title: 'Bold' },
            { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), title: 'Italic' },
            { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), title: 'H2' },
            { icon: Heading3, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), title: 'H3' },
            { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), title: 'Bullet List' },
            { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), title: 'Ordered List' },
            { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), title: 'Blockquote' },
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
        <div className="border border-t-0 border-border rounded-b-lg p-4 min-h-[350px] prose prose-sm max-w-none focus-within:ring-2 focus-within:ring-primary/20">
          <EditorContent editor={editor} className="outline-none" />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => saveMutation.mutate()}
          disabled={isPending || !subject}
        >
          {saveMutation.isPending ? 'Saving…' : 'Save Draft'}
        </Button>

        {isEdit && (
          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5"
            onClick={() => setShowSendDialog(true)}
            disabled={isPending || !subject}
          >
            <Send className="w-4 h-4" /> Send Now
          </Button>
        )}

        <Button variant="ghost" onClick={() => router.push('/dashboard/newsletter')}>
          Cancel
        </Button>
      </div>

      {/* Send confirmation dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send newsletter?</DialogTitle>
            <DialogDescription>
              This will email all opted-in active members. This action cannot be undone. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5"
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending}
            >
              <Send className="w-4 h-4" />
              {sendMutation.isPending ? 'Sending…' : 'Yes, Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
