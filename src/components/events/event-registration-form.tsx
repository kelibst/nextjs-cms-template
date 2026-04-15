'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerForEvent, type RegistrationInput } from '@/app/actions/event-registration'

interface EventRegistrationFormProps {
  eventId: string
  eventTitle: string
  price: string | null
}

export function EventRegistrationForm({
  eventId,
  eventTitle,
  price,
}: EventRegistrationFormProps) {
  const router = useRouter()
  const [registered, setRegistered] = useState(false)
  const [form, setForm] = useState<RegistrationInput>({
    name: '',
    email: '',
    phone: '',
  })

  const mutation = useMutation({
    mutationFn: (data: RegistrationInput) => registerForEvent(eventId, data),
    onSuccess: (result) => {
      if (result.requiresPayment) {
        // Payment integration point — redirect to your payment provider here
        toast.info('This event requires payment. Please contact us to complete registration.')
      } else {
        setRegistered(true)
        toast.success('Registration successful! Check your email for confirmation.')
      }
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Registration failed'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    mutation.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone?.trim() || undefined,
    })
  }

  if (registered) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-primary-muted bg-primary-subtle p-8 text-center"
      >
        <CheckCircle2 className="size-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-primary/80 mb-2">
          You&rsquo;re registered!
        </h3>
        <p className="text-primary">
          Check your email for confirmation details about{' '}
          <span className="font-medium">{eventTitle}</span>.
        </p>
      </motion.div>
    )
  }

  const isPaid = price !== null && Number(price) > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="reg-name">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="reg-name"
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            disabled={mutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            disabled={mutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-phone">
            Phone Number <span className="text-muted-foreground/70 text-xs font-normal">(optional)</span>
          </Label>
          <Input
            id="reg-phone"
            type="tel"
            placeholder="+233 XX XXX XXXX"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            disabled={mutation.isPending}
          />
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending || !form.name.trim() || !form.email.trim()}
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground h-11 text-base font-semibold"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Registering...
            </>
          ) : isPaid ? (
            `Register — $${Number(price).toLocaleString()}`
          ) : (
            'Register — Free'
          )}
        </Button>

        {isPaid && (
          <p className="text-xs text-muted-foreground text-center">
            Payment will be collected on the next step.
          </p>
        )}
      </form>
    </motion.div>
  )
}
