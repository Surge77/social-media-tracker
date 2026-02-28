'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Zap, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle,
  ExternalLink, RotateCcw, BookOpen,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { QuizContainer } from '@/components/quiz/QuizContainer'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { Button } from '@/components/ui/button'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  WEB3_PATH_QUESTIONS,
  computeWeb3PathRecommendation,
} from '@/lib/quiz/web3-path-engine'
import { saveQuizResult } from '@/lib/quiz/storage'
import type { QuizAnswer, QuizResult } from '@/lib/quiz/types'
import Link from 'next/link'

const GRADIENT = 'from-violet-600 via-purple-500 to-indigo-500'

// ─── Result view ─────────────────────────────────────────────────────────────

function Web3PathResult({
  result,
  onRetake,
  onClose,
}: {
  result: QuizResult
  onRetake: () => void
  onClose: () => void
}) {
  const prefersReducedMotion = useReducedMotion()
  const { recommendation } = result

  const itemVariants = {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <QuizContainer
      title="Your Web3 Path"
      description="Personalised blockchain career recommendation"
      icon={<Zap className="w-6 h-6" />}
      gradient={GRADIENT}
      onClose={onClose}
    >
      <motion.div
        className="space-y-6"
        initial={prefersReducedMotion ? false : 'hidden'}
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {/* Primary recommendation */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-6"
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-400">
            Recommended path
          </p>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            {recommendation.primary.action}
          </h2>

          {recommendation.primary.timeline && (
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300">
              ⏱ ~{recommendation.primary.timeline} to first deployed contract
            </p>
          )}

          <ul className="space-y-2">
            {recommendation.primary.reasoning.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                {r}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Warnings */}
        {recommendation.warnings && recommendation.warnings.length > 0 && (
          <motion.div
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-4"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div className="space-y-1">
                {recommendation.warnings.map((w, i) => (
                  <p key={i} className="text-sm text-amber-200">{w}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Learning roadmap */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="rounded-xl border bg-card p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Your learning roadmap</h3>
          </div>
          <ol className="space-y-2">
            {recommendation.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-400">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Alternative */}
        {recommendation.secondary && (
          <motion.div
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="rounded-lg border bg-muted/30 p-4"
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Alternative path
            </p>
            <p className="mb-1 text-sm font-medium text-foreground">
              {recommendation.secondary.action}
            </p>
            {recommendation.secondary.reasoning.map((r, i) => (
              <p key={i} className="text-xs text-muted-foreground">{r}</p>
            ))}
          </motion.div>
        )}

        {/* Related links */}
        {recommendation.relatedLinks.length > 0 && (
          <motion.div
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="flex flex-wrap gap-2"
          >
            {recommendation.relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                {link.label}
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </Link>
            ))}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="flex items-center gap-3 border-t border-border pt-4"
        >
          <Button variant="outline" size="sm" onClick={onRetake}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Retake quiz
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            ← All quizzes
          </Button>
        </motion.div>
      </motion.div>
    </QuizContainer>
  )
}

// ─── Main quiz page ───────────────────────────────────────────────────────────

export default function Web3PathQuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<QuizResult | null>(null)

  const currentQuestion = WEB3_PATH_QUESTIONS[currentStep]
  const isLastQuestion = currentStep === WEB3_PATH_QUESTIONS.length - 1
  const canGoBack = currentStep > 0
  const canGoNext = Boolean(answers[currentQuestion.id])

  function handleAnswerChange(value: unknown) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[currentQuestion.id]
      return next
    })
  }

  function handleNext() {
    if (!canGoNext) {
      setErrors((prev) => ({ ...prev, [currentQuestion.id]: 'Please select an option' }))
      return
    }
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  function handleBack() {
    if (canGoBack) setCurrentStep((s) => s - 1)
  }

  function handleSubmit() {
    const quizAnswers: QuizAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value: value as string | string[] | number,
    }))

    const recommendation = computeWeb3PathRecommendation(quizAnswers)

    const quizResult: QuizResult = {
      quizType:    'web3-path',
      answers:     quizAnswers,
      recommendation,
      completedAt: Date.now(),
      version:     '1.0.0',
    }

    saveQuizResult(quizResult)
    setResult(quizResult)
  }

  function handleRetake() {
    setCurrentStep(0)
    setAnswers({})
    setErrors({})
    setResult(null)
  }

  if (result) {
    return (
      <Web3PathResult
        result={result}
        onRetake={handleRetake}
        onClose={() => router.push('/quiz')}
      />
    )
  }

  return (
    <QuizContainer
      title="Find Your Web3 Path"
      description="5 questions — get a personalised chain + language recommendation"
      icon={<Zap className="w-6 h-6" />}
      gradient={GRADIENT}
    >
      {/* Progress */}
      <div className="mb-8">
        <QuizProgress
          currentStep={currentStep + 1}
          totalSteps={WEB3_PATH_QUESTIONS.length}
        />
      </div>

      {/* Question */}
      <div className="mb-8">
        <QuizQuestion
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={handleAnswerChange}
          error={errors[currentQuestion.id]}
          onAutoAdvance={!isLastQuestion ? handleNext : undefined}
        />
      </div>

      {/* Submit error */}
      {errors.submit && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button variant="ghost" onClick={handleBack} disabled={!canGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 text-white"
        >
          {isLastQuestion ? (
            'Get Recommendation'
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </QuizContainer>
  )
}
