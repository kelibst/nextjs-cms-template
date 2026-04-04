import { db, posts } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PostEditor } from '@/components/dashboard/post-editor'

export const dynamic = 'force-dynamic'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1)
  if (!post) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Edit Post</h1>
      <PostEditor post={post} />
    </div>
  )
}
