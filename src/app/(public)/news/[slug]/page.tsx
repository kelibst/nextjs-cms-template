import { sanitizeHtml } from "@/lib/utils";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  decodeEntities,
  postImagePath,
} from "@/lib/data";
import { PostCard } from "@/components/shared/post-card";

const categoryLabels: Record<string, string> = {
  "gaphto-news": "GAPHTO News",
  "health-news": "Health News",
  blog: "Blog",
};

const categoryColors: Record<string, string> = {
  "gaphto-news": "bg-primary-muted text-primary/90",
  "health-news": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  blog: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const imageSrc = post.localImage ? postImagePath(post.localImage) : post.featuredImage;
  return {
    title: decodeEntities(post.title),
    description: post.excerpt.slice(0, 160),
    openGraph: {
      title: decodeEntities(post.title),
      description: post.excerpt.slice(0, 160) || undefined,
      images: imageSrc ? [imageSrc] : [],
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
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(post, 3);
  const imageSrc = post.localImage
    ? postImagePath(post.localImage)
    : post.featuredImage;

  return (
    <>
      <div className="pb-16">
        {/* Featured image */}
        {imageSrc && (
          <div className="relative h-64 w-full overflow-hidden bg-primary-deep sm:h-80 md:h-96">
            <Image
              src={imageSrc}
              alt={decodeEntities(post.title)}
              fill
              className="object-cover opacity-80"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60" />
          </div>
        )}

        {/* Article */}
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {/* Back link */}
          <Link
            href="/news"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
            Back to News
          </Link>

          {/* Category + date */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                categoryColors[post.category] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {categoryLabels[post.category] ?? post.category}
            </span>
            <time dateTime={post.date} className="text-sm text-muted-foreground">
              {formatDate(post.date)}
            </time>
            {post.author && (
              <span className="text-sm text-muted-foreground">
                By {post.author}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {decodeEntities(post.title)}
          </h1>

          {/* Article body */}
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
