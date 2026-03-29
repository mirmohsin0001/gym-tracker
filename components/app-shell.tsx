'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Dumbbell,
  User,
  ClipboardList,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import LogoutButton from '@/components/logout-button'

const NAV = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/body', label: 'Body', icon: User },
  { href: '/logs', label: 'Logs', icon: ClipboardList },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
] as const

function navActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }
  if (href === '/dashboard/calendar') {
    return pathname.startsWith('/dashboard/calendar')
  }
  if (href === '/workouts') {
    return pathname.startsWith('/workouts')
  }
  return pathname === href
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 sm:gap-3 shrink-0 group"
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center glow-sm group-hover:bg-primary/15 transition-colors">
              <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <span className="text-lg sm:text-xl font-display font-bold tracking-tight">
              GYMTRACK
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-0.5 flex-1 justify-center max-w-2xl mx-2 lg:mx-6"
            aria-label="Main navigation"
          >
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = navActive(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="shrink-0">
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-8">
        {children}
      </main>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch justify-around min-h-[3.5rem]">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = navActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium min-w-0 px-0.5',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    active && 'drop-shadow-[0_0_10px_hsl(var(--primary)/0.35)]'
                  )}
                  aria-hidden
                />
                <span className="truncate w-full text-center leading-tight">
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
