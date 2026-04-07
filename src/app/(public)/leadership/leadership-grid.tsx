"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import type { Leadership } from "../../../../drizzle/schema";

interface LeadershipGridProps {
  members: Leadership[];
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const EXEC_ROLES = [
  "National President",
  "Vice President",
  "General Secretary",
  "Deputy General Secretary",
  "Treasurer",
];

// Inline SVG social icons
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

export function LeadershipGrid({ members }: LeadershipGridProps) {
  const leadership = members.filter((m) =>
    EXEC_ROLES.some((role) => m.role.toLowerCase().includes(role.toLowerCase()))
  );
  const others = members.filter((m) => !leadership.includes(m));

  return (
    <div className="space-y-12">
      {/* Core leadership */}
      {leadership.length > 0 && (
        <section>
          <h2 className="mb-6 text-xl font-semibold text-primary border-b border-primary-subtle pb-2">
            National Executive Officers
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {leadership.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </motion.div>
        </section>
      )}

      {/* Other members */}
      {others.length > 0 && (
        <section>
          <h2 className="mb-6 text-xl font-semibold text-primary border-b border-primary-subtle pb-2">
            Executive Members
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {others.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </motion.div>
        </section>
      )}

      {members.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No leadership members found.
        </p>
      )}
    </div>
  );
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

function MemberCard({ member }: { member: Leadership }) {
  const imageSrc = normalizeImageSrc(member.imageUrl)


  return (
    <motion.div variants={item}>
      <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 shadow-sm text-center hover:shadow-md transition-shadow h-full">
        {/* Photo */}
        <div className="relative mb-4 h-30 w-30 overflow-hidden rounded-full bg-primary-subtle border-4 border-primary-muted shrink-0">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={member.name}
              fill
              className="object-cover"
              sizes="120px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary-muted">
              <svg
                className="h-12 w-12 text-primary/30"
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

        {/* Name */}
        <h3 className="text-base font-semibold text-foreground">{member.name}</h3>
        {/* Role */}
        <p className="mt-1 text-sm text-primary font-medium">{member.role}</p>

        {/* Bio */}
        {member.bio && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-3 flex-1">
            {member.bio}
          </p>
        )}

        {/* Social links */}
        <div className="mt-3 flex items-center gap-2 justify-center">
          {isValidUrl(member.facebookUrl) && (
            <Link
              href={member.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <FacebookIcon className="w-4 h-4" />
            </Link>
          )}
          {isValidUrl(member.twitterUrl) && (
            <Link
              href={member.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter / X"
            >
              <XIcon className="w-4 h-4" />
            </Link>
          )}
          {isValidUrl(member.linkedinUrl) && (
            <Link
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="w-4 h-4" />
            </Link>
          )}
          {isValidUrl(member.instagramUrl) && (
            <Link
              href={member.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </Link>
          )}
          {member.email && (
            <Link
              href={`mailto:${member.email}`}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Profile link */}
        <Link
          href={`/leadership/${member.id}`}
          className="mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Read more →
        </Link>
      </div>
    </motion.div>
  );
}
