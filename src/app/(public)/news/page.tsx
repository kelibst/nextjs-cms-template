export const dynamic = 'force-dynamic'

import type { Metadata } from "next";
import { getPublicPosts } from "@/lib/server-data";
import { getBlocksForPage } from "@/lib/data";
import { getHeroContent } from "@/lib/blocks";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <NewsClient posts={posts} />
      </div>
    </>
  );
}
