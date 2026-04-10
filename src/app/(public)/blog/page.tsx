import type { Metadata } from "next";
import { getBlogPosts, getBlocksForPage } from "@/lib/data";
import { getHeroContent } from "@/lib/blocks";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { PostCard } from "@/components/shared/post-card";

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Blog | GAPHTO",
  description:
    "Insights, opinions, and perspectives from GAPHTO members and public health professionals.",
};

export default async function BlogPage() {
  const [posts, blocks] = await Promise.all([
    Promise.resolve(getBlogPosts()),
    getBlocksForPage('blog'),
  ])

  const hero = getHeroContent(blocks, {
    title: 'Blog',
    label: 'Insights & Opinions',
    subtitle: 'Perspectives from GAPHTO members and public health professionals across Ghana.',
  })

  return (
    <>
      <InnerPageHero
        title={hero.title}
        label={hero.label}
        subtitle={hero.subtitle}
        heroImage={hero.heroImage}
        centered={hero.centered !== false}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg">No blog posts yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
