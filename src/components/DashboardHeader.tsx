'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, LogIn, LogOut, User } from 'lucide-react'
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo'
import { MobileNav } from '@/components/MobileNav'
import { useScrolled } from '@/hooks/useScrolled'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function DashboardHeader() {
  const isScrolled = useScrolled(8)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await fetch('/auth/signout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false
    return pathname?.startsWith(path)
  }

  const navItemClass = (path: string) => 
    `block rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
      isActive(path) ? 'bg-accent/50 text-foreground font-semibold' : 'text-muted-foreground'
    }`

  const isGroupActive = (paths: string[]) => paths.some(p => isActive(p))

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/60'
          : 'border-b border-transparent bg-transparent shadow-none backdrop-blur-0'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <DevTrendsLogo size="md" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {/* Explore Dropdown */}
          <div className="group relative">
            <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground ${isGroupActive(['/technologies', '/languages', '/repos', '/blockchain', '/jobs']) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Explore <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute left-0 top-full hidden w-48 pt-2 group-hover:block">
              <div className="rounded-md border border-border bg-popover p-2 shadow-md">
                <Link href="/technologies" className={navItemClass('/technologies')}>Technologies</Link>
                <Link href="/jobs" className={navItemClass('/jobs')}>Jobs</Link>
                <Link href="/languages" className={navItemClass('/languages')}>Languages</Link>
                <Link href="/repos" className={navItemClass('/repos')}>Repositories</Link>
                <Link href="/blockchain" className={navItemClass('/blockchain')}>Blockchain</Link>
              </div>
            </div>
          </div>

          {/* Tools & Insights Dropdown */}
          <div className="group relative">
            <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground ${isGroupActive(['/compare', '/digest', '/quiz']) ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Insights <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute left-0 top-full hidden w-48 pt-2 group-hover:block">
              <div className="rounded-md border border-border bg-popover p-2 shadow-md">
                <Link href="/compare" className={navItemClass('/compare')}>Compare</Link>
                <Link href="/digest" className={navItemClass('/digest')}>Digest</Link>
                <Link href="/quiz" className={navItemClass('/quiz')}>Quizzes</Link>
              </div>
            </div>
          </div>

          {/* Single Links */}
          <Link
            href="/methodology"
            className={`text-sm font-medium transition-colors hover:text-foreground ${isActive('/methodology') ? 'text-foreground font-semibold relative after:absolute after:bottom-[-22px] after:left-0 after:h-0.5 after:w-full after:bg-primary' : 'text-muted-foreground'}`}
          >
            Methodology
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {!loading && (
            user ? (
              <div className="hidden items-center gap-2 md:flex">
                <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="max-w-[140px] truncate">{user.user_metadata?.full_name ?? user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <LogIn className="h-3.5 w-3.5" />
                  Sign in
                </Button>
              </Link>
            )
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

