
import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  variant?: 'light' | 'dark'
}

const Logo = ({ variant = 'light' }: LogoProps) => {
  const isDark = variant === 'dark'
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className={`relative h-10 w-10 rounded-full overflow-hidden shadow-sm shrink-0 ${
        isDark
          ? 'border border-white/20 bg-white/10'
          : 'border border-border bg-white'
      }`}>
        <Image
          src="/images/logo/logo.png"
          alt="GAPHTO"
          fill
          className={`object-contain p-1 ${isDark ? 'brightness-0 invert' : ''}`}
          priority
        />
      </div>
      <span className={`hidden sm:block text-xs leading-tight max-w-35 ${
        isDark ? 'text-white/70' : 'text-muted-foreground'
      }`}>
        Ghana Association of Public Health Technical Officers
      </span>
    </Link>
  )
}

export default Logo
