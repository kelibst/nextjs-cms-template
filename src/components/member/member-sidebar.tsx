'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  User,
  GraduationCap,
  BookOpen,
  Users,
  CalendarDays,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { handleSignOut } from '@/app/actions/auth'

const navItems = [
  { label: 'Dashboard', href: '/member-centre', icon: LayoutDashboard, exact: true },
  { label: 'My Profile', href: '/member-centre/profile', icon: User },
  { label: 'Learning', href: '/member-centre/learning', icon: GraduationCap },
  { label: 'Publications', href: '/member-centre/publications', icon: BookOpen },
  { label: 'Member Directory', href: '/member-centre/directory', icon: Users },
  { label: 'Events', href: '/events', icon: CalendarDays },
]

export function MemberSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="sticky top-0 h-[calc(100vh-49px)] w-52 shrink-0 border-r border-border bg-card pt-6">
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                active
                  ? 'bg-primary-subtle text-primary'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        <div className="mt-4 border-t border-border/50 pt-4">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </form>
        </div>
      </nav>
    </aside>
  )
}
