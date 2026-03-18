'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface TerminalCardProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export function TerminalCard({ children, title = 'analysis', className }: TerminalCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border/60 bg-card/95 shadow-[var(--shadow-card)]',
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-border/40 bg-gradient-to-r from-secondary/80 via-secondary/55 to-transparent px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" aria-hidden />
        <span className="ml-3 font-mono text-[11px] text-card-foreground/55">
          devtrends<span className="text-card-foreground/35"> / </span>{title}
        </span>
        <span className="ml-auto font-mono text-[10px] text-card-foreground/35">ready</span>
      </div>
      <div className="bg-gradient-to-br from-card via-background/80 to-secondary/25 p-4">{children}</div>
    </div>
  )
}
