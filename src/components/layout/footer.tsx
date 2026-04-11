import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin } from 'lucide-react'

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'GAPHTO News', href: '/news' },
  { label: 'Health News', href: '/news/health-news' },
  { label: 'Leadership', href: '/leadership' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
  { label: 'GAPHTO Fund', href: '/fund' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-deep text-white/90">
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo + About */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo/logo.png"
                alt="GAPHTO"
                width={100}
                height={30}
                className="object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              Ghana Association of Public Health Technical Officers — uniting Disease Control Officers,
              Health Information Officers, Nutrition Officers, and Field Technicians nationwide.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {/* Facebook */}
              <a
                href="https://web.facebook.com/gaphto"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              {/* X / Twitter */}
              <a
                href="https://twitter.com/gaphto"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-white/70 hover:text-white transition-colors"
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
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
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
              <li className="flex items-start gap-2 text-sm text-white/70">
                <Phone className="size-4 shrink-0 mt-0.5" />
                <span>030 296 4402</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <Mail className="size-4 shrink-0 mt-0.5" />
                <a
                  href="mailto:info@gaphto.org"
                  className="hover:text-white transition-colors"
                >
                  info@gaphto.org
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/70">
                <MapPin className="size-4 shrink-0 mt-0.5" />
                <span>GAPHTO National Secretariat, Accra, Ghana</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary/30">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/60">
            &copy; {currentYear} GAPHTO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
