import { sanitizeHtml } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { getAbout, getContentMap } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "About GAPHTO",
  description:
    "Learn about the Ghana Association of Public Health Technical Officers — our history, vision, mission, and objectives.",
};

// ─── Default data (fallbacks when DB has no value) ───────────────────────────

const TIMELINE_DEFAULTS = [
  { year: "1984", title: "Association Founded", description: "Association founded for Disease Control Officers and Field Technicians." },
  { year: "2006", title: "Official Inauguration", description: "Officially inaugurated at Korle-Bu, Accra as PUHTOG." },
  { year: "2009", title: "Renamed GAPHTO", description: "Re-named Ghana Association of Public Health Technical Officers (GAPHTO) at Cape Coast Conference." },
  { year: "Present", title: "Continuing the Mission", description: "Continues to advocate for public health professionals across Ghana." },
]

const PRACTICE_AREAS_DEFAULTS = [
  {
    title: "Disease Control & Prevention",
    description: "Protecting communities through surveillance, response, and health promotion.",
  },
  {
    title: "Health Information Management",
    description: "Providing reliable, timely health data to support decision-making.",
  },
  {
    title: "Nutrition",
    description: "Advancing nutritional science and health outcomes across communities.",
  },
]

const OBJECTIVES_DEFAULTS = [
  "a) To bring all Disease control officers, Nutrition officers, Health Information officers and Field Technicians in public, Christian Health Association of Ghana (CHAG), Non – Governmental Organisations (NGOs) and private institutions in Ghana and beyond into a unified professional association",
  "b) To develop and recommend appropriate public health strategies to Ghana Health Service",
  "c) To cooperate with GHS/MoH in the promotion of public health practice in Ghana",
  "d) To promote the welfare of members and secure equitable and attractive conditions of service to retain them in the profession",
  "e) To conduct health systems research to enhance public health care in Ghana",
  "f) To network and collaborate with recognised stakeholders in public health care delivery locally and globally.",
]

const ABOUT_KEYS = [
  'about.background',
  'about.vision',
  'about.mission',
  'about.objectives',
  'about.timeline',
  'about.practice_areas',
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
  const content = await getContentMap(ABOUT_KEYS);

  // Background, vision, mission — fallback to JSON data
  const background = content['about.background'] || about.background
  const vision = content['about.vision'] || about.vision
  const mission = content['about.mission'] || about.mission

  // Objectives — stored as JSON string array in DB
  const objectives = (() => {
    try {
      const parsed = JSON.parse(content['about.objectives'] || '')
      return Array.isArray(parsed) ? parsed as string[] : OBJECTIVES_DEFAULTS
    } catch {
      return about.objectives.length > 0 ? about.objectives : OBJECTIVES_DEFAULTS
    }
  })()

  // Timeline — stored as JSON string: {year, title, description}[]
  const timeline = (() => {
    try {
      const parsed = JSON.parse(content['about.timeline'] || '')
      return Array.isArray(parsed) ? parsed as { year: string; title: string; description: string }[] : TIMELINE_DEFAULTS
    } catch {
      return TIMELINE_DEFAULTS
    }
  })()

  // Practice areas for about page — stored as JSON string: {title, description}[]
  const practiceAreas = (() => {
    try {
      const parsed = JSON.parse(content['about.practice_areas'] || '')
      return Array.isArray(parsed) ? parsed as { title: string; description: string }[] : PRACTICE_AREAS_DEFAULTS
    } catch {
      return PRACTICE_AREAS_DEFAULTS
    }
  })()

  return (
    <>
      <PageHeader
        title="About GAPHTO"
        subtitle="Ghana Association of Public Health Technical Officers"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* Section 1: Background */}
        <section>
          <h2 className="mb-4 text-2xl font-bold text-primary">Our Background</h2>
          <div
            className="prose prose-green max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(background) }}
          />
        </section>

        {/* Section 2: Vision & Mission */}
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
              <p className="text-foreground/80 leading-relaxed">{vision}</p>
            </div>

            {/* Mission */}
            <div className="rounded-xl border border-primary-muted bg-primary-subtle p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-muted text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-primary/80">Our Mission</h3>
              <p className="text-foreground/80 leading-relaxed">{mission}</p>
            </div>
          </div>
        </section>

        {/* Section 3: Objectives */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-primary">Aims &amp; Objectives</h2>
          <div className="space-y-4">
            {objectives.map((objective, index) => (
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

        {/* Section 4: Practice Areas mini-overview */}
        <section>
          <h2 className="mb-2 text-2xl font-bold text-primary">Areas of Practice</h2>
          <p className="mb-6 text-muted-foreground">
            GAPHTO members work across three key areas of public health.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {practiceAreas.map((area, index) => (
              <Link
                key={area.title}
                href="/practice-areas"
                className="group rounded-xl border border-border bg-card p-5 shadow-sm hover:border-primary hover:shadow-md transition-all"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {PRACTICE_AREA_ICONS[index % PRACTICE_AREA_ICONS.length]}
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {area.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {area.description}
                </p>
                <span className="mt-3 inline-block text-xs font-medium text-primary">
                  Learn more →
                </span>
              </Link>
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
              {timeline.map((item, index) => (
                <div key={index} className="relative flex gap-6 pl-12">
                  {/* Dot */}
                  <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-primary">{item.year}</span>
                    <p className="mt-0.5 text-sm text-foreground">
                      {item.description || (item as unknown as { event?: string }).event || ''}
                    </p>
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
