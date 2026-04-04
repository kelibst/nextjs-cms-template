import { db } from '@/lib/db'
import { posts, users } from '../../../../../drizzle/schema'
import { desc, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil } from 'lucide-react'
import { PostDeleteButton } from '@/components/dashboard/post-delete-button'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-muted text-muted-foreground',
}

const categoryLabels: Record<string, string> = {
  'gaphto-news': 'GAPHTO News',
  'health-news': 'Health News',
  'blog': 'Blog',
  'announcement': 'Announcement',
}

export default async function PostsPage() {
  const session = await auth()
  const role = session!.user.role

  const allPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      category: posts.category,
      status: posts.status,
      createdAt: posts.createdAt,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Posts</h1>
          <p className="text-sm text-muted-foreground">{allPosts.length} total</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground gap-1.5">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground/70 py-12">
                  No posts yet. Create your first post.
                </TableCell>
              </TableRow>
            ) : (
              allPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {categoryLabels[post.category] ?? post.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[post.status]}`}>
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{post.authorName ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground/70 text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/posts/${post.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      {(role === 'super_admin' || role === 'admin') && (
                        <PostDeleteButton postId={post.id} />
                      )}
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
