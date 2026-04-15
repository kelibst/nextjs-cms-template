import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { leadership } from "../../../../../drizzle/schema";
import { eq } from "drizzle-orm";

interface Props {
  params: Promise<{ id: string }>;
}

// Inline SVG social icons (lucide-react lacks brand icons in this version)
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [leader] = await db
    .select()
    .from(leadership)
    .where(eq(leadership.id, id))
    .limit(1);

  if (!leader) return { title: "Leader Not Found" };

  return {
    title: leader.name,
    description: leader.bio ?? `${leader.name}, ${leader.role}`,
  };
}

function normalizeImageSrc(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url
  return `/${url}`
}

function isValidUrl(url: string | null | undefined): url is string {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://')
}

export const dynamic = "force-dynamic";

export default async function LeadershipProfilePage({ params }: Props) {
  const { id } = await params;
  const [leader] = await db
    .select()
    .from(leadership)
    .where(eq(leadership.id, id))
    .limit(1);

  if (!leader) notFound();

  const imageSrc = normalizeImageSrc(leader.imageUrl);

  const termLabel =
    leader.termStart || leader.termEnd
      ? [
          leader.termStart ? new Date(leader.termStart).getFullYear() : null,
          leader.termEnd ? new Date(leader.termEnd).getFullYear() : "present",
        ]
          .filter(Boolean)
          .join(" – ")
      : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/leadership"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Leadership Team
      </Link>

      {/* Hero section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10">
        {/* Avatar */}
        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full bg-primary-subtle border-4 border-primary-muted shadow-md">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={leader.name}
              fill
              className="object-cover"
              sizes="160px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary-muted">
              <svg
                className="h-16 w-16 text-primary/30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Name, role, term */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-foreground">{leader.name}</h1>
          <p className="mt-1 text-lg text-primary font-medium">{leader.role}</p>
          {termLabel && (
            <p className="mt-1 text-sm text-muted-foreground">Term: {termLabel}</p>
          )}

          {/* Social links */}
          <div className="mt-4 flex items-center gap-3 justify-center sm:justify-start">
            {isValidUrl(leader.facebookUrl) && (
              <Link
                href={leader.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </Link>
            )}
            {isValidUrl(leader.twitterUrl) && (
              <Link
                href={leader.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter / X"
              >
                <XIcon className="w-5 h-5" />
              </Link>
            )}
            {isValidUrl(leader.linkedinUrl) && (
              <Link
                href={leader.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-5 h-5" />
              </Link>
            )}
            {isValidUrl(leader.instagramUrl) && (
              <Link
                href={leader.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </Link>
            )}
            {leader.email && (
              <Link
                href={`mailto:${leader.email}`}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {leader.bio ? (
        <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed">
          <p>{leader.bio}</p>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm italic">
          No biography available for this member.
        </p>
      )}
    </div>
  );
}
