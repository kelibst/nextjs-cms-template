'use client'

import { useState } from 'react'
import { Loader2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaymentButtonProps {
  registrationId: string
  amount: number
}

export function PaymentButton({ registrationId, amount }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      })

      const data = await res.json() as { authorizationUrl?: string; error?: string }

      if (!res.ok || !data.authorizationUrl) {
        throw new Error(data.error ?? 'Failed to initialize payment')
      }

      window.location.href = data.authorizationUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePay}
        disabled={loading}
        size="lg"
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground h-12 text-base font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Connecting to Paystack…
          </>
        ) : (
          <>
            <CreditCard className="size-4 mr-2" />
            Pay GH₵ {amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <p className="text-xs text-center text-muted-foreground">
        You will be redirected to Paystack&apos;s secure checkout.
      </p>
    </div>
  )
}
