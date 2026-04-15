import type { Metadata } from "next";
import { getBlogPosts, getBlocksForPage } from "@/lib/data";
import { getHeroContent } from "@/lib/blocks";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { BlockRenderer, type BlockDataSources } from "@/components/shared/block-renderer";
import { PostCard } from "@/components/shared/post-card";

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights, opinions, and perspectives from our community.",
};

export default async function BlogPage() {
  const [posts, blocks] = await Promise.all([
    Promise.resolve(getBlogPosts()),
    getBlocksForPage('blog'),
  ])

  const hero = getHeroContent(blocks, {
    title: 'Blog',
    label: 'Insights & Opinions',
    subtitle: 'Insights and perspectives from our community.',
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
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      {contentBlocks.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
          {contentBlocks.map(block => (
            <BlockRenderer key={block.id} block={block} dataSources={dataSources} pageContext="subpage" />
          ))}
        </div>
      )}

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
