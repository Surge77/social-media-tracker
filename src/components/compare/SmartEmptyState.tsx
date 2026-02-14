'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, Lightbulb, Target, TrendingUp } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

interface SmartEmptyStateProps {
  onQuickCompare?: (slugs: string[]) => void
}

// Popular comparisons based on category and common decision points
const POPULAR_COMPARISONS = [
  { name: 'React vs Vue', slugs: ['react', 'vue'], category: 'Frontend Frameworks' },
  { name: 'Python vs Go', slugs: ['python', 'go'], category: 'Backend Languages' },
  { name: 'PostgreSQL vs MongoDB', slugs: ['postgresql', 'mongodb'], category: 'Databases' },
  { name: 'Docker vs Kubernetes', slugs: ['docker', 'kubernetes'], category: 'Infrastructure' },
  { name: 'Next.js vs Remix', slugs: ['nextjs', 'remix'], category: 'Meta-frameworks' },
  { name: 'TypeScript vs JavaScript', slugs: ['typescript', 'javascript'], category: 'Core Languages' },
]

// Quick start personas
const QUICK_START_PERSONAS = [
  {
    role: 'beginner',
    goal: 'learning',
    label: 'New to Development',
    description: 'Start with beginner-friendly comparisons',
    comparison: { name: 'Python vs JavaScript', slugs: ['python', 'javascript'] },
  },
  {
    role: 'mid-level',
    goal: 'job-hunting',
    label: 'Job Hunter',
    description: 'Focus on in-demand technologies',
    comparison: { name: 'React vs Angular', slugs: ['react', 'angular'] },
  },
  {
    role: 'senior',
    goal: 'production',
    label: 'Production Decision',
    description: 'Compare enterprise-ready options',
    comparison: { name: 'AWS vs Azure', slugs: ['aws', 'azure'] },
  },
]

export function SmartEmptyState({ onQuickCompare }: SmartEmptyStateProps) {
  const prefersReducedMotion = useReducedMotion()

  const handleQuickCompare = (slugs: string[]) => {
    onQuickCompare?.(slugs)
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-8 rounded-lg border border-dashed border-border bg-muted/20 p-8"
    >
      {/* Popular Comparisons */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-md bg-orange-500/10 p-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Popular Comparisons</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_COMPARISONS.map((comparison) => (
            <motion.button
              key={comparison.name}
              onClick={() => handleQuickCompare(comparison.slugs)}
              className={cn(
                'group rounded-lg border border-border bg-card/50 p-4 text-left transition-all',
                'hover:border-primary/50 hover:bg-card hover:shadow-md'
              )}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              <p className="font-medium text-foreground group-hover:text-primary">
                {comparison.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{comparison.category}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Suggested Comparisons */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-1.5">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">You Might Want to Compare</h3>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card/30 p-4">
            <button
              onClick={() => handleQuickCompare(['typescript', 'javascript'])}
              className="group flex w-full items-start justify-between gap-4 text-left transition-colors hover:text-primary"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground group-hover:text-primary">
                  TypeScript vs JavaScript
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Most developers compare these when leveling up
                </p>
              </div>
              <TrendingUp className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
            </button>
          </div>

          <div className="rounded-lg border border-border bg-card/30 p-4">
            <button
              onClick={() => handleQuickCompare(['docker', 'kubernetes'])}
              className="group flex w-full items-start justify-between gap-4 text-left transition-colors hover:text-primary"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground group-hover:text-primary">
                  Docker vs Kubernetes
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complementary technologies often used together
                </p>
              </div>
              <TrendingUp className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Start Personas */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-md bg-emerald-500/10 p-1.5">
            <Target className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Quick Start</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_START_PERSONAS.map((persona) => (
            <motion.button
              key={persona.label}
              onClick={() => handleQuickCompare(persona.comparison.slugs)}
              className={cn(
                'group rounded-lg border border-border bg-gradient-to-br from-card to-card/50 p-4 text-left transition-all',
                'hover:border-primary/50 hover:shadow-md'
              )}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              <p className="font-semibold text-foreground group-hover:text-primary">
                {persona.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{persona.description}</p>
              <div className="mt-3 rounded-md bg-primary/5 px-2 py-1">
                <p className="text-xs font-medium text-primary">{persona.comparison.name}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Helper text */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Or use the selector above to choose your own technologies to compare
        </p>
      </div>
    </motion.div>
  )
}
