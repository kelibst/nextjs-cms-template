'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  CalendarDays,
  Users,
  Trophy,
  Images,
  BookOpen,
  Mail,
  Settings,
  ExternalLink,
  Banknote,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: 'Content',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Posts', href: '/dashboard/posts', icon: Newspaper },
      { label: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
      { label: 'Events', href: '/dashboard/events', icon: CalendarDays },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Members', href: '/dashboard/members', icon: Users },
      { label: 'Leadership', href: '/dashboard/leadership', icon: Trophy },
      { label: 'Fund Applications', href: '/dashboard/fund-applications', icon: Banknote },
    ],
  },
  {
    label: 'Media',
    items: [
      { label: 'Gallery', href: '/dashboard/gallery', icon: Images },
      { label: 'Publications', href: '/dashboard/publications', icon: BookOpen },
    ],
  },
  {
    label: 'Inbox',
    items: [
      { label: 'Contact', href: '/dashboard/contact', icon: Mail },
    ],
  },
]

interface SidebarProps {
  role: string
  user: { name: string; email: string }
}

export function DashboardSidebar({ role, user }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-primary-deep flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-primary/30">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg tracking-wide">GAPHTO</span>
          <span className="bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1 px-2">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary text-white'
                          : 'text-white/70 hover:bg-primary/20 hover:text-white'
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* System — super_admin only */}
        {role === 'super_admin' && (
          <div>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1 px-2">
              System
            </p>
            <ul>
              <li>
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === '/dashboard/settings'
                      ? 'bg-primary text-white'
                      : 'text-white/70 hover:bg-primary/20 hover:text-white'
                  )}
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  Settings
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* User profile */}
      <div className="px-3 py-3 border-t border-primary/30">
        <Link
          href="/member-centre/profile"
          className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/10 transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">
              {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate leading-tight">{user.name}</p>
            <p className="text-white/50 text-xs truncate leading-tight">{user.email}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-white/30 shrink-0 group-hover:text-white/60 transition-colors" />
        </Link>
      </div>

      {/* Back to site */}
      <div className="px-3 py-3 border-t border-primary/30">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-primary/20 text-sm transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Back to site
        </Link>
      </div>
    </aside>
  )
}
