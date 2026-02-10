'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TechnologyCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'

interface TechFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: TechnologyCategory | 'all'
  onCategoryChange: (category: TechnologyCategory | 'all') => void
  sortBy: 'score' | 'momentum' | 'name'
  onSortChange: (sort: 'score' | 'momentum' | 'name') => void
  className?: string
}

export const TechFilters = React.forwardRef<HTMLDivElement, TechFiltersProps>(
  (
    {
      searchQuery,
      onSearchChange,
      selectedCategory,
      onCategoryChange,
      sortBy,
      onSortChange,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
          className
        )}
      >
        {/* Search */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search technologies..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              'h-9 w-full rounded-md border border-border bg-background/50 pl-9 pr-3 text-sm',
              'placeholder:text-muted-foreground',
              'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
              'transition-colors'
            )}
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as TechnologyCategory | 'all')}
            className={cn(
              'h-9 rounded-md border border-border bg-background/50 px-3 text-sm',
              'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
              'transition-colors cursor-pointer'
            )}
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'score' | 'momentum' | 'name')}
            className={cn(
              'h-9 rounded-md border border-border bg-background/50 px-3 text-sm',
              'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
              'transition-colors cursor-pointer'
            )}
          >
            <option value="score">Sort by Score</option>
            <option value="momentum">Sort by Momentum</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>
    )
  }
)

TechFilters.displayName = 'TechFilters'
