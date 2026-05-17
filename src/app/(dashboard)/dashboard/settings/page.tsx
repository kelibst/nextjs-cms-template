import { db } from '@/lib/db'
import { siteSettings } from '../../../../../drizzle/schema'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/dashboard/settings-form'

export const dynamic = 'force-dynamic'

const SETTING_KEYS = [
  'org_name', 'tagline', 'site_description', 'copyright_text', 'logo_url',
  'contact_email', 'contact_phone', 'contact_address',
  'social_facebook', 'social_twitter', 'social_youtube',
  'theme_primary', 'theme_accent',
  'auth_layout_style', 'auth_bg_image_url',
  'seo_title', 'seo_description', 'seo_keywords', 'seo_default_image', 'allow_search_indexing',
]

export default async function SettingsPage() {
  const session = await auth()
  if (session?.user.role !== 'super_admin') redirect('/dashboard')

  const rows = await db.select().from(siteSettings)
  const settings: Record<string, string> = {}
  for (const key of SETTING_KEYS) {
    settings[key] = rows.find((r) => r.key === key)?.value ?? ''
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Site Settings</h1>
        <p className="text-sm text-muted-foreground">Organisation-wide configuration</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
}
