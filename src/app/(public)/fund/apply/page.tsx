import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FundApplicationForm } from '@/components/fund/fund-application-form'

export const metadata = {
  title: 'Apply for a Loan — GAPHTO Member Fund',
  description: 'Submit your GAPHTO loan application.',
}

export default async function FundApplyPage() {
  const session = await auth()
  if (!session) redirect('/login?callbackUrl=/fund/apply')

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-primary-deep py-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href="/fund"
            className="text-primary-foreground/70 hover:text-primary-foreground flex items-center gap-1 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Fund
          </Link>
          <span className="text-primary-foreground/30">/</span>
          <span className="text-primary-foreground font-semibold text-sm">Apply for a Loan</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Loan Application</h1>
          <p className="text-muted-foreground">
            Complete the form below. Applications are reviewed within 5 business days.
          </p>
        </div>

        <FundApplicationForm
          userName={session.user.name ?? ''}
          userEmail={session.user.email ?? ''}
        />
      </div>
    </div>
  )
}
