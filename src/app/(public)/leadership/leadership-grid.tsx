"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LeadershipMember } from "@/lib/data";

interface LeadershipGridProps {
  members: LeadershipMember[];
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

export function LeadershipGrid({ members }: LeadershipGridProps) {
  // Split into leadership tiers
  const leadership = members.filter((m) =>
    ["National President", "Vice President", "General Secretary", "Deputy General Secretary", "Treasurer"].some(
      (role) => m.role.toLowerCase().includes(role.toLowerCase())
    )
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
              <MemberCard key={member.name} member={member} />
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
              <MemberCard key={member.name} member={member} />
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: LeadershipMember }) {
  const imageSrc = member.localImage
    ? `/images/${member.localImage}`
    : member.imageUrl;

  return (
    <motion.div variants={item}>
      <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 shadow-sm text-center hover:shadow-md transition-shadow">
        {/* Photo */}
        <div className="relative mb-4 h-[120px] w-[120px] overflow-hidden rounded-full bg-primary-subtle border-4 border-primary-muted">
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
          <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
            {member.bio}
          </p>
        )}

        {/* Facebook link */}
        {member.facebookUrl &&
          member.facebookUrl !== "https://web.facebook.com" && (
            <Link
              href={member.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Link>
          )}
      </div>
    </motion.div>
  );
}
