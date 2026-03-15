import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface JobsSectionHeaderProps {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function JobsSectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: JobsSectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {eyebrow}
        </p>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-[15px]">
            {description}
          </p>
        </div>
      </div>
      {action}
    </div>
  )
}
