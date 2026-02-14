'use client'

import React, { Suspense, useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Share2, Copy, Check, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAIComparison } from '@/hooks/useAIComparison'
import { TechSelector } from '@/components/compare/TechSelector'
import { CompareChart } from '@/components/compare/CompareChart'
import { CompareTable } from '@/components/compare/CompareTable'
import { AIComparisonCard, AIComparisonSkeleton, AIComparisonError } from '@/components/ai/AIComparisonCard'
import { FeedbackButtons } from '@/components/ai/FeedbackButtons'
import { getComparisonSummary } from '@/lib/insights'
import type { TechnologyWithScore, CompareData } from '@/types'

export function ComparePageClient() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex min-h-[600px] items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading comparison...</p>
            </div>
          </div>
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  )
}

function ComparePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefersReducedMotion = useReducedMotion()

  const [allTechnologies, setAllTechnologies] = useState<TechnologyWithScore[]>([])
  const [compareData, setCompareData] = useState<CompareData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Get selected slugs from URL
  const techsParam = searchParams?.get('techs')
  const selectedSlugs = techsParam ? techsParam.split(',').filter(Boolean) : []

  // AI comparison hook
  const aiComparison = useAIComparison(selectedSlugs.length >= 2 ? selectedSlugs : [])

  // Fetch all technologies for selector
  useEffect(() => {
    async function fetchTechnologies() {
      try {
        const response = await fetch('/api/technologies')
        if (!response.ok) throw new Error('Failed to fetch technologies')

        const data = await response.json()
        setAllTechnologies(data.technologies || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    fetchTechnologies()
  }, [])

  // Fetch comparison data when selections change
  useEffect(() => {
    // Don't fetch if less than 2 technologies selected
    if (selectedSlugs.length < 2) {
      setCompareData(null)
      setIsLoading(false)
      return
    }

    async function fetchCompareData() {
      setIsLoading(true)
      setError(null) // Clear any previous errors
      try {
        const response = await fetch(`/api/compare?techs=${selectedSlugs.join(',')}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch comparison data')
        }

        const data = await response.json()
        setCompareData(data)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoading(false)
      }
    }

    fetchCompareData()
  }, [selectedSlugs.join(',')])

  // Update URL when selections change
  const updateURL = (slugs: string[]) => {
    if (slugs.length === 0) {
      router.push('/compare')
    } else {
      router.push(`/compare?techs=${slugs.join(',')}`)
    }
  }

  const handleAdd = (slug: string) => {
    updateURL([...selectedSlugs, slug])
  }

  const handleRemove = (slug: string) => {
    updateURL(selectedSlugs.filter((s) => s !== slug))
  }

  // Share link functionality
  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Prepare chart data
  const chartTechnologies = useMemo(() => {
    if (!compareData) return []
    return compareData.technologies.map((tech) => ({
      slug: tech.slug,
      name: tech.name,
      color: tech.color,
    }))
  }, [compareData])

  // Don't show error page if we just don't have technologies selected
  const showErrorPage = error && selectedSlugs.length >= 2

  if (showErrorPage) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-destructive">Error: {error}</p>
            <button
              onClick={() => {
                setError(null)
                window.location.reload()
              }}
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Compare Technologies
            </h1>
            <p className="mt-2 text-muted-foreground">
              Side-by-side comparison of technology trends and metrics
            </p>
          </div>

          {selectedSlugs.length >= 2 && (
            <button
              onClick={handleShare}
              className={cn(
                'inline-flex items-center gap-2 rounded-md border border-border bg-card/50 px-4 py-2',
                'text-sm font-medium text-foreground transition-all hover:bg-card hover:border-primary/50'
              )}
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  Share Comparison
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* Tech Selector */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.1 }}
        className="relative z-20 mb-8 rounded-lg border border-border bg-card/30 p-4"
      >
        <TechSelector
          availableTechnologies={allTechnologies}
          selectedSlugs={selectedSlugs}
          onAdd={handleAdd}
          onRemove={handleRemove}
          maxSelections={4}
        />
      </motion.div>

      {/* Empty state */}
      {selectedSlugs.length === 0 && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.2 }}
          className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20"
        >
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Select technologies to compare</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose 2-4 technologies from the selector above
            </p>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && selectedSlugs.length > 0 && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading comparison data...</p>
          </div>
        </div>
      )}

      {/* Comparison content */}
      {!isLoading && compareData && compareData.technologies.length >= 2 && (
        <>
          {/* AI Comparison Summary */}
          <motion.section
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.15 }}
            className="mb-8"
          >
            {aiComparison.isLoading && <AIComparisonSkeleton />}

            {aiComparison.error && !aiComparison.comparison && (
              <AIComparisonError error={aiComparison.error} onRetry={aiComparison.refetch} />
            )}

            {aiComparison.comparison && (
              <AIComparisonCard
                comparison={aiComparison.comparison}
                cached={aiComparison.cached}
              >
                <FeedbackButtons insightId={`compare_${selectedSlugs.sort().join('+')}`} />
              </AIComparisonCard>
            )}

            {/* Fallback: template summary if AI unavailable */}
            {!aiComparison.isLoading && !aiComparison.comparison && !aiComparison.error && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="mb-1 text-sm font-semibold text-foreground">Bottom Line</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {getComparisonSummary(
                        compareData.technologies.map((t) => ({
                          name: t.name,
                          compositeScore: t.composite_score,
                          momentum: t.momentum,
                          githubScore: t.github_score,
                          communityScore: t.community_score,
                          jobsScore: t.jobs_score,
                          ecosystemScore: t.ecosystem_score,
                          dataCompleteness: t.data_completeness,
                        }))
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.section>

          {/* Trend Chart */}
          <motion.section
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.25 }}
            className="mb-8"
          >
            <h2 className="mb-4 text-xl font-semibold text-foreground">30-Day Trend</h2>
            <div className="rounded-lg border border-border bg-card/30 p-4">
              <CompareChart
                data={compareData.chart_data}
                technologies={chartTechnologies}
              />
            </div>
          </motion.section>

          {/* Dimension Breakdown */}
          <motion.section
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.35 }}
          >
            <h2 className="mb-4 text-xl font-semibold text-foreground">How They Stack Up</h2>
            <CompareTable technologies={compareData.technologies} />
          </motion.section>
        </>
      )}

      {/* Single tech selected */}
      {!isLoading && selectedSlugs.length === 1 && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.2 }}
          className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20"
        >
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">Add at least one more technology</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Comparisons require 2-4 technologies
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
