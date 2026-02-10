'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { TechFilters } from '@/components/technologies/TechFilters'
import { TechTable } from '@/components/technologies/TechTable'
import { TechCard } from '@/components/technologies/TechCard'
import type { TechnologyCategory, TechnologyWithScore } from '@/types'

export default function TechnologiesPage() {
  const prefersReducedMotion = useReducedMotion()
  const [technologies, setTechnologies] = React.useState<TechnologyWithScore[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TechnologyCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<'score' | 'momentum' | 'name'>('score')

  // Fetch technologies
  React.useEffect(() => {
    async function fetchTechnologies() {
      try {
        const response = await fetch('/api/technologies')
        if (!response.ok) throw new Error('Failed to fetch technologies')

        const data = await response.json()
        setTechnologies(data.technologies || [])
        setLastUpdated(data.last_updated)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoading(false)
      }
    }

    fetchTechnologies()
  }, [])

  // Filter and sort technologies
  const filteredAndSorted = useMemo(() => {
    let result = [...technologies]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (tech) =>
          tech.name.toLowerCase().includes(query) ||
          tech.description.toLowerCase().includes(query) ||
          tech.slug.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((tech) => tech.category === selectedCategory)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'score') {
        const scoreA = a.composite_score ?? -1
        const scoreB = b.composite_score ?? -1
        return scoreB - scoreA
      }
      if (sortBy === 'momentum') {
        const momA = a.momentum ?? -999
        const momB = b.momentum ?? -999
        return momB - momA
      }
      // name
      return a.name.localeCompare(b.name)
    })

    return result
  }, [technologies, searchQuery, selectedCategory, sortBy])

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading technologies...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-destructive">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Technology Explorer
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track {technologies.length} technologies across 8 categories
          {lastUpdated && (
            <span className="ml-2 text-xs">
              • Last updated:{' '}
              {new Date(lastUpdated).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        <TechFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </motion.div>

      {/* Results count */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={prefersReducedMotion ? {} : { opacity: 1 }}
        transition={prefersReducedMotion ? {} : { duration: 0.3, delay: 0.2 }}
        className="mb-4"
      >
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'technology' : 'technologies'}
        </p>
      </motion.div>

      {/* Desktop Table */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.2 }}
        className="hidden md:block"
      >
        <TechTable technologies={filteredAndSorted} />
      </motion.div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:hidden">
        {filteredAndSorted.map((tech, index) => (
          <TechCard key={tech.id} technology={tech} index={index} />
        ))}
      </div>
    </div>
  )
}
