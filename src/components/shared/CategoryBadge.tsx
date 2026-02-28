import React from 'react'
import { cn } from '@/lib/utils'
import type { TechnologyCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'

interface CategoryBadgeProps {
  category: TechnologyCategory
  className?: string
  size?: 'sm' | 'md'
}

// Terminal-inspired category colors
const CATEGORY_COLORS: Record<TechnologyCategory, string> = {
  language: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  frontend: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  backend: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  database: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  devops: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  cloud: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  mobile: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  ai_ml: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  blockchain: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

export const CategoryBadge = React.forwardRef<HTMLDivElement, CategoryBadgeProps>(
  ({ category, className, size = 'sm' }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded border font-medium',
          size === 'sm' && 'h-5 px-2 text-xs',
          size === 'md' && 'h-6 px-2.5 text-sm',
          CATEGORY_COLORS[category],
          className
        )}
      >
        {CATEGORY_LABELS[category]}
      </div>
    )
  }
)

CategoryBadge.displayName = 'CategoryBadge'
