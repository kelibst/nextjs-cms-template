import type { Metadata } from 'next'
import { db, members, users } from '@/lib/db'
import { eq, and, ilike } from 'drizzle-orm'
import { MemberDirectoryClient } from '@/components/member/member-directory-client'
import type { MemberCardProps } from '@/components/member/member-card'

export const metadata: Metadata = {
  title: 'Member Directory',
  description: 'Search and connect with GAPHTO members across Ghana.',
}

interface Props {
  searchParams: Promise<{ q?: string; specialty?: string; region?: string }>
}

export default async function MemberDirectoryPage({ searchParams }: Props) {
  const { q, specialty, region } = await searchParams

  let directoryMembers: MemberCardProps[] = []

  try {
    // Build dynamic conditions
    const conditions = [eq(members.membershipStatus, 'active')]

    if (q) {
      conditions.push(ilike(users.name, `%${q}%`))
    }

    if (specialty) {
      conditions.push(
        eq(
          members.specialty,
          specialty as 'disease-control' | 'health-information' | 'nutrition',
        ),
      )
    }

    if (region) {
      conditions.push(ilike(members.region, region))
    }

    const results = await db
      .select({
        id: members.id,
        name: users.name,
        specialty: members.specialty,
        region: members.region,
        facility: members.facility,
        membershipStatus: members.membershipStatus,
      })
      .from(members)
      .innerJoin(users, eq(members.userId, users.id))
      .where(and(...conditions))
      .limit(100)

    directoryMembers = results as MemberCardProps[]
  } catch {
    // DB unavailable — return empty list gracefully
    directoryMembers = []
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Top bar */}
      <div className="border-b border-primary/30 bg-primary-deep px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="text-lg font-bold tracking-wide text-white">
            GAPHTO
          </a>
          <span className="text-sm text-primary-foreground/70">Member Portal</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-0">
        {/* Sidebar — matches member-centre/page.tsx pattern */}
        <aside className="sticky top-0 h-[calc(100vh-49px)] w-52 shrink-0 border-r border-border bg-card pt-6">
          <nav className="flex flex-col gap-1 px-3">
            <a
              href="/member-centre"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              Dashboard
            </a>

            <a
              href="/member-centre/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              My Profile
            </a>

            <a
              href="/member-centre/publications"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              Publications
            </a>

            <a
              href="/member-centre/directory"
              className="flex items-center gap-3 rounded-lg bg-primary-subtle px-3 py-2.5 text-sm font-medium text-primary/90"
            >
              Member Directory
            </a>

            <a
              href="/events"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              Events
            </a>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-8 py-8">
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Member Directory</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Search and connect with GAPHTO members across Ghana.
            </p>
          </div>

          <MemberDirectoryClient
            initialMembers={directoryMembers}
            initialQ={q ?? ''}
            initialSpecialty={specialty ?? ''}
            initialRegion={region ?? ''}
          />
        </main>
      </div>
    </div>
  )
}
