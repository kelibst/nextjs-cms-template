import type { Metadata } from "next";
import { db } from "@/lib/db";
import { leadership } from "../../../../drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { getBlocksForPage } from "@/lib/data";
import { getHeroContent } from "@/lib/blocks";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { BlockRenderer, type BlockDataSources } from "@/components/shared/block-renderer";
import { LeadershipGrid } from "./leadership-grid";

export const metadata: Metadata = {
  title: "Our Leadership",
  description:
    "Meet the team guiding our organisation forward.",
};

export const dynamic = "force-dynamic";

export default async function LeadershipPage() {
  const [members, blocks] = await Promise.all([
    db.select().from(leadership).where(eq(leadership.isActive, true)).orderBy(asc(leadership.sortOrder)),
    getBlocksForPage('leadership'),
  ])

  const hero = getHeroContent(blocks, {
    title: 'Our Leadership',
    label: 'National Executive Committee',
    subtitle: 'Meet the dedicated team steering our organisation forward.',
  })

  const contentBlocks = blocks.filter(b => b.type !== 'hero')
  const dataSources: BlockDataSources = { leaders: members }

  return (
    <>
      <InnerPageHero
        title={hero.title}
        label={hero.label}
        subtitle={hero.subtitle}
        heroImage={hero.heroImage}
        centered={hero.centered !== false}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Leadership" }]}
      />

      {contentBlocks.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
          {contentBlocks.map(block => (
            <BlockRenderer key={block.id} block={block} dataSources={dataSources} pageContext="subpage" />
          ))}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LeadershipGrid members={members} />
      </div>
    </>
  );
}
