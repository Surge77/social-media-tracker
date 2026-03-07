'use client'

import React, { useEffect } from 'react'
import { LayoutGrid, Table, Grid3x3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ViewMode = 'overview' | 'table' | 'cards'

interface ViewToggleProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  useEffect(() => {
    const saved = localStorage.getItem('tech-view-mode')
    if (saved && (saved === 'overview' || saved === 'table' || saved === 'cards')) {
      onViewChange(saved)
    }
  }, [onViewChange])

  const handleChange = (newView: ViewMode) => {
    onViewChange(newView)
    localStorage.setItem('tech-view-mode', newView)
  }

  const views: { id: ViewMode; icon: React.ElementType; label: string }[] = [
    { id: 'overview', icon: LayoutGrid, label: 'Overview' },
    { id: 'table', icon: Table, label: 'Table' },
    { id: 'cards', icon: Grid3x3, label: 'Cards' },
  ]

  return (
    <div className="inline-flex rounded-2xl border border-border bg-background/80 p-1 backdrop-blur-sm">
      {views.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => handleChange(id)}
          className={cn(
            'tap-target flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
            view === id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={`${label} view`}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
