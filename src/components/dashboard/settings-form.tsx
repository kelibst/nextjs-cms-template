'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { saveSettings } from '@/app/actions/settings'
import { MediaPickerModal } from '@/components/dashboard/media-picker-modal'
import Image from 'next/image'
import { ImageIcon, Palette, Settings, Globe, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsFormProps {
  settings: Record<string, string>
}

const AUTH_STYLES = [
  {
    key: 'gradient',
    label: 'Gradient',
    description: 'Dark gradient background',
    preview: (
      <div className="w-full h-16 rounded bg-linear-to-br from-green-950 via-green-900 to-green-800 flex items-center justify-center">
        <div className="w-8 h-10 rounded bg-white/10 border border-white/20" />
      </div>
    ),
  },
  {
    key: 'split-image',
    label: 'Split Image',
    description: 'Image panel + white form panel',
    preview: (
      <div className="w-full h-16 rounded overflow-hidden flex">
        <div className="w-1/2 bg-slate-700 flex items-center justify-center">
          <ImageIcon className="size-4 text-white/40" />
        </div>
        <div className="w-1/2 bg-white flex items-center justify-center">
          <div className="w-5 h-6 rounded bg-slate-200" />
        </div>
      </div>
    ),
  },
  {
    key: 'frosted-glass',
    label: 'Frosted Glass',
    description: 'Blurred background, glass card',
    preview: (
      <div className="w-full h-16 rounded relative overflow-hidden bg-linear-to-br from-blue-900 to-purple-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-12 rounded-lg bg-white/20 backdrop-blur border border-white/30" />
        </div>
      </div>
    ),
  },
  {
    key: 'minimal',
    label: 'Minimal',
    description: 'Clean white/light background',
    preview: (
      <div className="w-full h-16 rounded bg-gray-50 border border-gray-200 flex items-center justify-center">
        <div className="w-8 h-10 rounded border border-gray-300 bg-white shadow-sm" />
      </div>
    ),
  },
  {
    key: 'dark-overlay',
    label: 'Dark Overlay',
    description: 'Image with dark overlay',
    preview: (
      <div className="w-full h-16 rounded relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-600" />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="w-8 h-10 rounded bg-white/10 border border-white/20" />
        </div>
      </div>
    ),
  },
]

export function SettingsForm({ settings }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(settings)
  const [logoPickerOpen, setLogoPickerOpen] = useState(false)
  const [authBgPickerOpen, setAuthBgPickerOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => saveSettings(data),
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Failed to save settings'),
  })

  const set = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }))

  const needsBgImage = values.auth_layout_style !== 'gradient' && values.auth_layout_style !== 'minimal'

  return (
    <div className="space-y-6">

      {/* Branding */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Branding</h2>
        </div>

        {/* Logo */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Site Logo</label>
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 rounded-lg border border-border bg-muted overflow-hidden shrink-0">
              {values.logo_url ? (
                <Image src={values.logo_url} alt="Logo" fill className="object-contain p-1" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="size-5 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLogoPickerOpen(true)}
              >
                {values.logo_url ? 'Change Logo' : 'Select Logo'}
              </Button>
              {values.logo_url && (
                <button
                  type="button"
                  onClick={() => set('logo_url', '')}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors text-left"
                >
                  Remove logo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Organisation Name</label>
          <Input
            value={values.org_name ?? ''}
            onChange={(e) => set('org_name', e.target.value)}
            placeholder="My Organisation"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Tagline</label>
          <Input
            value={values.tagline ?? ''}
            onChange={(e) => set('tagline', e.target.value)}
            placeholder="A short tagline"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Site Description</label>
          <Textarea
            value={values.site_description ?? ''}
            onChange={(e) => set('site_description', e.target.value)}
            placeholder="A short description shown in the footer and used for SEO"
            rows={2}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Footer Copyright Text</label>
          <Input
            value={values.copyright_text ?? ''}
            onChange={(e) => set('copyright_text', e.target.value)}
            placeholder={`Leave blank to auto-generate: © ${new Date().getFullYear()} [Organisation Name]. All rights reserved.`}
          />
        </div>
      </section>

      {/* Contact */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Contact</h2>
        </div>
        {[
          { key: 'contact_email', label: 'Contact Email' },
          { key: 'contact_phone', label: 'Contact Phone' },
          { key: 'contact_address', label: 'Address' },
        ].map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="text-sm text-muted-foreground">{field.label}</label>
            <Input
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
              placeholder={field.label}
            />
          </div>
        ))}
      </section>

      {/* Social */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Social</h2>
        {[
          { key: 'social_facebook', label: 'Facebook URL' },
          { key: 'social_twitter', label: 'Twitter/X URL' },
          { key: 'social_youtube', label: 'YouTube URL' },
        ].map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="text-sm text-muted-foreground">{field.label}</label>
            <Input
              value={values[field.key] ?? ''}
              onChange={(e) => set(field.key, e.target.value)}
              placeholder={`https://`}
            />
          </div>
        ))}
      </section>

      {/* Theme Colors */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Theme Colors</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Override the default brand colors. All shades are auto-derived from the primary color.
          Leave blank to use the theme defaults.
        </p>

        {/* Primary Color */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Primary Color</label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={values.theme_primary || '#1a7a4a'}
                onChange={(e) => set('theme_primary', e.target.value)}
                className="h-9 w-9 cursor-pointer rounded-md border border-border p-0.5 bg-transparent"
              />
            </div>
            <Input
              value={values.theme_primary ?? ''}
              onChange={(e) => set('theme_primary', e.target.value)}
              placeholder="#1a7a4a  (leave blank for default)"
              className="flex-1 font-mono text-sm"
              maxLength={7}
            />
            {values.theme_primary && (
              <button
                type="button"
                onClick={() => set('theme_primary', '')}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                Reset
              </button>
            )}
          </div>
          {values.theme_primary && (
            <div className="flex gap-1.5 mt-1">
              {[
                { label: 'Base', bg: values.theme_primary },
                { label: 'Hover', style: `color-mix(in oklch, ${values.theme_primary} 85%, black)` },
                { label: 'Subtle', style: `color-mix(in oklch, ${values.theme_primary} 15%, white)` },
                { label: 'Muted', style: `color-mix(in oklch, ${values.theme_primary} 50%, white)` },
                { label: 'Deep', style: `color-mix(in oklch, ${values.theme_primary} 40%, black)` },
              ].map(({ label, bg, style }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div
                    className="h-6 w-8 rounded border border-border"
                    style={{ backgroundColor: bg || style }}
                  />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accent Color */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Accent Color</label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={values.theme_accent || '#2563eb'}
                onChange={(e) => set('theme_accent', e.target.value)}
                className="h-9 w-9 cursor-pointer rounded-md border border-border p-0.5 bg-transparent"
              />
            </div>
            <Input
              value={values.theme_accent ?? ''}
              onChange={(e) => set('theme_accent', e.target.value)}
              placeholder="#2563eb  (leave blank for default)"
              className="flex-1 font-mono text-sm"
              maxLength={7}
            />
            {values.theme_accent && (
              <button
                type="button"
                onClick={() => set('theme_accent', '')}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                Reset
              </button>
            )}
          </div>
          {values.theme_accent && (
            <div className="flex gap-1.5 mt-1">
              <div className="flex flex-col items-center gap-1">
                <div className="h-6 w-8 rounded border border-border" style={{ backgroundColor: values.theme_accent }} />
                <span className="text-[10px] text-muted-foreground">Accent</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Auth Pages */}
      <section className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Monitor className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Auth Page Style</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose the visual style for login, register, and password reset pages.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AUTH_STYLES.map((style) => {
            const active = (values.auth_layout_style || 'gradient') === style.key
            return (
              <button
                key={style.key}
                type="button"
                onClick={() => set('auth_layout_style', style.key)}
                className={cn(
                  'flex flex-col gap-2 rounded-lg border-2 p-2 text-left transition-all',
                  active
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                )}
              >
                {style.preview}
                <div>
                  <p className={cn('text-xs font-medium', active ? 'text-primary' : 'text-foreground/80')}>
                    {style.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{style.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {needsBgImage && (
          <div className="space-y-2 pt-1">
            <label className="text-sm text-muted-foreground">Background Image</label>
            <div className="flex items-center gap-4">
              {values.auth_bg_image_url && (
                <div className="relative h-14 w-24 rounded-lg border border-border overflow-hidden shrink-0">
                  <Image src={values.auth_bg_image_url} alt="Auth background" fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAuthBgPickerOpen(true)}
                >
                  {values.auth_bg_image_url ? 'Change Image' : 'Select Image'}
                </Button>
                {values.auth_bg_image_url && (
                  <button
                    type="button"
                    onClick={() => set('auth_bg_image_url', '')}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors text-left"
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center gap-3 pb-4">
        <Button
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={() => mutation.mutate(values)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      <MediaPickerModal
        open={logoPickerOpen}
        onClose={() => setLogoPickerOpen(false)}
        onSelect={(url) => { set('logo_url', url); setLogoPickerOpen(false) }}
        accept="image"
        title="Select Logo"
      />
      <MediaPickerModal
        open={authBgPickerOpen}
        onClose={() => setAuthBgPickerOpen(false)}
        onSelect={(url) => { set('auth_bg_image_url', url); setAuthBgPickerOpen(false) }}
        accept="image"
        title="Select Auth Background Image"
      />
    </div>
  )
}
