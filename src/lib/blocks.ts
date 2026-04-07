// Block content type definitions

export type HeroContent = {
  title: string
  subtitle: string
  imageUrl?: string
}

export type StatsBarContent = {
  items: { count: string; suffix: string; label: string }[]
}

export type RichTextContent = {
  heading?: string
  body: string
}

export type ObjectivesContent = {
  heading: string
  items: string[]
}

export type TimelineContent = {
  heading: string
  items: { year: string; title: string; description: string }[]
}

export type PracticeAreasContent = {
  heading: string
  items: { title: string; description: string }[]
}

export type NewsPreviewContent = { heading: string; count: number }
export type EventsPreviewContent = { heading: string; count: number }
export type LeadershipPreviewContent = { heading: string; count: number }
export type GalleryTeaserContent = { heading: string }
export type FundCtaContent = { heading: string; subtitle: string; buttonText: string }
export type ImageBannerContent = { imageUrl: string; alt: string; caption?: string }

export type BlockContent =
  | HeroContent | StatsBarContent | RichTextContent | ObjectivesContent
  | TimelineContent | PracticeAreasContent | NewsPreviewContent | EventsPreviewContent
  | LeadershipPreviewContent | GalleryTeaserContent | FundCtaContent | ImageBannerContent

// Parse block content JSON safely
export function parseBlockContent<T>(contentJson: string, fallback: T): T {
  try {
    const parsed = JSON.parse(contentJson)
    return parsed as T
  } catch {
    return fallback
  }
}
