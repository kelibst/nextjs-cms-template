import { db } from '@/lib/db'
import { posts, members, events, contactSubmissions } from '../../../../drizzle/schema'
import { count, eq } from 'drizzle-orm'
import { desc } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Newspaper, Users, CalendarDays, MailOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-muted text-muted-foreground',
}

export default async function DashboardPage() {
  const [[postCount], [memberCount], [eventCount], [unreadCount]] = await Promise.all([
    db.select({ count: count() }).from(posts),
    db.select({ count: count() }).from(members),
    db.select({ count: count() }).from(events),
    db.select({ count: count() }).from(contactSubmissions).where(eq(contactSubmissions.isRead, false)),
  ])

  const [recentPosts, recentContacts] = await Promise.all([
    db.select().from(posts).orderBy(desc(posts.createdAt)).limit(5),
    db.select().from(contactSubmissions)
      .where(eq(contactSubmissions.isRead, false))
      .orderBy(desc(contactSubmissions.submittedAt))
      .limit(5),
  ])

  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const stats = [
    { label: 'Total Posts', value: postCount.count, icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Members', value: memberCount.count, icon: Users, color: 'text-primary', bg: 'bg-primary-subtle' },
    { label: 'Events', value: eventCount.count, icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Unread Messages', value: unreadCount.count, icon: MailOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{now}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Posts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground/70 px-5 pb-4">No posts yet.</p>
            ) : (
              <ul className="divide-y divide-border/50">
                {recentPosts.map((post) => (
                  <li key={post.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {post.category} · {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusColors[post.status]}`}>
                      {post.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground/70 px-5 pb-4">No unread messages.</p>
            ) : (
              <ul className="divide-y divide-border/50">
                {recentContacts.map((msg) => (
                  <li key={msg.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{msg.name}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                        {msg.subject ?? 'No subject'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground/70 whitespace-nowrap">
                      {new Date(msg.submittedAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
