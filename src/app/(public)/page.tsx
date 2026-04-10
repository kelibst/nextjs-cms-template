export const dynamic = 'force-dynamic'

import { getAllPosts, getLeadership, getGalleryAlbums, getEvents, getAbout, getPracticeAreas, getFund, getBlocksForPage } from "@/lib/data";
import { parseBlockContent, type HeroContent, type StatsBarContent, type NewsPreviewContent, type EventsPreviewContent, type PracticeAreasContent, type LeadershipPreviewContent, type GalleryTeaserContent, type RichTextContent, type FundCtaContent, type ImageBannerContent } from "@/lib/blocks";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { StatsBar } from "@/components/home/stats-bar";
import { NewsPreview } from "@/components/home/news-preview";
import { EventsPreview } from "@/components/home/events-preview";
import { PracticeAreas } from "@/components/home/practice-areas";
import { LeadershipPreview } from "@/components/home/leadership-preview";
import { GalleryTeaser } from "@/components/home/gallery-teaser";
import { AboutSection } from "@/components/home/about-section";
import { FundCta } from "@/components/home/fund-cta";
import { ImageBanner } from "@/components/home/image-banner";
import { auth } from "@/auth";

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

  // Fetch page blocks from DB (filtered to visible, sorted)
  const homepageBlocks = await getBlocksForPage('homepage');
  const hasBlocks = homepageBlocks.length > 0;

  // Helper to find a block by type
  function getBlock(type: string) {
    return homepageBlocks.find(b => b.type === type);
  }

  // Parse individual block contents (only when blocks exist)
  const heroBlock = hasBlocks ? getBlock('hero') : null;
  const heroContent = heroBlock
    ? parseBlockContent<HeroContent>(heroBlock.content, { title: '', subtitle: '' })
    : null;

  const statsBlock = hasBlocks ? getBlock('stats_bar') : null;
  const statsContent = statsBlock
    ? parseBlockContent<StatsBarContent>(statsBlock.content, { items: [] })
    : null;

  const newsBlock = hasBlocks ? getBlock('news_preview') : null;
  const newsContent = newsBlock
    ? parseBlockContent<NewsPreviewContent>(newsBlock.content, { heading: 'Latest News', count: 3 })
    : null;

  const eventsBlock = hasBlocks ? getBlock('events_preview') : null;
  const eventsContent = eventsBlock
    ? parseBlockContent<EventsPreviewContent>(eventsBlock.content, { heading: 'Events & Programs', count: 4 })
    : null;

  const practiceAreasBlock = hasBlocks ? getBlock('practice_areas_grid') : null;
  const practiceAreasContent = practiceAreasBlock
    ? parseBlockContent<PracticeAreasContent>(practiceAreasBlock.content, { heading: 'Our Areas of Practice', items: [] })
    : null;

  const leadershipBlock = hasBlocks ? getBlock('leadership_preview') : null;
  const leadershipContent = leadershipBlock
    ? parseBlockContent<LeadershipPreviewContent>(leadershipBlock.content, { heading: 'Our Leadership', count: 6 })
    : null;

  const galleryBlock = hasBlocks ? getBlock('gallery_teaser') : null;
  const galleryContent = galleryBlock
    ? parseBlockContent<GalleryTeaserContent>(galleryBlock.content, { heading: 'Gallery' })
    : null;

  const aboutBlock = hasBlocks ? getBlock('rich_text') : null;
  const aboutContent = aboutBlock
    ? parseBlockContent<RichTextContent>(aboutBlock.content, { heading: 'Building a Healthier Ghana Together', body: '' })
    : null;

  const fundBlock = hasBlocks ? getBlock('fund_cta') : null;
  const fundContent = fundBlock
    ? parseBlockContent<FundCtaContent>(fundBlock.content, { heading: 'GAPHTO Welfare Fund', subtitle: '', buttonText: 'Learn More' })
    : null;

  // Pick a gallery image for the about section
  const aboutGalleryImg = albums[0]?.images?.[0]?.localPath
    ? `/images/${albums[0].images[0].localPath}`
    : undefined;

  // When blocks exist but a block is missing/invisible, that section is null (hidden).
  // When no blocks at all (empty DB), render all sections with defaults.

  return (
    <>
      {/* 1. Hero Carousel — skip if block exists but was invisible (not in filtered list) */}
      {(!hasBlocks || heroBlock) && (
        <HeroCarousel
          posts={posts}
          isLoggedIn={isLoggedIn}
          heroTitle={heroContent?.title || undefined}
          heroSubtitle={heroContent?.subtitle || undefined}
        />
      )}

      {/* 2. Stats Bar */}
      {(!hasBlocks || statsBlock) && (
        <StatsBar
          membersCount={statsContent?.items?.[0]?.count}
          membersLabel={statsContent?.items?.[0]?.label}
          journalsCount={statsContent?.items?.[1]?.count}
          journalsLabel={statsContent?.items?.[1]?.label}
          eventsCount={statsContent?.items?.[2]?.count}
          eventsLabel={statsContent?.items?.[2]?.label}
          yearsCount={statsContent?.items?.[3]?.count}
          yearsLabel={statsContent?.items?.[3]?.label}
        />
      )}

      {/* 3. Latest News */}
      {(!hasBlocks || newsBlock) && (
        <NewsPreview
          posts={posts}
          heading={newsContent?.heading}
        />
      )}

      {/* 4. Events & Programs */}
      {(!hasBlocks || eventsBlock) && (
        <EventsPreview
          events={events}
          heading={eventsContent?.heading}
        />
      )}

      {/* 5. Practice Areas */}
      {(!hasBlocks || practiceAreasBlock) && (
        <PracticeAreas
          areas={practiceAreas}
          heading={practiceAreasContent?.heading}
        />
      )}

      {/* 6. Leadership Preview */}
      {(!hasBlocks || leadershipBlock) && (
        <LeadershipPreview
          leaders={leaders}
          heading={leadershipContent?.heading}
        />
      )}

      {/* 7. Gallery Teaser */}
      {(!hasBlocks || galleryBlock) && (
        <GalleryTeaser
          albums={albums}
          heading={galleryContent?.heading}
        />
      )}

      {/* 8. About / Mission */}
      {(!hasBlocks || aboutBlock) && (
        <AboutSection
          about={about}
          galleryImageSrc={aboutGalleryImg}
          heading={aboutContent?.heading || undefined}
        />
      )}

      {/* 9. Fund CTA */}
      {(!hasBlocks || fundBlock) && (
        <FundCta
          pdfUrl={fund.pdfUrl}
          heading={fundContent?.heading}
          subtitle={fundContent?.subtitle}
        />
      )}

      {/* 10. Catch-all: image_banner blocks + any rich_text blocks not already handled */}
      {homepageBlocks
        .filter(b => b.type === 'image_banner' || (b.type === 'rich_text' && b.id !== aboutBlock?.id))
        .map(block => {
          if (block.type === 'image_banner') {
            const c = parseBlockContent<ImageBannerContent>(block.content, { imageUrl: '', alt: '' })
            return <ImageBanner key={block.id} imageUrl={c.imageUrl} alt={c.alt} caption={c.caption} />
          }
          if (block.type === 'rich_text') {
            const c = parseBlockContent<RichTextContent>(block.content, { body: '' })
            return (
              <section key={block.id} className="container mx-auto px-4 py-12">
                {c.heading && <h2 className="text-2xl font-bold mb-4">{c.heading}</h2>}
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: c.body }} />
              </section>
            )
          }
          return null
        })
      }
    </>
  );
}
