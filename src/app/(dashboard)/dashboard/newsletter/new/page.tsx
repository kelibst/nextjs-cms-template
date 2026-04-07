import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { NewsletterForm } from '@/components/dashboard/newsletter-form'

export default function NewNewsletterPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/newsletter" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground/80">
          <ArrowLeft className="h-4 w-4" /> Newsletter
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-medium">Compose</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-foreground">Compose Newsletter</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Save as draft or send to all opted-in members</p>
      </div>
      <NewsletterForm />
    </div>
  )
}
