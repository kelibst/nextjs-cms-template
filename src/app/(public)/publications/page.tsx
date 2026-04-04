import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Lock, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Publications",
};

const TEASER_PUBLICATIONS = [
  { title: "GAPHTO Journal Vol. 1", year: "2017", type: "Journal" },
  { title: "Annual Conference Report 2016", year: "2016", type: "Report" },
  { title: "Disease Control Guidelines", year: "2017", type: "Guideline" },
];

export default function PublicationsPage() {
  return (
    <>
      <PageHeader
        title="Publications"
        subtitle="GAPHTO knowledge resources and publications."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Publications" }]}
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Teaser text */}
        <div className="mb-10 text-center">
          <Lock className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Members-Only Access
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
            GAPHTO publications are available exclusively to members. Sign in
            with your member account to access journals, reports, guidelines,
            and more.
          </p>
        </div>

        {/* Blurred publication cards */}
        <div className="mb-10 grid gap-6 sm:grid-cols-3">
          {TEASER_PUBLICATIONS.map((pub) => (
            <div
              key={pub.title}
              className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              {/* Blurred content */}
              <div className="blur-sm select-none">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-subtle">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground">{pub.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{pub.year} · {pub.type}</p>
                <div className="mt-3 h-3 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
              </div>

              {/* Lock overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-primary">
                    Members Only
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            asChild
            className="h-11 bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            <Link href="/login">Sign In to Access</Link>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            Not a member yet?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
