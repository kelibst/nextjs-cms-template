import type { Metadata } from "next";
import Link from "next/link";
import { getContact, getBlocksForPage } from "@/lib/data";
import { getHeroContent } from "@/lib/blocks";
import { InnerPageHero } from "@/components/shared/inner-page-hero";
import { BlockRenderer, type BlockDataSources } from "@/components/shared/block-renderer";
import { ContactForm } from "./contact-form";

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with GAPHTO — Ghana Association of Public Health Technical Officers.",
};

export default async function ContactPage() {
  const [contact, blocks] = await Promise.all([
    Promise.resolve(getContact()),
    getBlocksForPage('contact'),
  ])

  const hero = getHeroContent(blocks, {
    title: 'Contact Us',
    label: 'Get in Touch',
    subtitle: "We'd love to hear from you. Reach out to GAPHTO.",
  })

  const contentBlocks = blocks.filter(b => b.type !== 'hero')
  const dataSources: BlockDataSources = {}

  return (
    <>
      <InnerPageHero
        title={hero.title}
        label={hero.label}
        subtitle={hero.subtitle}
        heroImage={hero.heroImage}
        centered={hero.centered !== false}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      {contentBlocks.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
          {contentBlocks.map(block => (
            <BlockRenderer key={block.id} block={block} dataSources={dataSources} pageContext="subpage" />
          ))}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: Contact info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-primary/80 mb-4">
                Get In Touch
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Have a question or want to connect with GAPHTO? Use the contact
                details below or send us a message using the form.
              </p>
            </div>

            <div className="space-y-4">
              {/* Phone */}
              {contact.phone && (
                <ContactInfoCard
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                  label="Phone"
                  value={contact.phone}
                  href={`tel:${contact.phone}`}
                />
              )}

              {/* Email */}
              {contact.email && (
                <ContactInfoCard
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                  label="Email"
                  value={contact.email}
                  href={`mailto:${contact.email}`}
                />
              )}

              {/* Address */}
              {contact.address && (
                <ContactInfoCard
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  label="Address"
                  value={contact.address}
                />
              )}

              {/* Social links */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="mb-3 text-sm font-semibold text-foreground">Follow Us</p>
                <div className="flex flex-wrap gap-3">
                  {contact.facebook && (
                    <Link
                      href={contact.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </Link>
                  )}
                  {contact.twitter && (
                    <Link
                      href={contact.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X / Twitter
                    </Link>
                  )}
                  {contact.youtube && (
                    <Link
                      href={contact.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      YouTube
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-xl border border-border bg-primary-subtle p-6">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-primary/80">National Secretariat</p>
                  <p className="mt-1 text-sm text-primary">
                    Ghana Association of Public Health Technical Officers (GAPHTO)
                    <br />
                    Accra, Ghana
                  </p>
                  {contact.address && (
                    <p className="mt-1 text-sm text-primary">{contact.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact form */}
          <div>
            <h2 className="mb-6 text-xl font-bold text-primary/80">Send a Message</h2>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ContactInfoCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {href ? (
          <Link
            href={href}
            className="mt-0.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            {value}
          </Link>
        ) : (
          <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}
