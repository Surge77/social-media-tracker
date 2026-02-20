import React from 'react'
import Link from 'next/link'

const MinimalFooter = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 bg-card/50 py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-muted-foreground">
            © {currentYear} DevTrends. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/methodology"
              className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Methodology
            </Link>
            <Link
              href="/"
              className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
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
