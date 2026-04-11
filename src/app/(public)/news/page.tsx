export const dynamic = 'force-dynamic'

import type { Metadata } from "next";
import { getPublicPosts } from "@/lib/server-data";
import { getBlocksForPage } from "@/lib/data";
import { getHeroContent } from "@/lib/blocks";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { BlockRenderer, type BlockDataSources } from "@/components/shared/block-renderer";
import { NewsClient } from "./news-client";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "Stay up to date with the latest news, health updates, and blog posts from GAPHTO.",
};

export default async function NewsPage() {
  const [posts, blocks] = await Promise.all([
    getPublicPosts(),
    getBlocksForPage('news'),
  ])

  const hero = getHeroContent(blocks, {
    title: 'News & Updates',
    label: 'Stay Informed',
    subtitle: 'Stay informed with the latest from GAPHTO, health news, and our blog.',
  })

  const contentBlocks = blocks.filter(b => b.type !== 'hero')
  const dataSources: BlockDataSources = { posts }

  return (
    <>
      <InnerPageHero
        title={hero.title}
        label={hero.label}
        subtitle={hero.subtitle}
        heroImage={hero.heroImage}
        centered={hero.centered !== false}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "News" }]}
      />

      {contentBlocks.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
          {contentBlocks.map(block => (
            <BlockRenderer key={block.id} block={block} dataSources={dataSources} pageContext="subpage" />
          ))}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <NewsClient posts={posts} />
      </div>
    </>
  );
}
