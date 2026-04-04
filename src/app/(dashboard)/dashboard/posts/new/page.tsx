import { PostEditor } from '@/components/dashboard/post-editor'

export default function NewPostPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">New Post</h1>
      <PostEditor />
    </div>
  )
}
