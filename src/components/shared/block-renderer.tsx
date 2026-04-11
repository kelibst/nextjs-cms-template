import {
  parseBlockContent,
  type HeroContent,
  type StatsBarContent,
  type RichTextContent,
  type NewsPreviewContent,
  type EventsPreviewContent,
  type PracticeAreasContent,
  type LeadershipPreviewContent,
  type GalleryTeaserContent,
  type FundCtaContent,
  type ImageBannerContent,
  type ObjectivesContent,
  type TimelineContent,
} from "@/lib/blocks"
import { sanitizeHtml } from "@/lib/utils"

// Homepage components
import { HeroCarousel } from "@/components/home/hero-carousel"
import { StatsBar } from "@/components/home/stats-bar"
import { NewsPreview } from "@/components/home/news-preview"
import { EventsPreview } from "@/components/home/events-preview"
import { PracticeAreas } from "@/components/home/practice-areas"
import { LeadershipPreview } from "@/components/home/leadership-preview"
import { GalleryTeaser } from "@/components/home/gallery-teaser"
import { AboutSection } from "@/components/home/about-section"
import { FundCta } from "@/components/home/fund-cta"
import { ImageBanner } from "@/components/home/image-banner"

// About-specific section components
import {
  AboutBackground,
  AboutVisionMission,
  AboutObjectives,
  AboutPracticeAreasMini,
  AboutTimeline,
} from "@/components/about/about-block-sections"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlockRow {
  id: string
  type: string
  content: string
  sortOrder: number
  page: string
  isVisible: boolean
  updatedAt: Date
}

export interface BlockDataSources {
  posts?: any[]
  events?: any[]
  leaders?: any[]
  albums?: any[]
  about?: any
  practiceAreas?: any[]
  fund?: any
  isLoggedIn?: boolean
  galleryImageSrc?: string
}

export interface BlockRendererProps {
  block: BlockRow
  dataSources: BlockDataSources
  pageContext: "homepage" | "about" | "subpage"
}

// ─── Homepage block rendering ─────────────────────────────────────────────────

function renderHomepageBlock(block: BlockRow, dataSources: BlockDataSources) {
  switch (block.type) {
    case "hero": {
      const content = parseBlockContent<HeroContent>(block.content, {
        title: "",
        subtitle: "",
      })
      return (
        <HeroCarousel
          posts={dataSources.posts}
          isLoggedIn={dataSources.isLoggedIn}
          heroTitle={content.title || undefined}
          heroSubtitle={content.subtitle || undefined}
        />
      )
    }

    case "stats_bar": {
      const content = parseBlockContent<StatsBarContent>(block.content, {
        items: [],
      })
      return (
        <StatsBar
          membersCount={content.items?.[0]?.count}
          membersLabel={content.items?.[0]?.label}
          journalsCount={content.items?.[1]?.count}
          journalsLabel={content.items?.[1]?.label}
          eventsCount={content.items?.[2]?.count}
          eventsLabel={content.items?.[2]?.label}
          yearsCount={content.items?.[3]?.count}
          yearsLabel={content.items?.[3]?.label}
        />
      )
    }

    case "news_preview": {
      const content = parseBlockContent<NewsPreviewContent>(block.content, {
        heading: "Latest News",
        count: 3,
      })
      return (
        <NewsPreview posts={dataSources.posts ?? []} heading={content.heading} />
      )
    }

    case "events_preview": {
      const content = parseBlockContent<EventsPreviewContent>(block.content, {
        heading: "Events & Programs",
        count: 4,
      })
      return (
        <EventsPreview
          events={dataSources.events ?? []}
          heading={content.heading}
        />
      )
    }

    case "practice_areas_grid": {
      const content = parseBlockContent<PracticeAreasContent>(block.content, {
        heading: "Our Areas of Practice",
        items: [],
      })
      return (
        <PracticeAreas
          areas={dataSources.practiceAreas ?? []}
          heading={content.heading}
        />
      )
    }

    case "leadership_preview": {
      const content = parseBlockContent<LeadershipPreviewContent>(
        block.content,
        { heading: "Our Leadership", count: 6 }
      )
      return (
        <LeadershipPreview
          leaders={dataSources.leaders ?? []}
          heading={content.heading}
        />
      )
    }

    case "gallery_teaser": {
      const content = parseBlockContent<GalleryTeaserContent>(block.content, {
        heading: "Gallery",
      })
      return (
        <GalleryTeaser
          albums={dataSources.albums ?? []}
          heading={content.heading}
        />
      )
    }

    case "rich_text": {
      const content = parseBlockContent<RichTextContent>(block.content, {
        body: "",
      })
      return (
        <AboutSection
          about={dataSources.about}
          galleryImageSrc={dataSources.galleryImageSrc}
          heading={content.heading || undefined}
        />
      )
    }

    case "fund_cta": {
      const content = parseBlockContent<FundCtaContent>(block.content, {
        heading: "GAPHTO Welfare Fund",
        subtitle: "",
        buttonText: "Learn More",
      })
      return (
        <FundCta
          pdfUrl={dataSources.fund?.pdfUrl}
          heading={content.heading}
          subtitle={content.subtitle}
        />
      )
    }

    case "image_banner": {
      const content = parseBlockContent<ImageBannerContent>(block.content, {
        imageUrl: "",
        alt: "",
      })
      return (
        <ImageBanner
          imageUrl={content.imageUrl}
          alt={content.alt}
          caption={content.caption}
        />
      )
    }

    default:
      return null
  }
}

