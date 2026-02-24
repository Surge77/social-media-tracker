'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { QuizContainer } from '@/components/quiz/QuizContainer'
import { TechMultiSelect } from '@/components/quiz/TechMultiSelect'
import { HypeCheckResult } from '@/components/quiz/results/HypeCheckResult'
import { Button } from '@/components/ui/button'
import { Loading, LoadingSpinner } from '@/components/ui/loading'
import type { QuizAnswer, QuizResult } from '@/lib/quiz/types'
import type { TechnologyWithScore } from '@/types'
import { analyzeHype } from '@/lib/quiz/hype-check-engine'
import { saveQuizResult } from '@/lib/quiz/storage'

export default function HypeCheckQuizPage() {
  const router = useRouter()
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [technologies, setTechnologies] = useState<TechnologyWithScore[]>([])
  const [isLoadingTech, setIsLoadingTech] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState<string>('')

  // Fetch technologies on mount
  useEffect(() => {
    async function fetchTechnologies() {
      try {
        const response = await fetch('/api/technologies')
        if (!response.ok) throw new Error('Failed to fetch technologies')
        const data = await response.json()
        setTechnologies(data.technologies || [])
      } catch (error) {
        console.error('Error fetching technologies:', error)
        setError('Failed to load technologies. Please refresh the page.')
      } finally {
        setIsLoadingTech(false)
      }
    }

    fetchTechnologies()
  }, [])

  async function handleAnalyze() {
    if (selectedTech.length === 0) {
      setError('Please select a technology to analyze')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const quizAnswers: QuizAnswer[] = [
        {
          questionId: 'technology',
          value: selectedTech[0] // Only first selection
        }
      ]

      const recommendation = await analyzeHype(quizAnswers, technologies)

      const quizResult: QuizResult = {
        quizType: 'hype-check',
        answers: quizAnswers,
        recommendation,
        completedAt: Date.now(),
        version: '1.0.0'
      }

      saveQuizResult(quizResult)
      setResult(quizResult)
    } catch (error) {
      console.error('Error analyzing hype:', error)
      setError('Failed to analyze. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  function handleRetake() {
    setSelectedTech([])
    setError('')
    setResult(null)
  }

  // Show result if available
  if (result) {
    return (
      <HypeCheckResult
        result={result}
        technologies={technologies}
        onRetake={handleRetake}
        onClose={() => router.push('/quiz')}
      />
    )
  }

  // Show loading state
  if (isLoadingTech) {
    return (
      <QuizContainer
        title="Hype or Real?"
        description="Cut through the noise and find out if a technology is worth your time"
        icon={<Zap className="w-6 h-6" />}
        gradient="from-yellow-500 via-amber-500 to-yellow-400"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Loading size="md" text="Loading technologies..." />
        </div>
      </QuizContainer>
    )
  }

  return (
    <QuizContainer
      title="Hype or Real?"
      description="Cut through the noise and find out if a technology is worth your time"
      icon={<Zap className="w-6 h-6" />}
      gradient="from-yellow-500 via-amber-500 to-yellow-400"
    >
      <div className="space-y-6">
        {/* Intro */}
        <div className="text-center space-y-2 py-4">
          <h2 className="text-2xl font-bold text-foreground">
            Everyone's talking about...
          </h2>
          <p className="text-muted-foreground">
            Select a technology and we'll tell you if it's hype or real
          </p>
        </div>

        {/* Technology Selector */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              What technology are people hyping to you?
              <span className="text-destructive ml-1">*</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Select one technology to analyze
            </p>
          </div>

          <TechMultiSelect
            technologies={technologies.map(t => ({
              slug: t.slug,
              name: t.name,
              category: t.category
            }))}
            value={selectedTech}
            onChange={(value) => {
              // Only allow single selection
              const techArray = value as string[]
              if (techArray.length > 0) {
                setSelectedTech([techArray[techArray.length - 1]])
              } else {
                setSelectedTech([])
              }
              setError('')
            }}
            max={1}
            placeholder="Search for a technology..."
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Popular suggestions */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Popular checks:
          </p>
          <div className="flex flex-wrap gap-2">
            {['bun', 'htmx', 'astro', 'deno', 'solid', 'qwik'].map((slug) => {
              const tech = technologies.find(t => t.slug === slug)
              if (!tech) return null

              return (
                <Button
                  key={slug}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTech([slug])
                    setError('')
                  }}
                  className="text-xs"
                >
                  {tech.name}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Analyze Button */}
        <div className="pt-6 border-t border-border">
          <Button
            onClick={handleAnalyze}
            disabled={selectedTech.length === 0 || isAnalyzing}
            className="w-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 text-white text-lg py-6"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Check Hype Level
              </>
            )}
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground pt-4">
          Analysis based on real market data: community buzz vs actual job demand
        </p>
      </div>
    </QuizContainer>
  )
}
