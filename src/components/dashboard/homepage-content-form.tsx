'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { savePageContent } from '@/app/actions/content'

interface HomepageContentFormProps {
  content: Record<string, string>
}

const HERO_FIELDS = [
  { key: 'homepage.hero.title', label: 'Hero Title', type: 'input' },
  { key: 'homepage.hero.subtitle', label: 'Hero Subtitle', type: 'textarea' },
]

const STATS_FIELDS = [
  { key: 'homepage.stats.members_count', label: 'Members — Count' },
  { key: 'homepage.stats.members_label', label: 'Members — Label' },
  { key: 'homepage.stats.journals_count', label: 'Journals — Count' },
  { key: 'homepage.stats.journals_label', label: 'Journals — Label' },
  { key: 'homepage.stats.events_count', label: 'Events — Count' },
  { key: 'homepage.stats.events_label', label: 'Events — Label' },
  { key: 'homepage.stats.years_count', label: 'Years — Count' },
  { key: 'homepage.stats.years_label', label: 'Years — Label' },
]

const SECTION_FIELDS = [
  { key: 'homepage.sections.news_title', label: 'News Section Title' },
  { key: 'homepage.sections.events_title', label: 'Events Section Title' },
  { key: 'homepage.sections.practice_areas_title', label: 'Practice Areas Section Title' },
  { key: 'homepage.sections.leadership_title', label: 'Leadership Section Title' },
  { key: 'homepage.sections.gallery_title', label: 'Gallery Section Title' },
  { key: 'homepage.sections.about_title', label: 'About Section Title' },
  { key: 'homepage.sections.fund_cta_title', label: 'Fund CTA Title' },
  { key: 'homepage.sections.fund_cta_subtitle', label: 'Fund CTA Subtitle' },
]

export function HomepageContentForm({ content }: HomepageContentFormProps) {
  const [values, setValues] = useState<Record<string, string>>(content)

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }))

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => savePageContent(data),
    onSuccess: () => toast.success('Homepage content saved'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to save'),
  })

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Hero Section</h2>
        {HERO_FIELDS.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="text-sm text-muted-foreground">{field.label}</label>
            {field.type === 'textarea' ? (
              <Textarea
                value={values[field.key] ?? ''}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.label}
                rows={3}
              />
            ) : (
              <Input
                value={values[field.key] ?? ''}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.label}
              />
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Stats Bar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STATS_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-sm text-muted-foreground">{field.label}</label>
              <Input
                value={values[field.key] ?? ''}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.label}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section Headlines */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Section Headlines</h2>
        {SECTION_FIELDS.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="text-sm text-muted-foreground">{field.label}</label>
            <Input
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
              placeholder={field.label}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={() => mutation.mutate(values)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving…' : 'Save Homepage Content'}
        </Button>
      </div>
    </div>
  )
}
