'use client'

import { useState } from 'react'

const REPAYMENT_OPTIONS = [
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
  { value: 18, label: '18 months' },
  { value: 24, label: '24 months' },
]

function formatGHS(amount: number) {
  return new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface LoanCalculatorProps {
  /** If provided, the calculator syncs with parent state */
  loanAmount?: number
  repaymentMonths?: number
  onLoanAmountChange?: (val: number) => void
  onRepaymentMonthsChange?: (val: number) => void
}

export function LoanCalculator({
  loanAmount: externalAmount,
  repaymentMonths: externalMonths,
  onLoanAmountChange,
  onRepaymentMonthsChange,
}: LoanCalculatorProps) {
  const [internalAmount, setInternalAmount] = useState(2000)
  const [internalMonths, setInternalMonths] = useState(12)

  const isControlled = externalAmount !== undefined && externalMonths !== undefined

  const loanAmount = isControlled ? externalAmount : internalAmount
  const months = isControlled ? externalMonths : internalMonths

  const setAmount = (val: number) => {
    if (onLoanAmountChange) onLoanAmountChange(val)
    else setInternalAmount(val)
  }
  const setMonths = (val: number) => {
    if (onRepaymentMonthsChange) onRepaymentMonthsChange(val)
    else setInternalMonths(val)
  }

  // Simple interest: rate = 10% p.a.
  const annualRate = 0.10
  const totalInterest = loanAmount * annualRate * (months / 12)
  const totalRepayment = loanAmount + totalInterest
  const monthlyPayment = totalRepayment / months

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Loan Amount (GHS)
          </label>
          <input
            type="number"
            min={500}
            max={10000}
            step={100}
            value={loanAmount}
            onChange={(e) => {
              const v = Math.min(10000, Math.max(500, Number(e.target.value)))
              setAmount(v)
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="range"
            min={500}
            max={10000}
            step={100}
            value={loanAmount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>GHS 500</span>
            <span>GHS 10,000</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Repayment Period
          </label>
          <div className="grid grid-cols-2 gap-2">
            {REPAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMonths(opt.value)}
                className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                  months === opt.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-primary-subtle border border-primary/20 rounded-xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Monthly Payment
            </p>
            <p className="text-3xl font-bold text-primary">
              GHS {formatGHS(monthlyPayment)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Total Repayment
            </p>
            <p className="text-2xl font-semibold text-foreground">
              GHS {formatGHS(totalRepayment)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              Total Interest
            </p>
            <p className="text-2xl font-semibold text-foreground">
              GHS {formatGHS(totalInterest)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
