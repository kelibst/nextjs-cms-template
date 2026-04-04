'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight, User, Settings, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { handleSignOut } from '@/app/actions/auth'

const sectionLabels: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/posts': 'Posts',
  '/dashboard/announcements': 'Announcements',
  '/dashboard/events': 'Events',
  '/dashboard/members': 'Members',
  '/dashboard/leadership': 'Leadership',
  '/dashboard/gallery': 'Gallery',
  '/dashboard/publications': 'Publications',
  '/dashboard/contact': 'Contact',
  '/dashboard/settings': 'Settings',
}

const roleBadgeColor: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  editor: 'bg-primary-muted text-primary',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface TopbarProps {
  user: {
    name?: string | null
    email?: string | null
    role: string
  }
}

export function DashboardTopbar({ user }: TopbarProps) {
  const pathname = usePathname()

  const section = Object.keys(sectionLabels)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname.startsWith(k))

  const label = section ? sectionLabels[section] : 'Dashboard'

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Dashboard</span>
        {label !== 'Overview' && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{label}</span>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-green-700 text-white">
                  {getInitials(user.name ?? '')}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">{user.name ?? user.email}</span>
              <span
                className={`hidden sm:inline text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                  roleBadgeColor[user.role] ?? 'bg-muted text-muted-foreground'
                }`}
              >
                {user.role.replace('_', ' ')}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/member-centre/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={handleSignOut}>
                <button type="submit" className="flex items-center gap-2 w-full text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
