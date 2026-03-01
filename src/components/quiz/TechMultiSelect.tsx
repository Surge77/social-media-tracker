'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Check, ChevronDown, ChevronRight, Hash } from 'lucide-react'
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
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})
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

  // Group by category with specific order
  const CATEGORY_ORDER = [
    'Languages',
    'Databases',
    'Backend',
    'Frontend',
    'DevOps',
    'Cloud',
    'Mobile',
    'AI/ML',
    'Blockchain',
    'Other'
  ]

  const normalizeCategory = (rawCategory?: string): string => {
    if (!rawCategory) return 'Other'

    const category = rawCategory.trim()
    const lower = category.toLowerCase()

    if (lower === 'language' || lower === 'languages') return 'Languages'
    if (lower === 'database' || lower === 'databases') return 'Databases'
    if (lower === 'backend') return 'Backend'
    if (lower === 'frontend') return 'Frontend'
    if (
      lower === 'devops' ||
      lower === 'devops/infrastructure' ||
      lower === 'cloud & devops' ||
      lower === 'cloud and devops' ||
      lower === 'infrastructure'
    ) {
      return 'DevOps'
    }
    if (lower === 'cloud') return 'Cloud'
    if (lower === 'mobile') return 'Mobile'
    if (
      lower === 'ai/ml' ||
      lower === 'ai-ml' ||
      lower === 'ai_ml' ||
      lower === 'aiml' ||
      lower.includes('machine learning')
    ) {
      return 'AI/ML'
    }
    if (lower === 'blockchain' || lower.includes('web3') || lower.includes('crypto')) {
      return 'Blockchain'
    }

    return category
  }

  const groupedTechnologies = useMemo(() => {
    const groups: Record<string, TechOption[]> = {}
    
    // Initialize groups in desired order
    CATEGORY_ORDER.forEach(cat => {
      groups[cat] = []
    })

    filteredTechnologies.forEach(tech => {
      const category = normalizeCategory(tech.category)
      
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(tech)
    })

    // Remove empty groups but keep the order
    const finalGroups: Record<string, TechOption[]> = {}
    CATEGORY_ORDER.forEach(cat => {
      if (groups[cat] && groups[cat].length > 0) {
        finalGroups[cat] = groups[cat]
      }
    })

    // Add any categories that weren't in the predefined order at the end
    Object.keys(groups).forEach(cat => {
      if (!CATEGORY_ORDER.includes(cat) && groups[cat].length > 0) {
        finalGroups[cat] = groups[cat]
      }
    })

    return finalGroups
  }, [filteredTechnologies])

  const toggleTech = (slug: string) => {
    const isSelected = value.includes(slug)
    const newValue = isSelected
      ? value.filter(v => v !== slug)
      : [...value, slug]

    // Enforce max limit
    if (!isSelected && max && value.length >= max) {
      return
    }

    onChange(newValue)
  }

  const toggleCategory = (category: string, techs: TechOption[]) => {
    const techSlugs = techs.map(t => t.slug)
    const allSelected = techSlugs.every(slug => value.includes(slug))
    
    let newValue: string[]
    if (allSelected) {
      // Deselect all in category
      newValue = value.filter(slug => !techSlugs.includes(slug))
    } else {
      // Select all in category up to max
      const currentOther = value.filter(slug => !techSlugs.includes(slug))
      const toAdd = techSlugs.filter(slug => !value.includes(slug))
      
      if (max) {
        const remaining = max - currentOther.length
        newValue = [...currentOther, ...value.filter(slug => techSlugs.includes(slug)), ...toAdd.slice(0, remaining)]
      } else {
        newValue = [...value, ...toAdd]
      }
    }
    
    onChange(newValue)
  }

  const toggleCollapse = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const removeTech = (slug: string) => {
    onChange(value.filter(v => v !== slug))
  }

  const selectedTechs = technologies.filter(t => value.includes(t.slug))

  return (
    <div className={cn('space-y-4', className)}>
      {/* Selection count and stats */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Hash className="h-3 w-3" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {value.length} selected
            {max && <span className="text-muted-foreground ml-1">of {max} max</span>}
          </p>
        </div>
        {value.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onChange([])}
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Selected technologies - more compact visualization */}
      <AnimatePresence>
        {selectedTechs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-primary/5 border border-primary/10"
          >
            {selectedTechs.map(tech => (
              <Badge
                key={tech.slug}
                variant="secondary"
                className="pl-2 pr-1 py-1 gap-1 bg-background border-primary/20 hover:border-primary/40 transition-colors"
              >
                <span className="text-xs font-medium">{tech.name}</span>
                <button
                  type="button"
                  className="rounded-full p-0.5 hover:bg-muted transition-colors"
                  onClick={() => removeTech(tech.slug)}
                >
                  <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Category Quick Filters */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 h-11 bg-muted/30 border-muted focus:bg-background transition-all"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Technology list - GRID LAYOUT */}
      <div className="max-h-[450px] overflow-y-auto rounded-xl border border-border bg-card/50 backdrop-blur-sm p-1 scrollbar-thin scrollbar-thumb-muted">
        {Object.entries(groupedTechnologies).map(([category, techs]) => {
          const isCollapsed = collapsedCategories[category] && !searchQuery
          const allInCategorySelected = techs.every(t => value.includes(t.slug))
          const someInCategorySelected = techs.some(t => value.includes(t.slug))
          
          return (
            <div key={category} className="mb-2 last:mb-0">
              <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm flex items-center justify-between px-2 py-2 mb-1 border-b border-border/50">
                <button 
                  type="button"
                  onClick={() => toggleCollapse(category)}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors group"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  )}
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                    {category}
                    <span className="ml-2 lowercase font-normal opacity-60">({techs.length})</span>
                  </h3>
                </button>
                
                {!isCollapsed && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCategory(category, techs)}
                    className={cn(
                      "h-6 px-2 text-[10px] font-bold uppercase tracking-tight",
                      allInCategorySelected ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {allInCategorySelected ? 'Deselect Category' : 'Select Category'}
                  </Button>
                )}
              </div>

              {!isCollapsed && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1.5">
                  {techs.map((tech, index) => {
                    const isSelected = value.includes(tech.slug)
                    const isDisabled = Boolean(!isSelected && max && value.length >= max)

                    return (
                      <motion.button
                        key={tech.slug}
                        type="button"
                        onClick={() => !isDisabled && toggleTech(tech.slug)}
                        disabled={isDisabled}
                        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                        animate={prefersReducedMotion ? false : { opacity: 1, scale: 1 }}
                        transition={
                          prefersReducedMotion
                            ? {}
                            : {
                                delay: Math.min(index * 0.01, 0.2),
                                duration: 0.2
                              }
                        }
                        className={cn(
                          'relative group flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all',
                          'border border-transparent',
                          isSelected 
                            ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' 
                            : 'bg-muted/30 hover:bg-muted/60 hover:border-border text-foreground/80',
                          isDisabled && 'opacity-40 cursor-not-allowed grayscale'
                        )}
                      >
                        <div className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                          isSelected ? "bg-primary border-primary" : "bg-background border-muted-foreground/30 group-hover:border-primary/50"
                        )}>
                          {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </div>
                        <span className="text-sm font-medium leading-none truncate">{tech.name}</span>
                        
                        {isSelected && !prefersReducedMotion && (
                          <motion.div
                            layoutId={`active-bg-${tech.slug}`}
                            className="absolute inset-0 rounded-lg bg-primary/5 -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {filteredTechnologies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground animate-in fade-in zoom-in duration-300">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Search className="h-6 w-6 opacity-20" />
            </div>
            <p className="font-medium">No technologies found</p>
            <p className="text-xs opacity-60">Try searching for something else</p>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => setSearchQuery('')}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        )}
      </div>
      
      {/* Help text */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50 px-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          Selected
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
          Available
        </div>
        {max && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive/50" />
            Limit: {max}
          </div>
        )}
      </div>
    </div>
  )
}
