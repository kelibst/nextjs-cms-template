import type { Metadata } from "next";
import { getGallery, getBlocksForPage } from "@/lib/data";
import { getHeroContent } from "@/lib/blocks";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { BlockRenderer, type BlockDataSources } from "@/components/shared/block-renderer";
import { GalleryClient } from "./gallery-client";

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photo gallery from GAPHTO events and activities.",
};

export default async function GalleryPage() {
  const [albums, blocks] = await Promise.all([
    Promise.resolve(getGallery()),
    getBlocksForPage('gallery'),
  ])

  const hero = getHeroContent(blocks, {
    title: 'Photo Gallery',
    label: 'Visual Stories',
    subtitle: 'Moments captured from GAPHTO events and activities.',
  })

  const contentBlocks = blocks.filter(b => b.type !== 'hero')
  const dataSources: BlockDataSources = { albums }

  return (
    <>
      <InnerPageHero
        title={hero.title}
        label={hero.label}
        subtitle={hero.subtitle}
        heroImage={hero.heroImage}
        centered={hero.centered !== false}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      {contentBlocks.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
          {contentBlocks.map(block => (
            <BlockRenderer key={block.id} block={block} dataSources={dataSources} pageContext="subpage" />
          ))}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <GalleryClient albums={albums} />
      </div>
    </>
  );
}
