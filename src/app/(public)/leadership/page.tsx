import type { Metadata } from "next";
import { db } from "@/lib/db";
import { leadership } from "../../../../drizzle/schema";
import { asc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/shared/page-header";
import { LeadershipGrid } from "./leadership-grid";

export const metadata: Metadata = {
  title: "Our Leadership",
  description:
    "Meet the National Executive Committee of the Ghana Association of Public Health Technical Officers.",
};

export const dynamic = "force-dynamic";

export default async function LeadershipPage() {
  const members = await db
    .select()
    .from(leadership)
    .where(eq(leadership.isActive, true))
    .orderBy(asc(leadership.sortOrder));

  return (
    <>
      <PageHeader
        title="Our Leadership"
        subtitle="National Executive Committee"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Leadership" }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LeadershipGrid members={members} />
      </div>
    </>
  );
}
