import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'My CMS';

export const metadata: Metadata = {
  title: {
    default: `Account | ${siteName}`,
    template: `%s | ${siteName}`,
  },
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings()
  const style = settings.authLayoutStyle || 'gradient'
  const bgImage = settings.authBgImageUrl

  if (style === 'split-image') {
    return (
      <div className="min-h-screen flex flex-row">
        {/* Left panel: image */}
        <div
          className="hidden lg:flex lg:w-1/2 relative bg-slate-800 items-center justify-center overflow-hidden"
          style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-center px-12">
            <h2 className="text-3xl font-bold text-white">{settings.siteName}</h2>
            {settings.tagline && (
              <p className="mt-2 text-white/70 text-sm">{settings.tagline}</p>
            )}
          </div>
        </div>
        {/* Right panel: form */}
        <div className="flex flex-1 flex-col bg-background">
          {children}
        </div>
      </div>
    )
  }

  if (style === 'frosted-glass') {
    return (
      <div
        className="min-h-screen flex flex-col relative"
        style={bgImage
          ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : undefined
        }
      >
        {!bgImage && <div className="absolute inset-0 bg-linear-to-br from-slate-800 via-slate-700 to-slate-900" />}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col flex-1">
          {children}
        </div>
      </div>
    )
  }

  if (style === 'minimal') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {children}
      </div>
    )
  }

  if (style === 'dark-overlay') {
    return (
      <div
        className="min-h-screen flex flex-col relative"
        style={bgImage
          ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : undefined
        }
      >
        {!bgImage && <div className="absolute inset-0 bg-slate-800" />}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col flex-1">
          {children}
        </div>
      </div>
    )
  }

  // Default: gradient (uses theme_primary if set, else default green)
  const gradientStyle = settings.themePrimary
    ? { background: `linear-gradient(135deg, color-mix(in oklch, ${settings.themePrimary} 30%, black) 0%, color-mix(in oklch, ${settings.themePrimary} 60%, black) 50%, color-mix(in oklch, ${settings.themePrimary} 80%, black) 100%)` }
    : undefined

  return (
    <div
      className={cn("min-h-screen flex flex-col", !gradientStyle && "bg-linear-to-br from-green-950 via-green-900 to-green-800")}
      style={gradientStyle}
    >
      {children}
    </div>
  )
}
