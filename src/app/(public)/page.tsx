export const dynamic = 'force-dynamic'

import { getAllPosts, getGalleryAlbums, getEvents, getAbout, getBlocksForPage } from "@/lib/data";
import { getLeadershipFromDb } from "@/lib/server-data";
import { getMediaUrl } from "@/lib/media-url";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { StatsBar } from "@/components/home/stats-bar";
import { NewsPreview } from "@/components/home/news-preview";
import { EventsPreview } from "@/components/home/events-preview";
import { FeaturesGrid } from "@/components/home/features-grid";
import { LeadershipPreview } from "@/components/home/leadership-preview";
import { GalleryTeaser } from "@/components/home/gallery-teaser";
import { AboutSection } from "@/components/home/about-section";
import { CtaSection } from "@/components/home/cta-section";
import { BlockRenderer, type BlockDataSources } from "@/components/shared/block-renderer";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const posts = getAllPosts();
  const leaders = await getLeadershipFromDb();
  const albums = getGalleryAlbums();
  const events = getEvents();
  const about = getAbout();

  // Fetch page blocks from DB (filtered to visible, sorted)
  const homepageBlocks = await getBlocksForPage('homepage');

  // Pick a gallery image for the about section
  const aboutGalleryImg = albums[0]?.images?.[0]
    ? getMediaUrl(albums[0].images[0].localPath || albums[0].images[0].url)
    : undefined;

  // ── Dynamic block rendering ──────────────────────────────────────────────────
  if (homepageBlocks.length > 0) {
    const dataSources: BlockDataSources = {
      posts,
      events,
      leaders,
      albums,
      about,
      isLoggedIn,
      galleryImageSrc: aboutGalleryImg,
    }

    return (
      <>
        {homepageBlocks.map(block => (
          <BlockRenderer key={block.id} block={block} dataSources={dataSources} pageContext="homepage" />
        ))}
      </>
    )
  }

  // ── Fallback: no blocks in DB — render hardcoded layout with defaults ──────
  return (
    <>
      {/* 1. Hero Carousel */}
      <HeroCarousel
        posts={posts}
        isLoggedIn={isLoggedIn}
      />

      {/* 2. Stats Bar */}
      <StatsBar />

      {/* 3. Latest News */}
      <NewsPreview posts={posts} />

      {/* 4. Events & Programs */}
      <EventsPreview events={events} />

      {/* 5. Features Grid */}
      <FeaturesGrid areas={[]} />

      {/* 6. Leadership Preview */}
      <LeadershipPreview leaders={leaders} />

      {/* 7. Gallery Teaser */}
      <GalleryTeaser albums={albums} />

      {/* 8. About / Mission */}
      <AboutSection
        about={about}
        galleryImageSrc={aboutGalleryImg}
      />

      {/* 9. CTA Section */}
      <CtaSection />
    </>
  );
}
