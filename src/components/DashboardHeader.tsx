'use client'

import Link from 'next/link'
import { ThemePrismSwitch } from '@/components/ThemePrismSwitch'
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo'
import { MobileNav } from '@/components/MobileNav'
import { useScrolled } from '@/hooks/useScrolled'

export function DashboardHeader() {
  const isScrolled = useScrolled(8)

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
          <Link
            href="/technologies"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Technologies
          </Link>
          <Link
            href="/compare"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Compare
          </Link>
          <Link
            href="/quiz"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Quizzes
          </Link>
          <Link
            href="/digest"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Digest
          </Link>
          <Link
            href="/repos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Repos
          </Link>
          <Link
            href="/languages"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Languages
          </Link>
          <Link
            href="/blockchain"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Blockchain
          </Link>
          <Link
            href="/methodology"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Methodology
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemePrismSwitch />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

