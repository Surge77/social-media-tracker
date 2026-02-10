import React from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo'

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
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2026 DevTrends. Data updated daily.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/methodology"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                How it works
              </Link>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
