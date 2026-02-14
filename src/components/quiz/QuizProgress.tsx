'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface QuizProgressProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
  className?: string
}

export function QuizProgress({
  currentStep,
  totalSteps,
  labels,
  className
}: QuizProgressProps) {
  const prefersReducedMotion = useReducedMotion()
  const percentage = (currentStep / totalSteps) * 100

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress text */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Question {currentStep} of {totalSteps}
        </span>
        <span className="font-medium text-foreground">
          {Math.round(percentage)}% Complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-secondary/50 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 rounded-full"
          initial={prefersReducedMotion ? { width: `${percentage}%` } : { width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={
            prefersReducedMotion
              ? {}
              : {
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
          }
        />
      </div>

      {/* Step labels (optional) */}
      {labels && labels.length === totalSteps && (
        <div className="flex items-center justify-between pt-2">
          {labels.map((label, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep

            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center gap-1 min-w-0 flex-1',
                  'first:items-start last:items-end'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center',
                    'text-xs font-medium transition-colors',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary/20 text-primary ring-2 ring-primary',
                    !isCompleted && !isCurrent && 'bg-secondary text-muted-foreground'
                  )}
                >
                  {stepNumber}
                </div>
                <span
                  className={cn(
                    'text-xs truncate max-w-full',
                    isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                  title={label}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
