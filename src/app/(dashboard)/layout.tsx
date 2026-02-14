import React from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo'
import MinimalFooter from '@/components/MinimalFooter'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <DevTrendsLogo size="md" />
          </Link>

          {/* Navigation */}
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
              href="/ask"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Ask AI
            </Link>
            <Link
              href="/monitoring"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Monitoring
            </Link>
            <Link
              href="/methodology"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Methodology
            </Link>
          </nav>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <MinimalFooter />
    </div>
  )
}
