'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Button } from '@/components/ui/button'

interface QuizContainerProps {
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
  onClose?: () => void
  showBackButton?: boolean
  children: React.ReactNode
  className?: string
}

export function QuizContainer({
  title,
  description,
  icon,
  gradient,
  onClose,
  showBackButton = true,
  children,
  className
}: QuizContainerProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()

  const handleBack = () => {
    if (onClose) {
      onClose()
    } else {
      router.push('/quiz')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    }
  }

  return (
    <div className="min-h-screen bg-background px-3 py-6 sm:px-4 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={prefersReducedMotion ? false : 'hidden'}
          animate={prefersReducedMotion ? false : 'visible'}
          variants={prefersReducedMotion ? undefined : containerVariants}
          className={cn(
            'relative rounded-2xl border border-border/50 overflow-hidden',
            'bg-card/90 backdrop-blur-2xl shadow-lg',
            className
          )}
        >
          {/* Gradient background */}
          <div
            className={cn(
              'absolute inset-0 opacity-5',
              gradient
            )}
            aria-hidden="true"
          />

          {/* Header */}
          <div className="relative border-b border-border/50 p-4 sm:p-6 md:p-8">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex flex-1 items-start gap-3 sm:gap-4">
                <div
                  className={cn(
                    'h-10 w-10 shrink-0 rounded-xl sm:h-12 sm:w-12 flex items-center justify-center',
                    'bg-gradient-to-br',
                    gradient,
                    'text-white shadow-lg'
                  )}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="mb-1.5 text-xl font-bold text-foreground sm:mb-2 sm:text-2xl md:text-3xl">
                    {title}
                  </h1>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {description}
                  </p>
                </div>
              </div>

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
                aria-label="Close quiz"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Back button */}
            {showBackButton && (
              <Link
                href="/quiz"
                className={cn(
                  'inline-flex items-center gap-2 mt-4',
                  'text-sm text-muted-foreground hover:text-foreground',
                  'transition-colors'
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all quizzes
              </Link>
            )}
          </div>

          {/* Content */}
          <div className="relative p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
