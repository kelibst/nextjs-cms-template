'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-foreground mb-3">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We could not load this page. Please try again or return to the homepage.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors min-h-11"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors min-h-11"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
