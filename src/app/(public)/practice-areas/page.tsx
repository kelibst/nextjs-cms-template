import type { Metadata } from "next";
import { getPracticeAreas, decodeEntities } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Areas of Practice",
  description:
    "GAPHTO members work in three key areas of public health: Disease Control & Prevention, Health Information Management, and Nutrition.",
};

const ICONS: Record<string, React.ReactNode> = {
  "disease-control-prevention": (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  "health-information-management": (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  nutrition: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

export default function PracticeAreasPage() {
  const areas = getPracticeAreas();

  return (
    <>
      <PageHeader
        title="Areas of Practice"
        subtitle="GAPHTO members serve in three key disciplines of public health in Ghana."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Practice Areas" }]}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {areas.map((area, index) => (
          <section key={area.slug} id={area.slug}>
            <div className="flex items-start gap-5 mb-6">
              {/* Icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                {ICONS[area.slug] ?? (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-muted text-xs font-bold text-primary/80">
                    {index + 1}
                  </span>
                  <h2 className="text-2xl font-bold text-primary/80">
                    {decodeEntities(area.title)}
                  </h2>
                </div>
              </div>
            </div>

            {/* Content */}
            <div
              className="prose prose-green max-w-none"
              dangerouslySetInnerHTML={{ __html: area.content }}
            />

            {/* Roles as badges */}
            {area.roles.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Professional Roles
                </p>
                <div className="flex flex-wrap gap-2">
                  {area.roles.map((role, roleIdx) => (
                    <span
                      key={roleIdx}
                      className="inline-flex items-center rounded-full border border-primary-muted bg-primary-subtle px-3 py-1 text-xs font-medium text-primary/80"
                    >
                      {role.replace(/\.$/, "")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Divider between sections */}
            {index < areas.length - 1 && (
              <div className="mt-12 border-t border-border" />
            )}
          </section>
        ))}
      </div>
    </>
  );
}
