import type { Metadata } from "next";
import { getAllPosts } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { NewsClient } from "./news-client";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "Stay up to date with the latest news, health updates, and blog posts from GAPHTO.",
};

export default function NewsPage() {
  const posts = getAllPosts();

  return (
    <>
      <PageHeader
        title="News & Updates"
        subtitle="Stay informed with the latest from GAPHTO, health news, and our blog."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "News" }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <NewsClient posts={posts} />
      </div>
    </>
  );
}
