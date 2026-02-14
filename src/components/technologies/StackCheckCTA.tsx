'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Activity, X, Plus, ArrowRight } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TechnologyWithScore } from '@/types'
import { cn } from '@/lib/utils'

interface StackCheckCTAProps {
  technologies: TechnologyWithScore[]
}

export function StackCheckCTA({ technologies }: StackCheckCTAProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [selectedTechs, setSelectedTechs] = useState<TechnologyWithScore[]>([])
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const MAX_TECHS = 5

  // Filter suggestions based on input
  const suggestions = inputValue.trim()
    ? technologies
        .filter(
          t =>
            !selectedTechs.find(s => s.id === t.id) &&
            t.name.toLowerCase().includes(inputValue.toLowerCase())
        )
        .slice(0, 8)
    : []

  const handleAddTech = (tech: TechnologyWithScore) => {
    if (selectedTechs.length < MAX_TECHS && !selectedTechs.find(t => t.id === tech.id)) {
      setSelectedTechs([...selectedTechs, tech])
      setInputValue('')
      setShowSuggestions(false)
      inputRef.current?.focus()
    }
  }

  const handleRemoveTech = (techId: string) => {
    setSelectedTechs(selectedTechs.filter(t => t.id !== techId))
  }

  const handleCheckStack = () => {
    if (selectedTechs.length === 0) return

    const slugs = selectedTechs.map(t => t.slug).join(',')
    router.push(`/compare?techs=${slugs}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleAddTech(suggestions[0])
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedOutsideInput = inputRef.current && !inputRef.current.contains(target)
      const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target)

      if (clickedOutsideInput && clickedOutsideDropdown) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-10"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border-2 p-8',
          'bg-gradient-to-br from-card via-card to-primary/5',
          'border-primary/20 shadow-lg shadow-primary/10'
        )}
      >
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Is Your Tech Stack Still Relevant?</h3>
          </div>

          <p className="mb-6 text-sm text-muted-foreground">
            Enter what you know and we&apos;ll give you an honest assessment — no signup required.
          </p>

          {/* Selected tech pills */}
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedTechs.map(tech => (
              <div
                key={tech.id}
                className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm"
              >
                <span style={{ color: tech.color }}>{tech.name}</span>
                <button
                  onClick={() => handleRemoveTech(tech.id)}
                  className="rounded-full hover:bg-secondary-foreground/10"
                  aria-label={`Remove ${tech.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Add tech input */}
            {selectedTechs.length < MAX_TECHS && (
              <div className="relative">
                <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => {
                      setInputValue(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add tech"
                    className="w-32 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-2 shadow-lg"
                  >
                    {suggestions.map(tech => (
                      <button
                        key={tech.id}
                        onClick={() => handleAddTech(tech)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                      >
                        <span style={{ color: tech.color }}>{tech.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {tech.composite_score?.toFixed(0) ?? '--'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTechs.length >= MAX_TECHS && (
              <span className="flex items-center text-xs text-muted-foreground">
                (max {MAX_TECHS} reached)
              </span>
            )}
          </div>

          {/* Check button */}
          <button
            onClick={handleCheckStack}
            disabled={selectedTechs.length === 0}
            className={cn(
              'group flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all',
              selectedTechs.length === 0
                ? 'cursor-not-allowed opacity-50'
                : 'hover:shadow-lg hover:shadow-primary/25'
            )}
          >
            Check My Stack
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Background decoration */}
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
      </div>
    </motion.div>
  )
}
