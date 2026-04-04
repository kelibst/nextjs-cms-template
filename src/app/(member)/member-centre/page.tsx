import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { handleSignOut } from "@/app/actions/auth";
import newsData from "@/data/news.json";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  User,
  BookOpen,
  CalendarDays,
  LogOut,
  ExternalLink,
  Newspaper,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Member Centre",
};

export default async function MemberCentrePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/member-centre");
  }

  const user = session.user;
  const firstName = user.name?.split(" ")[0] ?? "Member";
  const role = (user as { role?: string }).role ?? "member";

  // Get 3 most recent news posts
  const latestNews = (newsData as Array<{ slug: string; title: string; date: string }>)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Top bar */}
      <div className="border-b border-primary/30 bg-primary-deep px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-wide text-primary-foreground">
            GAPHTO
          </Link>
          <span className="text-sm text-primary-foreground/70">Member Portal</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-0">
        {/* Sidebar */}
        <aside className="sticky top-0 h-[calc(100vh-49px)] w-52 shrink-0 border-r border-border bg-card pt-6">
          <nav className="flex flex-col gap-1 px-3">
            {/* Dashboard — active */}
            <Link
              href="/member-centre"
              className="flex items-center gap-3 rounded-lg bg-primary-subtle px-3 py-2.5 text-sm font-medium text-primary"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Dashboard
            </Link>

            <Link
              href="/member-centre/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <User className="h-4 w-4 shrink-0" />
              My Profile
            </Link>

            <Link
              href="/member-centre/publications"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              Publications
            </Link>

            <Link
              href="/member-centre/directory"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <Users className="h-4 w-4 shrink-0" />
              Member Directory
            </Link>

            <Link
              href="/events"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              <CalendarDays className="h-4 w-4 shrink-0" />
              Events
            </Link>

            <div className="mt-4 border-t border-border/50 pt-4">
              <form
                action={async () => {
                  "use server";
                  await handleSignOut();
                }}
              >
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign Out
                </button>
              </form>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-8 py-8">
          {/* Welcome banner */}
          <div className="mb-8 rounded-xl bg-linear-to-r from-primary-hover to-primary px-6 py-6 text-primary-foreground shadow">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {firstName}!</h1>
                <p className="mt-0.5 text-primary-foreground/80">
                  Your GAPHTO member dashboard
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
      </div>
    </div>
  );
}
