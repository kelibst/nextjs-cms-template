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
    directoryMembers = []
  }

  return (
    <main className="flex-1 px-8 py-8">
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
  )
}
