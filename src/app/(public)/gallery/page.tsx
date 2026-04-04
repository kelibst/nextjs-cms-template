import type { Metadata } from "next";
import { getGallery } from "@/lib/data";
import { PageHeader } from "@/components/shared/page-header";
import { GalleryClient } from "./gallery-client";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photo gallery from GAPHTO events and activities.",
};

export default function GalleryPage() {
  const albums = getGallery();

  return (
    <>
      <PageHeader
        title="Photo Gallery"
        subtitle="Moments captured from GAPHTO events and activities."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <GalleryClient albums={albums} />
      </div>
    </>
  );
}
