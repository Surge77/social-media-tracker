import React from 'react'
import Link from 'next/link'

const MinimalFooter = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-card/50 py-6">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-muted-foreground">
            © {currentYear} DevTrends. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/methodology"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Methodology
            </Link>
            <Link
              href="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default MinimalFooter
