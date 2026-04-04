import Link from 'next/link'
import { CheckCircle, DollarSign, Clock, AlertCircle } from 'lucide-react'
import { LoanCalculator } from '@/components/fund/loan-calculator'

export const metadata = {
  title: 'GAPHTO Member Fund',
  description: 'Financial support for active GAPHTO members. Apply for a loan today.',
}

export default function FundPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-primary-deep text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">GAPHTO Member Fund</h1>
          <p className="text-xl text-primary-foreground/80">
            Financial support for our members — quick, fair, and built for health professionals.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* What is the GAPHTO Fund */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">What is the GAPHTO Fund?</h2>
          <p className="text-muted-foreground leading-relaxed">
            The GAPHTO Member Fund is a financial assistance scheme established to support active
            members of the Ghana Association of Public Health Technicians and Officers. Whether you
            need funds for professional development, personal emergencies, or other needs, the fund
            provides accessible, low-interest loans repayable over a flexible period.
          </p>
        </section>

        {/* Loan Details */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Loan Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
              <DollarSign className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Loan Amount</p>
                <p className="text-lg font-bold text-foreground">GHS 500 – 10,000</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Interest Rate</p>
                <p className="text-lg font-bold text-foreground">10% per annum</p>
                <p className="text-xs text-muted-foreground">Simple interest</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
              <Clock className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Repayment Period</p>
                <p className="text-lg font-bold text-foreground">6 – 24 months</p>
              </div>
            </div>
          </div>
        </section>

        {/* Eligibility */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Eligibility</h2>
          <ul className="space-y-2">
            {[
              'Must be an active, registered GAPHTO member',
              'Membership dues must be up to date',
              'Must have been a member for at least 6 months',
              'No outstanding loan from a previous application',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Loan Calculator */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Loan Calculator</h2>
          <p className="text-muted-foreground mb-6">
            Use the calculator below to estimate your monthly repayment before applying.
          </p>
          <LoanCalculator />
        </section>

        {/* CTA */}
        <section className="bg-primary-subtle border border-primary/20 rounded-xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Ready to Apply?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Log in to your GAPHTO account and complete the application form. Applications are reviewed
            within 5 business days.
          </p>
          <Link
            href="/fund/apply"
            className="inline-block bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Apply Now
          </Link>
          <p className="text-xs text-muted-foreground">
            You must be logged in to apply.{' '}
            <Link href="/login?callbackUrl=/fund/apply" className="text-primary hover:underline">
              Log in here
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
