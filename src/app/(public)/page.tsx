import { getAllPosts, getLeadership, getGalleryAlbums, getEvents, getAbout, getPracticeAreas, getFund } from "@/lib/data";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { StatsBar } from "@/components/home/stats-bar";
import { NewsPreview } from "@/components/home/news-preview";
import { EventsPreview } from "@/components/home/events-preview";
import { PracticeAreas } from "@/components/home/practice-areas";
import { LeadershipPreview } from "@/components/home/leadership-preview";
import { GalleryTeaser } from "@/components/home/gallery-teaser";
import { AboutSection } from "@/components/home/about-section";
import { FundCta } from "@/components/home/fund-cta";

export default function Home() {
  const posts = getAllPosts();
  const leaders = getLeadership();
  const albums = getGalleryAlbums();
  const events = getEvents();
  const about = getAbout();
  const practiceAreas = getPracticeAreas();
  const fund = getFund();

  // Pick a gallery image for the about section
  const aboutGalleryImg = albums[0]?.images?.[0]?.localPath
    ? `/images/${albums[0].images[0].localPath}`
    : undefined;

  return (
    <>
      {/* 1. Hero Carousel */}
      <HeroCarousel posts={posts} />

      {/* 2. Stats Bar */}
      <StatsBar />

      {/* 3. Latest News */}
      <NewsPreview posts={posts} />

      {/* 4. Events & Programs */}
      <EventsPreview events={events} />

      {/* 5. Practice Areas */}
      <PracticeAreas areas={practiceAreas} />

      {/* 6. Leadership Preview */}
      <LeadershipPreview leaders={leaders} />

      {/* 7. Gallery Teaser */}
      <GalleryTeaser albums={albums} />

      {/* 8. About / Mission */}
      <AboutSection about={about} galleryImageSrc={aboutGalleryImg} />

      {/* 9. Fund CTA */}
      <FundCta pdfUrl={fund.pdfUrl} />
    </>
  );
}
