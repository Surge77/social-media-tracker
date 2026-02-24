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
    <div className={cn('overflow-hidden rounded-lg border border-border/50 bg-[#0d1117] dark:bg-[#0d1117]', className)}>
      {/* macOS-style title bar */}
      <div className="flex items-center gap-1.5 border-b border-border/30 bg-[#161b22] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" aria-hidden />
        <span className="ml-3 font-mono text-[11px] text-zinc-500">
          devtrends<span className="text-zinc-600"> — </span>{title}
        </span>
        <span className="ml-auto font-mono text-[10px] text-zinc-600">●</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}
