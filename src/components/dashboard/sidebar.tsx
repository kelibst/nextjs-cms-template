'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  CalendarDays,
  Users,
  Trophy,
  Images,
  ImageIcon,
  BookOpen,
  Mail,
  Settings,
  ExternalLink,
  Banknote,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart2,
  FileEdit,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Logo from '../layout/Logo'

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
      { label: 'Media Library', href: '/dashboard/media', icon: ImageIcon },
      { label: 'Gallery', href: '/dashboard/gallery', icon: Images },
      { label: 'Publications', href: '/dashboard/publications', icon: BookOpen },
    ],
  },
  {
    label: 'Learning',
    items: [
      { label: 'Learning', href: '/dashboard/learning', icon: BookOpen },
      { label: 'Analytics', href: '/dashboard/learning/analytics', icon: BarChart2 },
      { label: 'Newsletter', href: '/dashboard/newsletter', icon: Mail },
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
  // Lazy initialiser: runs once on the client, reads localStorage before the
  // first render — no effect needed, so the set-state-in-effect lint rule is
  // never triggered.  Returns false during SSR (localStorage is undefined).
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const isCollapsed = collapsed

  return (
    <aside
      className={cn(
        'shrink-0 bg-primary-deep flex flex-col h-full overflow-y-auto transition-all duration-200',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo / Header */}
      <div className={cn('border-b border-primary/30', isCollapsed ? 'px-2 py-5' : 'px-5 py-5')}>
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <button
              onClick={toggle}
              title="Expand sidebar"
              className="mx-auto flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          ) : (
            <>
              <Logo />
              <span className="bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Admin
              </span>
              <button
                onClick={toggle}
                title="Collapse sidebar"
                className="ml-auto text-white/70 hover:text-white transition-colors"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 py-4 space-y-5', isCollapsed ? 'px-1' : 'px-3')}>
        {navGroups.map((group) => (
          <div key={group.label}>
            {!isCollapsed && (
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1 px-2">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center rounded-lg text-sm font-medium transition-colors',
                        isCollapsed
                          ? 'justify-center w-10 h-10 mx-auto'
                          : 'gap-3 px-3 py-2',
                        active
                          ? 'bg-primary text-white'
                          : 'text-white/70 hover:bg-primary/20 hover:text-white'
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* Content — super_admin and admin only */}
        {['super_admin', 'admin'].includes(role) && (
          <div>
            {!isCollapsed && (
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1 px-2">
                Pages
              </p>
            )}
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/dashboard/content"
                  title={isCollapsed ? 'Content' : undefined}
                  className={cn(
                    'flex items-center rounded-lg text-sm font-medium transition-colors',
                    isCollapsed
                      ? 'justify-center w-10 h-10 mx-auto'
                      : 'gap-3 px-3 py-2',
                    pathname.startsWith('/dashboard/content')
                      ? 'bg-primary text-white'
                      : 'text-white/70 hover:bg-primary/20 hover:text-white'
                  )}
                >
                  <FileEdit className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && 'Content'}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/navigation"
                  title={isCollapsed ? 'Navigation' : undefined}
                  className={cn(
                    'flex items-center rounded-lg text-sm font-medium transition-colors',
                    isCollapsed
                      ? 'justify-center w-10 h-10 mx-auto'
                      : 'gap-3 px-3 py-2',
                    pathname.startsWith('/dashboard/navigation')
                      ? 'bg-primary text-white'
                      : 'text-white/70 hover:bg-primary/20 hover:text-white'
                  )}
                >
                  <Menu className="w-4 h-4 shrink-0" />
                  {!isCollapsed && 'Navigation'}
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* System — super_admin only */}
        {role === 'super_admin' && (
          <div>
            {!isCollapsed && (
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1 px-2">
                System
              </p>
            )}
            <ul>
              <li>
                <Link
                  href="/dashboard/settings"
                  title={isCollapsed ? 'Settings' : undefined}
                  className={cn(
                    'flex items-center rounded-lg text-sm font-medium transition-colors',
                    isCollapsed
                      ? 'justify-center w-10 h-10 mx-auto'
                      : 'gap-3 px-3 py-2',
                    pathname === '/dashboard/settings'
                      ? 'bg-primary text-white'
                      : 'text-white/70 hover:bg-primary/20 hover:text-white'
                  )}
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && 'Settings'}
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* User profile */}
      <div className="px-3 py-3 border-t border-primary/30">
        {isCollapsed ? (
          <Link
            href="/member-centre/profile"
            title={`${user.name} — profile`}
            className="flex items-center justify-center rounded-lg py-2 hover:bg-white/10 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">
                {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            </div>
          </Link>
        ) : (
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
        )}
      </div>

      {/* Back to site */}
      <div className={cn('py-3 border-t border-primary/30', isCollapsed ? 'px-1' : 'px-3')}>
        <Link
          href="/"
          title={isCollapsed ? 'Back to site' : undefined}
          className={cn(
            'flex items-center rounded-lg text-white/60 hover:text-white hover:bg-primary/20 text-sm transition-colors',
            isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-2 px-3 py-2'
          )}
        >
          <ExternalLink className="w-4 h-4" />
          {!isCollapsed && 'Back to site'}
        </Link>
      </div>
    </aside>
  )
}
