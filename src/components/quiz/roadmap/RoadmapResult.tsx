'use client'

// src/components/quiz/roadmap/RoadmapResult.tsx
// Main result container - generates and displays roadmap

import React, { useEffect, useState } from 'react'
import { Sparkles, AlertCircle } from 'lucide-react'
import { RoadmapTimeline } from './RoadmapTimeline'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getTemplateByRole } from '@/lib/quiz/roadmap-templates'
import { optimizeRoadmapWithData } from '@/lib/quiz/roadmap-optimizer'
import { generateRoadmapId } from '@/lib/quiz/roadmap-engine'
import { enhanceRoadmapWithAI } from '@/lib/quiz/roadmap-ai'
import { fetchTechnologiesWithScores } from '@/app/(dashboard)/quiz/roadmap/actions'
import type { UserContext, GeneratedRoadmap } from '@/lib/quiz/roadmap-engine'

interface RoadmapResultProps {
  answers: Record<string, string | string[]>
  onRestart?: () => void
}

export function RoadmapResult({ answers, onRestart }: RoadmapResultProps) {
  const [roadmap, setRoadmap] = useState<GeneratedRoadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateRoadmap()
  }, [answers])

  const generateRoadmap = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Build user context from answers
      const userContext: UserContext = {
        startingPoint: answers['starting-point'] as any,
        currentSkills: (answers['current-skills'] as string[]) ?? [],
        targetRole: answers['target-role'] as string,
        timeCommitment: answers['time-commitment'] as any,
        motivation: answers['motivation'] as any,
        learningStyle: answers['learning-style'] as any,
      }

      // 2. Get role template
      const template = getTemplateByRole(userContext.targetRole)
      if (!template) {
        throw new Error(`Template not found for role: ${userContext.targetRole}`)
      }

      // 3. Fetch real technology data from Supabase
      const technologies = await fetchTechnologiesWithScores()

      // 4. Optimize roadmap with real data (or fallbacks)
      const optimized = optimizeRoadmapWithData(template, userContext, technologies)

      // 5. Generate base roadmap
      let generated: GeneratedRoadmap = {
        ...optimized,
        userContext,
        template,
        generatedAt: Date.now(),
        roadmapId: generateRoadmapId(userContext),
      }

      // Show roadmap immediately (optimistic UI)
      setRoadmap(generated)

      // 6. Enhance with AI in background (non-blocking)
      try {
        const aiEnhancement = await enhanceRoadmapWithAI(generated, userContext)
        generated = { ...generated, aiEnhancement }
        setRoadmap(generated)
      } catch (aiError) {
        console.warn('[Roadmap] AI enhancement failed, using fallbacks:', aiError)
        // Already have fallback enhancement from enhanceRoadmapWithAI
      }

    } catch (err) {
      console.error('Error generating roadmap:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate roadmap')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-12">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background via-background to-primary/5 p-12">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-shimmer" />

          <div className="relative text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
              <Sparkles className="h-10 w-10 animate-pulse text-primary" />
            </div>

            <h2 className="mt-6 text-4xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Crafting Your Roadmap
            </h2>

            <p className="mt-3 text-lg text-muted-foreground">
              Analyzing thousands of job postings and developer trends
            </p>

            {/* Progress steps */}
            <div className="mx-auto mt-12 max-w-md space-y-4">
              {[
                { label: 'Loading role template', done: true },
                { label: 'Analyzing your skills', done: true },
                { label: 'Optimizing sequence', done: true },
                { label: 'Calculating timeline', done: false },
                { label: 'Applying AI insights', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-left">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    step.done ? 'bg-success text-success-foreground' : 'bg-muted animate-pulse'
                  }`}>
                    {step.done ? '✓' : '•'}
                  </div>
                  <span className={step.done ? 'text-muted-foreground' : 'font-medium'}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="p-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-2xl font-bold">Oops! Something went wrong</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <Button onClick={onRestart} className="mt-6">
              Start Over
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Success state - show roadmap
  if (!roadmap) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RoadmapTimeline roadmap={roadmap} />

        {/* Action bar - Sticky bottom on mobile */}
        <div className="sticky bottom-0 left-0 right-0 z-20 mt-12 border-t border-border bg-background/95 p-4 backdrop-blur-lg sm:relative sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onRestart}
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Start Over
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </Button>

            <Button
              size="lg"
              className="bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start Learning
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
