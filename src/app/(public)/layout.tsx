import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getNavLinks } from '@/app/actions/navigation'
import { getSiteSettings } from '@/lib/site-settings'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let navLinks: { label: string; href: string; openInNewTab?: boolean }[] | undefined
  try {
    const fetched = await getNavLinks()
    if (fetched.length > 0) navLinks = fetched
  } catch {
    // navLinks stays undefined → header/footer use their own fallbacks
  }

  const settings = await getSiteSettings()

  return (
    <>
      <Header navLinks={navLinks} settings={settings} />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer navLinks={navLinks} settings={settings} />
    </>
  )
}
