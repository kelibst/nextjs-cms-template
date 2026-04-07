import { getAllPosts, getLeadership, getGalleryAlbums, getEvents, getAbout, getPracticeAreas, getFund, getContentMap } from "@/lib/data";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { StatsBar } from "@/components/home/stats-bar";
import { NewsPreview } from "@/components/home/news-preview";
import { EventsPreview } from "@/components/home/events-preview";
import { PracticeAreas } from "@/components/home/practice-areas";
import { LeadershipPreview } from "@/components/home/leadership-preview";
import { GalleryTeaser } from "@/components/home/gallery-teaser";
import { AboutSection } from "@/components/home/about-section";
import { FundCta } from "@/components/home/fund-cta";
import { auth } from "@/auth";

const HOMEPAGE_KEYS = [
  'homepage.hero.title',
  'homepage.hero.subtitle',
  'homepage.stats.members_count',
  'homepage.stats.members_label',
  'homepage.stats.journals_count',
  'homepage.stats.journals_label',
  'homepage.stats.events_count',
  'homepage.stats.events_label',
  'homepage.stats.years_count',
  'homepage.stats.years_label',
  'homepage.sections.news_title',
  'homepage.sections.events_title',
  'homepage.sections.practice_areas_title',
  'homepage.sections.leadership_title',
  'homepage.sections.gallery_title',
  'homepage.sections.about_title',
  'homepage.sections.fund_cta_title',
  'homepage.sections.fund_cta_subtitle',
]

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const posts = getAllPosts();
  const leaders = getLeadership();
  const albums = getGalleryAlbums();
  const events = getEvents();
  const about = getAbout();
  const practiceAreas = getPracticeAreas();
  const fund = getFund();

  // Fetch editable content from DB (falls back to empty string for missing keys)
  const content = await getContentMap(HOMEPAGE_KEYS);

  // Pick a gallery image for the about section
  const aboutGalleryImg = albums[0]?.images?.[0]?.localPath
    ? `/images/${albums[0].images[0].localPath}`
    : undefined;

  return (
    <>
      {/* 1. Hero Carousel */}
      <HeroCarousel
        posts={posts}
        isLoggedIn={isLoggedIn}
        heroTitle={content['homepage.hero.title'] || undefined}
        heroSubtitle={content['homepage.hero.subtitle'] || undefined}
      />

      {/* 2. Stats Bar */}
      <StatsBar
        membersCount={content['homepage.stats.members_count'] || '500+'}
        membersLabel={content['homepage.stats.members_label'] || 'Members Nationwide'}
        journalsCount={content['homepage.stats.journals_count'] || '42+'}
        journalsLabel={content['homepage.stats.journals_label'] || 'Years Active'}
        eventsCount={content['homepage.stats.events_count'] || '3'}
        eventsLabel={content['homepage.stats.events_label'] || 'Practice Areas'}
        yearsCount={content['homepage.stats.years_count'] || '16'}
        yearsLabel={content['homepage.stats.years_label'] || 'Regions Covered'}
      />

      {/* 3. Latest News */}
      <NewsPreview
        posts={posts}
        heading={content['homepage.sections.news_title'] || 'Latest News'}
      />

      {/* 4. Events & Programs */}
      <EventsPreview
        events={events}
        heading={content['homepage.sections.events_title'] || 'Events & Programs'}
      />

      {/* 5. Practice Areas */}
      <PracticeAreas
        areas={practiceAreas}
        heading={content['homepage.sections.practice_areas_title'] || 'Our Areas of Practice'}
      />

      {/* 6. Leadership Preview */}
      <LeadershipPreview
        leaders={leaders}
        heading={content['homepage.sections.leadership_title'] || 'Our Leadership'}
      />

      {/* 7. Gallery Teaser */}
      <GalleryTeaser
        albums={albums}
        heading={content['homepage.sections.gallery_title'] || 'Gallery'}
      />

      {/* 8. About / Mission */}
      <AboutSection
        about={about}
        galleryImageSrc={aboutGalleryImg}
        heading={content['homepage.sections.about_title'] || 'Building a Healthier Ghana Together'}
      />

      {/* 9. Fund CTA */}
      <FundCta
        pdfUrl={fund.pdfUrl}
        heading={content['homepage.sections.fund_cta_title'] || 'GAPHTO Welfare Fund'}
        subtitle={content['homepage.sections.fund_cta_subtitle'] || 'Supporting our members through financial assistance, welfare loans, and mutual aid. The GAPHTO Welfare Fund exists to strengthen the well-being of every member.'}
      />
    </>
  );
}