// ─── About page block rendering ───────────────────────────────────────────────

function renderAboutBlock(block: BlockRow, dataSources: BlockDataSources) {
  switch (block.type) {
    // Hero is handled separately outside BlockRenderer by the about page
    case "hero":
      return null

    case "rich_text": {
      const content = parseBlockContent<RichTextContent>(block.content, {
        body: "",
      })

      if (content.heading === "Background") {
        return <AboutBackground body={content.body} />
      }

      if (content.heading === "Vision & Mission") {
        return <AboutVisionMission body={content.body} />
      }

      // Generic rich_text: render heading + prose body
      return (
        <section>
          {content.heading && (
            <h2 className="mb-4 text-2xl font-bold text-primary">
              {content.heading}
            </h2>
          )}
          <div
            className="prose prose-green max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.body) }}
          />
        </section>
      )
    }

    case "objectives_list": {
      const content = parseBlockContent<ObjectivesContent>(block.content, {
        heading: "Aims & Objectives",
        items: [],
      })
      return (
        <AboutObjectives items={content.items} heading={content.heading} />
      )
    }

    case "practice_areas_grid": {
      const content = parseBlockContent<PracticeAreasContent>(block.content, {
        heading: "Areas of Practice",
        items: [],
      })
      return (
        <AboutPracticeAreasMini
          items={content.items}
          heading={content.heading}
        />
      )
    }

    case "timeline": {
      const content = parseBlockContent<TimelineContent>(block.content, {
        heading: "Our History",
        items: [],
      })
      return <AboutTimeline items={content.items} heading={content.heading} />
    }

    case "stats_bar": {
      // Re-use same StatsBar rendering as homepage
      const content = parseBlockContent<StatsBarContent>(block.content, {
        items: [],
      })
      return (
        <StatsBar
          membersCount={content.items?.[0]?.count}
          membersLabel={content.items?.[0]?.label}
          journalsCount={content.items?.[1]?.count}
          journalsLabel={content.items?.[1]?.label}
          eventsCount={content.items?.[2]?.count}
          eventsLabel={content.items?.[2]?.label}
          yearsCount={content.items?.[3]?.count}
          yearsLabel={content.items?.[3]?.label}
        />
      )
    }

    // Fall through: render using homepage dispatch for any other types
    default:
      return renderHomepageBlock(block, dataSources)
  }
}

// ─── Subpage block rendering ─────────────────────────────────────────────────

function renderSubpageBlock(block: BlockRow, dataSources: BlockDataSources) {
  // Hero is handled externally via InnerPageHero on all subpages
  if (block.type === "hero") return null

  // All other block types delegate to the homepage renderer
  return renderHomepageBlock(block, dataSources)
}

// ─── Main BlockRenderer component ─────────────────────────────────────────────

export function BlockRenderer({
  block,
  dataSources,
  pageContext,
}: BlockRendererProps) {
  if (!block.isVisible) return null

  const rendered =
    pageContext === "about"
      ? renderAboutBlock(block, dataSources)
      : pageContext === "subpage"
      ? renderSubpageBlock(block, dataSources)
      : renderHomepageBlock(block, dataSources)

  if (!rendered) return null

  return <div key={block.id}>{rendered}</div>
}
