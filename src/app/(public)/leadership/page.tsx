import type { Metadata } from "next";
import { db } from "@/lib/db";
import { leadership } from "../../../../drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { getBlocksForPage } from "@/lib/data";
import { getHeroContent } from "@/lib/blocks";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { LeadershipGrid } from "./leadership-grid";

export const metadata: Metadata = {
  title: "Our Leadership",
  description:
    "Meet the National Executive Committee of the Ghana Association of Public Health Technical Officers.",
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
    subtitle: 'Meet the dedicated officers guiding GAPHTO\'s mission across Ghana.',
  })

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
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LeadershipGrid members={members} />
      </div>
    </>
  );
}
