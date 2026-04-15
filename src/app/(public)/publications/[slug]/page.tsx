import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FileText, Download, ArrowLeft, Calendar, Tag } from "lucide-react";
import { auth } from "@/auth";
import { getAllPublications, getPublicationBySlug } from "@/lib/data";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { Button } from "@/components/ui/button";

export async function generateStaticParams() {
  const pubs = getAllPublications();
  return pubs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pub = getPublicationBySlug(slug);
  if (!pub) return {};
  return {
    title: `${pub.title} | Publications`,
    description: pub.description,
  };
}

const typeColors: Record<string, string> = {
  Journal: "bg-primary-muted text-primary/90",
  Report: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Guideline: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Manual: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Policy: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pub = getPublicationBySlug(slug);
  if (!pub) notFound();

  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/publications/${slug}`);
  }

  const isPdf = pub.fileUrl?.toLowerCase().endsWith(".pdf");

  return (
    <>
      <InnerPageHero
        title={pub.title}
        label={pub.type}
        subtitle={`${pub.year} · Publications`}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Publications", href: "/publications" },
          { label: pub.title },
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Metadata card */}
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-muted">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeColors[pub.type] ?? "bg-muted text-muted-foreground"}`}>
                <Tag className="h-3 w-3" />
                {pub.type}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {pub.year}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{pub.description}</p>
          </div>
          {pub.fileUrl ? (
            <Button asChild className="bg-primary hover:bg-primary-hover shrink-0">
              <a href={pub.fileUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </Button>
          ) : (
            <div className="shrink-0 text-sm text-muted-foreground italic">File coming soon</div>
          )}
        </div>

        {/* Description */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">About this Publication</h2>
          <p className="text-muted-foreground leading-relaxed">{pub.description}</p>
        </div>

        {/* PDF embed */}
        {pub.fileUrl && isPdf && (
          <div className="mb-8 overflow-hidden rounded-xl border border-border shadow-sm">
            <iframe
              src={pub.fileUrl}
              className="h-[600px] w-full"
              title={pub.title}
            />
          </div>
        )}

        {/* Back link */}
        <Link
          href="/publications"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Publications
        </Link>
      </div>
    </>
  );
}
