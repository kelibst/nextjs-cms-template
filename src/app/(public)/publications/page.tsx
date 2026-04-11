import type { Metadata } from "next";
import Link from "next/link";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { Button } from "@/components/ui/button";
import { Lock, FileText, Download } from "lucide-react";
import { auth } from "@/auth";
import { getAllPublications, getBlocksForPage } from "@/lib/data";
import { getHeroContent } from "@/lib/blocks";
import { BlockRenderer, type BlockDataSources } from "@/components/shared/block-renderer";

export const metadata: Metadata = {
  title: "Publications | GAPHTO",
  description: "GAPHTO knowledge resources — journals, reports, guidelines, and policy documents.",
};

const typeColors: Record<string, string> = {
  Journal: "bg-primary-muted text-primary/90",
  Report: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Guideline: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Manual: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Policy: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export default async function PublicationsPage() {
  const [session, blocks] = await Promise.all([
    auth(),
    getBlocksForPage('publications'),
  ])
  const isAuthenticated = !!session?.user;
  const publications = getAllPublications();
  const teaser = publications.slice(0, 3);

  const hero = getHeroContent(blocks, {
    title: 'Publications',
    label: 'Knowledge Base',
    subtitle: 'Journals, reports, guidelines, and policy documents from GAPHTO.',
  })

  const contentBlocks = blocks.filter(b => b.type !== 'hero')
  const dataSources: BlockDataSources = {}

  return (
    <>
      <InnerPageHero
        title={hero.title}
        label={hero.label}
        subtitle={hero.subtitle}
        heroImage={hero.heroImage}
        centered={hero.centered !== false}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Publications" }]}
      />

      {contentBlocks.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
          {contentBlocks.map(block => (
            <BlockRenderer key={block.id} block={block} dataSources={dataSources} pageContext="subpage" />
          ))}
        </div>
      )}

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {isAuthenticated ? (
          /* ── Logged-in: show full publication cards ── */
          <>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground">All Publications</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {publications.length} resource{publications.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {publications.map((pub) => (
                <Link
                  key={pub.slug}
                  href={`/publications/${pub.slug}`}
                  className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeColors[pub.type] ?? "bg-muted text-muted-foreground"}`}>
                      {pub.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{pub.year}</span>
                  </div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {pub.title}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {pub.description}
                  </p>
                  {pub.fileUrl && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </>
        ) : (
          /* ── Logged-out: teaser with lock ── */
          <>
            <div className="mb-10 text-center">
              <Lock className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Members-Only Access</h2>
              <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
                GAPHTO publications are available exclusively to members. Sign in with your
                member account to access journals, reports, guidelines, and more.
              </p>
            </div>

            <div className="mb-10 grid gap-6 sm:grid-cols-3">
              {teaser.map((pub) => (
                <div
                  key={pub.slug}
                  className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="blur-sm select-none">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground">{pub.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{pub.year} · {pub.type}</p>
                    <div className="mt-3 h-3 w-3/4 rounded bg-muted" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-background/60">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-primary">Members Only</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                asChild
                className="h-11 bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <Link href="/login">Sign In to Access</Link>
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">
                Not a member yet?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </>
        )}
      </section>
    </>
  );
}
