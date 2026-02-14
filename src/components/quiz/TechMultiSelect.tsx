'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface TechOption {
  slug: string
  name: string
  category?: string
}

interface TechMultiSelectProps {
  technologies: TechOption[]
  value: string[]
  onChange: (value: string[]) => void
  min?: number
  max?: number
  placeholder?: string
  className?: string
}

export function TechMultiSelect({
  technologies,
  value = [],
  onChange,
  min,
  max,
  placeholder = 'Search technologies...',
  className
}: TechMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const prefersReducedMotion = useReducedMotion()

  // Filter technologies based on search
  const filteredTechnologies = useMemo(() => {
    if (!searchQuery.trim()) return technologies

    const query = searchQuery.toLowerCase()
    return technologies.filter(
      tech =>
        tech.name.toLowerCase().includes(query) ||
        tech.category?.toLowerCase().includes(query) ||
        tech.slug.toLowerCase().includes(query)
    )
  }, [technologies, searchQuery])

  // Group by category
  const groupedTechnologies = useMemo(() => {
    const groups: Record<string, TechOption[]> = {}
    filteredTechnologies.forEach(tech => {
      const category = tech.category || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(tech)
    })
    return groups
  }, [filteredTechnologies])

  const toggleTech = (slug: string) => {
    const newValue = value.includes(slug)
      ? value.filter(v => v !== slug)
      : [...value, slug]

    // Enforce max limit
    if (max && newValue.length > max) {
      return
    }

    onChange(newValue)
  }

  const removeTech = (slug: string) => {
    onChange(value.filter(v => v !== slug))
  }

  const selectedTechs = technologies.filter(t => value.includes(t.slug))

  return (
    <div className={cn('space-y-4', className)}>
      {/* Selection count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {min && max ? (
            <>Select {min}-{max} technologies</>
          ) : (
            <>Select technologies</>
          )}
        </p>
        <span className="text-sm font-medium text-foreground">
          {value.length} selected
          {max && ` / ${max} max`}
        </span>
      </div>

      {/* Selected technologies */}
      {selectedTechs.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-secondary/30 border border-border">
          {selectedTechs.map(tech => (
            <Badge
              key={tech.slug}
              variant="secondary"
              className="pl-3 pr-1 py-1.5 gap-1"
            >
              <span>{tech.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTech(tech.slug)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Technology list */}
      <div className="max-h-96 overflow-y-auto rounded-xl border border-border bg-card p-2 space-y-4">
        {Object.entries(groupedTechnologies).map(([category, techs]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
              {category}
            </h3>
            <div className="space-y-1">
              {techs.map((tech, index) => {
                const isSelected = value.includes(tech.slug)
                const isDisabled = Boolean(!isSelected && max && value.length >= max)

                return (
                  <motion.button
                    key={tech.slug}
                    type="button"
                    onClick={() => !isDisabled && toggleTech(tech.slug)}
                    disabled={isDisabled}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                    animate={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
                    transition={
                      prefersReducedMotion
                        ? {}
                        : {
                            delay: index * 0.02,
                            duration: 0.2
                          }
                    }
                    className={cn(
                      'w-full flex items-center justify-between',
                      'px-3 py-2 rounded-lg text-left',
                      'transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      isSelected && 'bg-primary/10 text-foreground',
                      !isSelected && !isDisabled && 'hover:bg-secondary text-foreground/80',
                      isDisabled && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <span className="font-medium">{tech.name}</span>
                    {isSelected && (
                      <motion.div
                        initial={prefersReducedMotion ? false : { scale: 0 }}
                        animate={prefersReducedMotion ? false : { scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}

        {filteredTechnologies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No technologies found matching &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </div>
    </div>
  )
}
