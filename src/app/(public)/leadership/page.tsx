import type { Metadata } from "next";
import { getLeadership } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { LeadershipGrid } from "./leadership-grid";

export const metadata: Metadata = {
  title: "Our Leadership",
  description:
    "Meet the National Executive Committee of the Ghana Association of Public Health Technical Officers.",
};

export default function LeadershipPage() {
  const members = getLeadership();

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
