'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { submitLoanApplication } from '@/app/actions/fund'
import { LoanCalculator } from '@/components/fund/loan-calculator'

const GHANA_REGIONS = [
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
]

const REPAYMENT_OPTIONS = [6, 12, 18, 24]

interface FundApplicationFormProps {
  userName: string
  userEmail: string
}

export function FundApplicationForm({ userName, userEmail }: FundApplicationFormProps) {
  const router = useRouter()

  const [form, setForm] = useState({
    applicantName: userName,
    email: userEmail,
    phone: '',
    region: '',
    facility: '',
    loanAmount: 2000,
    loanPurpose: '',
    repaymentPeriodMonths: 12,
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) => submitLoanApplication(data),
    onSuccess: () => {
      toast.success('Application submitted! We will review it within 5 business days.')
      router.push('/member-centre')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Submission failed'),
  })

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal details */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Personal Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Full Name</label>
            <input
              type="text"
              required
              value={form.applicantName}
              onChange={(e) => set('applicantName', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Phone Number</label>
            <input
              type="tel"
              required
              placeholder="0XX XXX XXXX"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Region</label>
            <select
              required
              value={form.region}
              onChange={(e) => set('region', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select region…</option>
              {GHANA_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-sm font-medium text-foreground">Facility / Organisation</label>
            <input
              type="text"
              required
              placeholder="e.g. Korle-Bu Teaching Hospital"
              value={form.facility}
              onChange={(e) => set('facility', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Loan details */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-foreground">Loan Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Loan Amount (GHS 500 – 10,000)
            </label>
            <input
              type="number"
              required
              min={500}
              max={10000}
              step={100}
              value={form.loanAmount}
              onChange={(e) => set('loanAmount', Math.min(10000, Math.max(500, Number(e.target.value))))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Repayment Period</label>
            <select
              required
              value={form.repaymentPeriodMonths}
              onChange={(e) => set('repaymentPeriodMonths', Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {REPAYMENT_OPTIONS.map((m) => (
                <option key={m} value={m}>{m} months</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Purpose of Loan{' '}
            <span className="text-muted-foreground font-normal">(minimum 50 characters)</span>
          </label>
          <textarea
            required
            minLength={50}
            rows={4}
            placeholder="Describe how you plan to use this loan…"
            value={form.loanPurpose}
            onChange={(e) => set('loanPurpose', e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {form.loanPurpose.length} / 50 min
          </p>
        </div>

        {/* Inline calculator */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Estimated Repayment</p>
          <LoanCalculator
            loanAmount={form.loanAmount}
            repaymentMonths={form.repaymentPeriodMonths}
            onLoanAmountChange={(v) => set('loanAmount', v)}
            onRepaymentMonthsChange={(v) => set('repaymentPeriodMonths', v)}
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          By submitting, you confirm the information provided is accurate.
        </p>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>
    </form>
  )
}
