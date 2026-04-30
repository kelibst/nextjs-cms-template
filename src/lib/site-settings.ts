import { unstable_cache } from 'next/cache'
import { db } from './db'
import { siteSettings } from '../../drizzle/schema'

export type SiteSettings = {
  siteName: string
  tagline: string
  siteDescription: string
  copyrightText: string
  logoUrl: string
  themePrimary: string
  themeAccent: string
  authLayoutStyle: string
  authBgImageUrl: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  socialFacebook: string
  socialTwitter: string
  socialYoutube: string
}

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const rows = await db.select().from(siteSettings)
    const map: Record<string, string> = {}
    for (const row of rows) {
      if (row.key) map[row.key] = row.value ?? ''
    }
    return {
      siteName: map.org_name || process.env.NEXT_PUBLIC_SITE_NAME || 'My CMS',
      tagline: map.tagline || '',
      siteDescription: map.site_description || '',
      copyrightText: map.copyright_text || '',
      logoUrl: map.logo_url || '',
      themePrimary: map.theme_primary || '',
      themeAccent: map.theme_accent || '',
      authLayoutStyle: map.auth_layout_style || 'gradient',
      authBgImageUrl: map.auth_bg_image_url || '',
      contactEmail: map.contact_email || '',
      contactPhone: map.contact_phone || '',
      contactAddress: map.contact_address || '',
      socialFacebook: map.social_facebook || '',
      socialTwitter: map.social_twitter || '',
      socialYoutube: map.social_youtube || '',
    }
  },
  ['site-settings'],
  { revalidate: 3600, tags: ['site-settings'] }
)
