"use client";

import { useState, useMemo } from "react";
import { PostCard } from "@/components/shared/post-card";
import type { Post } from "@/lib/data";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "news", label: "News" },
  { id: "blog", label: "Blog" },
  { id: "announcement", label: "Announcements" },
] as const;

const PAGE_SIZE = 9;

interface NewsClientProps {
  posts: Post[];
}

export function NewsClient({ posts }: NewsClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function handleCategoryChange(id: string) {
    setActiveCategory(id);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div>
      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground/80 border-border hover:border-primary hover:text-primary"
            }`}
          >
            {cat.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({cat.id === "all" ? posts.length : posts.filter((p) => p.category === cat.id).length})
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          No posts found in this category.
        </div>
      )}

      {/* Show more */}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="rounded-lg border border-primary px-6 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Load More ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
