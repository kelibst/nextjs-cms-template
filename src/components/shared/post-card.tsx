import Image from "next/image";
import Link from "next/link";
import { Post, decodeEntities, postImagePath } from "@/lib/data";

const categoryColors: Record<string, string> = {
  "gaphto-news": "bg-primary-muted text-primary/90",
  "health-news": "bg-blue-100 text-blue-800",
  blog: "bg-amber-100 text-amber-800",
};

const categoryLabels: Record<string, string> = {
  "gaphto-news": "GAPHTO News",
  "health-news": "Health News",
  blog: "Blog",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PostCardProps {
  post: Post;
}

function resolveImageSrc(post: Post): string | null {
  if (post.localImage) return postImagePath(post.localImage)
  const img = post.featuredImage
  if (!img) return null
  if (img.startsWith("http") || img.startsWith("/")) return img
  // relative path stored in DB — prepend /images/
  return `/images/${img}`
}

export function PostCard({ post }: PostCardProps) {
  const imageSrc = resolveImageSrc(post);

  return (
    <Link href={`/news/${post.slug}`} className="group block">
      <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md h-full flex flex-col">
        {/* Featured image */}
        <div className="relative aspect-video overflow-hidden bg-primary-subtle">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={decodeEntities(post.title)}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary-muted">
              <svg
                className="h-12 w-12 text-primary/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          {/* Category + date */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                categoryColors[post.category] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {categoryLabels[post.category] ?? post.category}
            </span>
            <time
              dateTime={post.date}
              className="text-xs text-muted-foreground shrink-0"
            >
              {formatDate(post.date)}
            </time>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {decodeEntities(post.title)}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* CTA */}
          <div className="mt-auto pt-2">
            <span className="text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
              Read More →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
