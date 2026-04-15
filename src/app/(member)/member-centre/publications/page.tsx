import type { Metadata } from "next";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Publications",
};

const SAMPLE_PUBLICATIONS = [
  { title: "Sample Publication", year: "2024", type: "Journal", size: "2.4 MB" },
  { title: "Annual Conference Report", year: "2024", type: "Report", size: "1.8 MB" },
  { title: "Best Practices Guideline", year: "2024", type: "Guideline", size: "3.1 MB" },
  { title: "Member Resource Manual", year: "2024", type: "Manual", size: "4.2 MB" },
  { title: "Policy Brief", year: "2024", type: "Brief", size: "890 KB" },
];

const TYPE_COLORS: Record<string, string> = {
  Journal: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  Report: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  Guideline: "bg-primary-subtle text-primary border-primary-muted",
  Manual: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  Brief: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-red-900/30 dark:text-red-400",
};

export default function MemberPublicationsPage() {
  return (
    <main className="flex-1">
      <InnerPageHero
        title="Publications"
        label="Knowledge Base"
        subtitle="Member-exclusive publications and resources."
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
            Access to publications is available to members only.
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
  );
}
