export const dynamic = 'force-dynamic'

import { sanitizeHtml } from "@/lib/utils";
import type { Metadata } from "next";
import { getAbout, getBlocksForPage } from "@/lib/data";
import { getHeroContent } from "@/lib/blocks";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { BlockRenderer, type BlockDataSources } from "@/components/shared/block-renderer";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about our organisation — our history, vision, mission, and objectives.",
};

// ─── Default data (used only in legacy fallback) ─────────────────────────────

const TIMELINE_DEFAULTS = [
  { year: "2010", title: "Organisation Founded", description: "Founded to bring professionals together under a unified platform." },
  { year: "2015", title: "Growth & Expansion", description: "Expanded membership and launched key programmes for professional development." },
  { year: "2020", title: "Digital Transformation", description: "Moved to a digital-first platform for member management and communications." },
  { year: "Present", title: "Continuing the Mission", description: "Continuing to serve members and the wider community with excellence." },
]

const FOCUS_AREAS_DEFAULTS = [
  {
    title: "Professional Development",
    description: "Supporting members with training, resources, and continuing education opportunities.",
  },
  {
    title: "Community Engagement",
    description: "Connecting members with the communities they serve through outreach and partnerships.",
  },
  {
    title: "Research & Knowledge",
    description: "Advancing best practices through research, publications, and knowledge sharing.",
  },
]

// SVG icons for practice area cards
const PRACTICE_AREA_ICONS = [
  (
    <svg key="icon-0" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  (
    <svg key="icon-1" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  (
    <svg key="icon-2" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
]

export default async function AboutPage() {
  const about = getAbout();

  // Fetch page blocks from DB (filtered to visible, sorted by sortOrder)
  const aboutBlocks = await getBlocksForPage('about');

  // ── Dynamic block rendering ──────────────────────────────────────────────────
  if (aboutBlocks.length > 0) {
    const heroContent = getHeroContent(aboutBlocks, {
      title: 'About Our Organisation',
      label: 'Our Story',
      subtitle: 'Learn more about who we are and what we do.',
    })

    const contentBlocks = aboutBlocks.filter(b => b.type !== 'hero')

    const dataSources: BlockDataSources = { about }

    return (
      <>
        <InnerPageHero
          title={heroContent.title}
          label={heroContent.label}
          subtitle={heroContent.subtitle}
          heroImage={heroContent.heroImage}
          centered={heroContent.centered !== false}
          template={heroContent.template}
          breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
        />
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
          {contentBlocks.map(block => (
            <BlockRenderer key={block.id} block={block} dataSources={dataSources} pageContext="about" />
          ))}
        </div>
      </>
    )
  }

  // ── Fallback: no blocks in DB — render legacy hardcoded layout ─────────────
  return (
    <>
      <InnerPageHero
        title="About Our Organisation"
        label="Our Story"
        subtitle="Learn more about who we are and what we do."
        centered
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* Section 1: Background */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-primary">Our Background</h2>
          <div
            className="prose prose-green max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(about.background) }}
          />
        </section>

        {/* Section 2: Vision & Mission — separate cards from JSON fallback */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-primary">Vision &amp; Mission</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Vision */}
            <div className="rounded-xl border border-primary-muted bg-primary-subtle p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-muted text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-primary/80">Our Vision</h3>
              <p className="text-foreground/80 leading-relaxed">{about.vision}</p>
            </div>

            {/* Mission */}
            <div className="rounded-xl border border-primary-muted bg-primary-subtle p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-muted text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-primary/80">Our Mission</h3>
              <p className="text-foreground/80 leading-relaxed">{about.mission}</p>
            </div>
          </div>
        </section>

        {/* Section 3: Objectives */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-primary">Aims &amp; Objectives</h2>
          <div className="space-y-4">
            {(about.objectives.length > 0 ? about.objectives : [
              "To bring professionals together under a unified association that advances their interests and capabilities.",
              "To develop and share best practices and professional standards across the sector.",
              "To promote the welfare of members and secure equitable conditions of service.",
              "To conduct research and produce knowledge resources that benefit members and the wider community.",
              "To network and collaborate with recognised stakeholders locally and globally.",
            ]).map((objective, index) => (
              <div
                key={index}
                className="flex gap-4 rounded-lg border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-foreground pt-1">{objective}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Focus Areas mini-overview */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-primary">Our Focus Areas</h2>
          <p className="mb-6 text-muted-foreground">
            Our team delivers across key focus areas.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {FOCUS_AREAS_DEFAULTS.map((area, index) => (
              <div
                key={area.title}
                className="group rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted text-primary">
                  {PRACTICE_AREA_ICONS[index % PRACTICE_AREA_ICONS.length]}
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {area.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-primary">Our History</h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary-muted" />

            <div className="space-y-8">
              {TIMELINE_DEFAULTS.map((item, index) => (
                <div key={index} className="relative flex gap-6 pl-12">
                  {/* Dot */}
                  <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-primary">{item.year}</span>
                    <p className="mt-0.5 text-sm text-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
