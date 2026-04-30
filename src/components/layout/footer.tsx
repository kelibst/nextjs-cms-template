import Link from 'next/link'
import { Mail, MapPin } from 'lucide-react'
import Logo from './Logo'
import type { SiteSettings } from '@/lib/site-settings'

const fallbackQuickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'News', href: '/news' },
  { label: 'Leadership', href: '/leadership' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
]

interface FooterProps {
  navLinks?: { label: string; href: string; openInNewTab?: boolean }[]
  settings?: SiteSettings
}

export function Footer({ navLinks = fallbackQuickLinks, settings }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const siteName = settings?.siteName || process.env.NEXT_PUBLIC_SITE_NAME || 'My CMS'
  const description = settings?.siteDescription || 'A modern CMS and membership platform template for organisations of any size.'
  const copyright = settings?.copyrightText || `© ${currentYear} ${siteName}. All rights reserved.`
  const contactEmail = settings?.contactEmail || ''
  const contactAddress = settings?.contactAddress || ''
  const fbUrl = settings?.socialFacebook || ''
  const twUrl = settings?.socialTwitter || ''
  const ytUrl = settings?.socialYoutube || ''

  return (
    <footer className="bg-primary-deep text-white/90">
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo + About */}
          <div>
            <Logo variant="dark" logoUrl={settings?.logoUrl} siteName={siteName} />
            <p className="text-sm text-white/70 leading-relaxed mb-4 mt-3">
              {description}
            </p>
            <div className="flex items-center gap-3 mt-4">
              {/* Facebook */}
              <a
                href={fbUrl || '#'}
                aria-label="Facebook"
                className="text-white/70 hover:text-white transition-colors"
                target={fbUrl ? '_blank' : undefined}
                rel={fbUrl ? 'noopener noreferrer' : undefined}
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              {/* X / Twitter */}
              <a
                href={twUrl || '#'}
                aria-label="X (Twitter)"
                className="text-white/70 hover:text-white transition-colors"
                target={twUrl ? '_blank' : undefined}
                rel={twUrl ? 'noopener noreferrer' : undefined}
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a
                href={ytUrl || '#'}
                aria-label="YouTube"
                className="text-white/70 hover:text-white transition-colors"
                target={ytUrl ? '_blank' : undefined}
                rel={ytUrl ? 'noopener noreferrer' : undefined}
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.openInNewTab ? '_blank' : undefined}
                    rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-3">
              {contactEmail && (
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <Mail className="size-4 shrink-0 mt-0.5" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-white transition-colors"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
              {contactAddress && (
                <li className="flex items-start gap-2 text-sm text-white/70">
                  <MapPin className="size-4 shrink-0 mt-0.5" />
                  <span>{contactAddress}</span>
                </li>
              )}
              {!contactEmail && !contactAddress && (
                <li className="text-sm text-white/50 italic">Contact details not configured.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary/30">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/80">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
