import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { courses, lessons, courseEnrollments, lessonCompletions } from "@/lib/db";
import { eq, and, count } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  CalendarDays,
  ExternalLink,
  Newspaper,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Member Centre",
};

export default async function MemberCentrePage() {
  const session = await auth();
  const user = session!.user!;
  const firstName = user.name?.split(" ")[0] ?? "Member";
  const role = (user as { role?: string }).role ?? "member";

  // Latest news: fetched from DB in a full implementation; empty array as placeholder
  const latestNews: Array<{ slug: string; title: string; date: string }> = [];

  // Fetch learning progress for the current user
  const userId = user.id as string | undefined
  let learningEnrollments: Array<{
    courseId: string
    title: string
    slug: string
    completedAt: Date | null
    totalLessons: number
    doneLessons: number
  }> = []

  if (userId) {
    try {
      const enrollRows = await db
        .select({
          courseId: courseEnrollments.courseId,
          completedAt: courseEnrollments.completedAt,
          title: courses.title,
          slug: courses.slug,
        })
        .from(courseEnrollments)
        .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
        .where(eq(courseEnrollments.userId, userId))

      for (const row of enrollRows) {
        const [{ total }] = await db
          .select({ total: count() })
          .from(lessons)
          .where(and(eq(lessons.courseId, row.courseId), eq(lessons.status, 'published')))

        const [{ done }] = await db
          .select({ done: count() })
          .from(lessonCompletions)
          .innerJoin(lessons, eq(lessonCompletions.lessonId, lessons.id))
          .where(and(eq(lessonCompletions.userId, userId), eq(lessons.courseId, row.courseId)))

        learningEnrollments.push({
          courseId: row.courseId,
          title: row.title,
          slug: row.slug,
          completedAt: row.completedAt,
          totalLessons: total,
          doneLessons: done,
        })
      }
    } catch {
      learningEnrollments = []
    }
  }

  const totalLessonsDone = learningEnrollments.reduce((s, e) => s + e.doneLessons, 0)
  const completedCourses = learningEnrollments.filter((e) => e.completedAt).length
  const inProgressCourses = learningEnrollments
    .filter((e) => !e.completedAt)
    .slice(0, 3)

  return (
    <main className="flex-1 px-8 py-8">
      {/* Welcome banner */}
      <div className="mb-8 rounded-xl bg-linear-to-r from-primary-hover to-primary px-6 py-6 text-primary-foreground shadow">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {firstName}!</h1>
            <p className="mt-0.5 text-primary-foreground/80">
              Your member dashboard
            </p>
          </div>
          <Badge className="ml-auto capitalize border-white/30 bg-white/20 text-white">
            {role.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Member Since
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">2024</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Membership Status
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
            <span className="text-lg font-semibold text-primary">Active</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Role
          </p>
          <p className="mt-1 text-lg font-semibold capitalize text-foreground">
            {role.replace("_", " ")}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-8">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Quick Links
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/publications"
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground/80 shadow-sm hover:border-primary/50 hover:bg-primary-subtle hover:text-primary"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            Browse Publications
            <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
          </Link>

          <Link
            href="/events"
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground/80 shadow-sm hover:border-primary/50 hover:bg-primary-subtle hover:text-primary"
          >
            <CalendarDays className="h-4 w-4 text-primary" />
            View Events
            <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
          </Link>

          <Link
            href="/member-centre/directory"
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground/80 shadow-sm hover:border-primary/50 hover:bg-primary-subtle hover:text-primary"
          >
            <Users className="h-4 w-4 text-primary" />
            Member Directory
            <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
          </Link>
        </div>
      </div>

      {/* My Learning */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">My Learning</h2>
          <Link href="/member-centre/learning" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          {/* Stats row */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{learningEnrollments.length}</p>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{completedCourses}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalLessonsDone}</p>
              <p className="text-xs text-muted-foreground">Lessons Done</p>
            </div>
          </div>

          {inProgressCourses.length > 0 ? (
            <div className="space-y-3">
              {inProgressCourses.map((course) => {
                const pct = course.totalLessons > 0
                  ? Math.round((course.doneLessons / course.totalLessons) * 100)
                  : 0
                return (
                  <div key={course.courseId}>
                    <div className="mb-1 flex items-center justify-between">
                      <Link
                        href={`/member-centre/learning/${course.slug}`}
                        className="text-sm font-medium text-foreground hover:text-primary truncate max-w-[70%]"
                      >
                        {course.title}
                      </Link>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {course.doneLessons}/{course.totalLessons} lessons
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : learningEnrollments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-2">
              No courses enrolled yet.{" "}
              <Link href="/member-centre/learning" className="text-primary hover:underline">Browse courses</Link>
            </p>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-2">
              All enrolled courses completed!
            </p>
          )}
        </div>
      </div>

      {/* Latest news */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Latest News
        </h2>
        <div className="rounded-xl border border-border bg-card shadow-sm">
          {latestNews.map((post, i) => (
            <Link
              key={post.slug}
              href={`/news/${post.slug}`}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-muted/50 ${
                i < latestNews.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <Newspaper className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {post.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(post.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <ExternalLink className="ml-auto mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
