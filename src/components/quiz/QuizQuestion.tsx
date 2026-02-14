'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Icons from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { QuizQuestion as QuizQuestionType } from '@/lib/quiz/types'

interface QuizQuestionProps {
  question: QuizQuestionType
  value: unknown
  onChange: (value: unknown) => void
  error?: string
}

export function QuizQuestion({
  question,
  value,
  onChange,
  error
}: QuizQuestionProps) {
  const prefersReducedMotion = useReducedMotion()

  const questionVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={prefersReducedMotion ? false : 'enter'}
        animate={prefersReducedMotion ? false : 'center'}
        exit={prefersReducedMotion ? undefined : 'exit'}
        variants={prefersReducedMotion ? undefined : questionVariants}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Question header */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-foreground">
            {question.question}
            {question.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
          {question.description && (
            <p className="text-sm text-muted-foreground">
              {question.description}
            </p>
          )}
        </div>

        {/* Question input based on type */}
        {question.type === 'single-select' && (
          <SingleSelect
            options={question.options || []}
            value={value as string}
            onChange={onChange}
          />
        )}

        {question.type === 'multi-select' && (
          <MultiSelect
            options={question.options || []}
            value={value as string[]}
            onChange={onChange}
            min={question.min}
            max={question.max}
          />
        )}

        {question.type === 'slider' && (
          <SliderInput
            value={value as number}
            onChange={onChange}
            min={question.min || 0}
            max={question.max || 100}
          />
        )}

        {question.type === 'text' && (
          <TextInput
            value={value as string}
            onChange={onChange}
            placeholder={question.placeholder}
          />
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Single Select Component
function SingleSelect({
  options,
  value,
  onChange
}: {
  options: Array<{ value: string; label: string; description?: string; icon?: string }>
  value: string
  onChange: (value: unknown) => void
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((option, index) => {
        const isSelected = value === option.value
        const IconComponent = option.icon ? (Icons as any)[option.icon] : null

        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
            transition={
              prefersReducedMotion
                ? {}
                : {
                    delay: index * 0.05,
                    duration: 0.3
                  }
            }
            className={cn(
              'relative p-4 rounded-xl border-2 text-left transition-all',
              'hover:border-primary/50 hover:shadow-md',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isSelected
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border bg-card'
            )}
          >
            <div className="flex items-start gap-3">
              {IconComponent && (
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    'font-medium mb-1',
                    isSelected ? 'text-foreground' : 'text-foreground/80'
                  )}
                >
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                )}
              </div>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0 }}
                animate={prefersReducedMotion ? {} : { scale: 1 }}
                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Icons.Check className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

// Multi Select Component
function MultiSelect({
  options,
  value = [],
  onChange,
  min,
  max
}: {
  options: Array<{ value: string; label: string; description?: string; icon?: string }>
  value: string[]
  onChange: (value: unknown) => void
  min?: number
  max?: number
}) {
  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }

  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="space-y-3">
      {min && max && (
        <p className="text-sm text-muted-foreground">
          Select {min}-{max} options ({value.length} selected)
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option, index) => {
          const isSelected = value.includes(option.value)
          const IconComponent = option.icon ? (Icons as any)[option.icon] : null

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => toggleOption(option.value)}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? {}
                  : {
                      delay: index * 0.05,
                      duration: 0.3
                    }
              }
              className={cn(
                'relative p-4 rounded-xl border-2 text-left transition-all',
                'hover:border-primary/50 hover:shadow-md',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card'
              )}
            >
              <div className="flex items-start gap-3">
                {IconComponent && (
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    )}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      'font-medium mb-1',
                      isSelected ? 'text-foreground' : 'text-foreground/80'
                    )}
                  >
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={prefersReducedMotion ? false : { scale: 0 }}
                  animate={prefersReducedMotion ? false : { scale: 1 }}
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Icons.Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// Slider Input Component
function SliderInput({
  value = 0,
  onChange,
  min = 0,
  max = 100
}: {
  value: number
  onChange: (value: unknown) => void
  min: number
  max: number
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{min}</span>
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer slider"
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}

// Text Input Component
function TextInput({
  value = '',
  onChange,
  placeholder
}: {
  value: string
  onChange: (value: unknown) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full px-4 py-3 rounded-xl border-2 border-border bg-card',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'transition-all text-foreground placeholder:text-muted-foreground'
      )}
    />
  )
}
