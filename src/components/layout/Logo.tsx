import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  variant?: 'light' | 'dark'
  logoUrl?: string
  siteName?: string
}

const Logo = ({ variant = 'light', logoUrl, siteName }: LogoProps) => {
  const isDark = variant === 'dark'
  const name = siteName || process.env.NEXT_PUBLIC_SITE_NAME || 'My CMS'
  const src = logoUrl || '/images/logo/logo.png'

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className={`relative h-10 w-10 rounded-full overflow-hidden shadow-sm shrink-0 ${
        isDark
          ? 'border border-white/20 bg-white/10'
          : 'border border-border bg-white'
      }`}>
        <Image
          src={src}
          alt={name}
          fill
          className={`object-contain p-1 ${isDark ? 'brightness-0 invert' : ''}`}
          priority
        />
      </div>
      <span className={`hidden sm:block text-xs leading-tight max-w-35 ${
        isDark ? 'text-white/70' : 'text-muted-foreground'
      }`}>
        {name}
      </span>
    </Link>
  )
}

export default Logo
