// Block content type definitions

export type HeroContent = {
  title: string
  subtitle: string
  label?: string       // Badge text above title (e.g. "Our Story", "Stay Informed")
  heroImage?: string   // Optional full-bleed background image URL
  centered?: boolean   // Center-align layout (default true)
  template?: 'carousel' | 'centered' | 'split' | 'bold'  // Hero design template (default: 'carousel')
}

/** Extract and parse the hero block from a block list, returning defaults if not found */
export function getHeroContent(
  blocks: Array<{ type: string; content: string; isVisible: boolean }>,
  defaults: HeroContent
): HeroContent {
  const block = blocks.find((b) => b.type === 'hero' && b.isVisible)
  if (!block) return defaults
  return parseBlockContent<HeroContent>(block.content, defaults)
}

export type StatsBarContent = {
  items: { count: string; suffix: string; label: string }[]
}

export type RichTextContent = {
  heading?: string
  body: string
  variant?: 'generic' | 'background' | 'vision_mission'
  vision?: string   // used only when variant = 'vision_mission'
  mission?: string  // used only when variant = 'vision_mission'
}

export type ObjectivesContent = {
  heading: string
  items: string[]
}

export type TimelineContent = {
  heading: string
  items: { year: string; title: string; description: string }[]
}

export type FeaturesGridContent = {
  heading: string
  items: { title: string; description: string }[]
}

export type NewsPreviewContent = { heading: string; count: number }
export type EventsPreviewContent = { heading: string; count: number }
export type LeadershipPreviewContent = { heading: string; count: number }
export type GalleryTeaserContent = {
  heading: string
  count?: number              // max photos to show (default 6)
  selectedAlbumSlugs?: string[] // empty/undefined = show from all albums
}
export type CtaSectionContent = {
  heading: string
  subtitle: string
  buttonText: string          // Primary CTA button label
  buttonHref?: string         // CTA button URL (default '/register')
}
export type ImageBannerContent = { imageUrl: string; alt: string; caption?: string }

export type AboutPreviewContent = {
  heading?: string
  imageUrl?: string    // custom image; falls back to gallery if blank
  imageAlt?: string
  linkText?: string    // CTA link label (default: "Learn More About Us")
  linkHref?: string    // CTA link destination (default: "/about")
}

export type BlockContent =
  | HeroContent | StatsBarContent | RichTextContent | ObjectivesContent
  | TimelineContent | FeaturesGridContent | NewsPreviewContent | EventsPreviewContent
  | LeadershipPreviewContent | GalleryTeaserContent | CtaSectionContent | ImageBannerContent
  | AboutPreviewContent

// Parse block content JSON safely
export function parseBlockContent<T>(contentJson: string, fallback: T): T {
  try {
    const parsed = JSON.parse(contentJson)
    return parsed as T
  } catch {
    return fallback
  }
}
