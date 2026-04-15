export const dynamic = 'force-dynamic'

import { sanitizeHtml } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPostBySlug } from "@/lib/server-data";
import {
  getRelatedPosts,
  decodeEntities,
  postImagePath,
} from "@/lib/data";
import { PostCard } from "@/components/shared/post-card";
import { ArticleHero } from "@/components/shared/article-hero";

const categoryLabels: Record<string, string> = {
  news: "News",
  blog: "Blog",
  announcement: "Announcement",
};

const categoryColors: Record<string, string> = {
  news: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  blog: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  announcement: "bg-primary-muted text-primary/90",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) return {};
  const rawMeta = post.localImage ? postImagePath(post.localImage) : post.featuredImage
  // OG images must be absolute URLs — skip relative paths to avoid URL construction errors
  const ogImage = rawMeta && rawMeta.startsWith('http') ? rawMeta : undefined
  return {
    title: decodeEntities(post.title),
    description: post.excerpt.slice(0, 160),
    openGraph: {
      title: decodeEntities(post.title),
      description: post.excerpt.slice(0, 160) || undefined,
      images: ogImage ? [ogImage] : [],
      type: "article",
      publishedTime: post.date ? new Date(post.date).toISOString() : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(post, 3);

  // Resolve image: local path gets /images/ prefix; featuredImage must be absolute or /‑relative
  const rawImage = post.localImage ? postImagePath(post.localImage) : post.featuredImage
  const imageSrc = rawImage && (rawImage.startsWith('/') || rawImage.startsWith('http'))
    ? rawImage
    : null

  const backHref = post.category === "blog" ? "/blog" : "/news";
  const backLabel = post.category === "blog" ? "Back to Blog" : "Back to News";

  return (
    <>
      <div className="pb-16">
        {/* Full-bleed image hero with overlaid title */}
        <ArticleHero
          title={decodeEntities(post.title)}
          imageSrc={imageSrc}
          category={post.category}
          categoryLabel={categoryLabels[post.category] ?? post.category}
          categoryColor={categoryColors[post.category] ?? "bg-muted text-muted-foreground"}
          date={post.date}
          author={post.author}
          backHref={backHref}
          backLabel={backLabel}
        />

        {/* Article body */}
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div
            className="prose prose-green max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t bg-muted/30 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-6 text-xl font-bold text-foreground">
                Related Articles
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
