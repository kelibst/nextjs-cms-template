import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, LayoutDashboard, User, BookOpen, CalendarDays, LogOut } from "lucide-react";
import { handleSignOut } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Publications",
};

const SAMPLE_PUBLICATIONS = [
  { title: "GAPHTO Journal Vol. 1", year: "2017", type: "Journal", size: "2.4 MB" },
  { title: "Annual Conference Report 2016", year: "2016", type: "Report", size: "1.8 MB" },
  { title: "Disease Control Guidelines", year: "2017", type: "Guideline", size: "3.1 MB" },
  { title: "Health Information Manual", year: "2016", type: "Manual", size: "4.2 MB" },
  { title: "Nutrition Policy Brief", year: "2017", type: "Brief", size: "890 KB" },
];

const TYPE_COLORS: Record<string, string> = {
  Journal: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  Report: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  Guideline: "bg-primary-subtle text-primary border-primary-muted",
  Manual: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  Brief: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-red-900/30 dark:text-red-400",
};

export default async function MemberPublicationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/member-centre/publications");
  }

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
            <Link
              href="/member-centre"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
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
              className="flex items-center gap-3 rounded-lg bg-primary-subtle px-3 py-2.5 text-sm font-medium text-primary"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              Publications
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
        <main className="flex-1">
          <PageHeader
            title="Publications"
            subtitle="GAPHTO member-exclusive publications and resources."
            breadcrumb={[
              { label: "Member Centre", href: "/member-centre" },
              { label: "Publications" },
            ]}
          />

          <div className="px-8 py-8">
            {/* Info banner */}
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <p>
                Access to publications is available to GAPHTO members only.
                Downloads will be enabled after Phase 4 DB migration.
              </p>
            </div>

            {/* Publications list */}
            <div className="space-y-3">
              {SAMPLE_PUBLICATIONS.map((pub) => (
                <div
                  key={pub.title}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{pub.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {pub.year} · {pub.size}
                    </p>
                  </div>

                  <Badge
                    className={`shrink-0 border text-xs font-medium ${TYPE_COLORS[pub.type] ?? "bg-muted text-muted-foreground border-border"}`}
                  >
                    {pub.type}
                  </Badge>

                  <div className="relative shrink-0">
                    <Button
                      disabled
                      className="flex cursor-not-allowed items-center gap-2 border border-border bg-muted text-xs text-muted-foreground"
                      title="Full download available after Phase 4 DB migration"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground/70">
              Full download functionality will be available after Phase 4 database migration.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
