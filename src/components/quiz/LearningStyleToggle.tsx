'use client'

import React, { useEffect, useState } from 'react'
import { Play, BookOpen, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export type LearningMode = 'video' | 'docs' | 'project'

interface LearningStyleToggleProps {
  value: LearningMode
  onChange: (mode: LearningMode) => void
  className?: string
}

const STORAGE_KEY = 'devtrends_learning_style'

export function LearningStyleToggle({ value, onChange, className }: LearningStyleToggleProps) {
  const modes: Array<{ id: LearningMode; icon: React.ElementType; label: string }> = [
    { id: 'video', icon: Play, label: 'Video' },
    { id: 'docs', icon: BookOpen, label: 'Docs' },
    { id: 'project', icon: Zap, label: 'Project' },
  ]

  const handleChange = (mode: LearningMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // storage unavailable
    }
    onChange(mode)
  }

  return (
    <div className={cn('flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/50 w-fit', className)}>
      {modes.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => handleChange(id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
            value === id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
          aria-pressed={value === id}
        >
          <Icon className="w-3 h-3" />
          {label}
        </button>
      ))}
    </div>
  )
}

/** Hook to initialize learning mode from localStorage */
export function useLearningMode(defaultMode: LearningMode = 'video'): [LearningMode, (m: LearningMode) => void] {
  const [mode, setMode] = useState<LearningMode>(defaultMode)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LearningMode | null
      if (stored && ['video', 'docs', 'project'].includes(stored)) {
        setMode(stored)
      }
    } catch {
      // storage unavailable
    }
  }, [])

  const updateMode = (m: LearningMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, m)
    } catch {
      // storage unavailable
    }
    setMode(m)
  }

  return [mode, updateMode]
}
