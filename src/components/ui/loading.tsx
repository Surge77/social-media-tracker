'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'minimal' | 'dots' | 'pulse'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}

/**
 * DevTrends branded loading animation
 * Replaces boring spinners with beautiful, on-brand loaders
 */
export function Loading({
  size = 'md',
  variant = 'default',
  className,
  text
}: LoadingProps) {
  const prefersReducedMotion = useReducedMotion()

  if (variant === 'minimal') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          {/* Minimal ring loader */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={prefersReducedMotion ? {} : {
              duration: 0.8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
        {text && <p className={cn('text-muted-foreground font-medium', textSizes[size])}>{text}</p>}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                'rounded-full bg-gradient-to-r from-orange-500 to-amber-500',
                size === 'sm' && 'w-2 h-2',
                size === 'md' && 'w-3 h-3',
                size === 'lg' && 'w-4 h-4',
                size === 'xl' && 'w-5 h-5'
              )}
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={prefersReducedMotion ? {} : {
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        {text && <p className={cn('text-muted-foreground font-medium', textSizes[size])}>{text}</p>}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <div className={cn('relative', sizeClasses[size])}>
          {/* Pulsing gradient circle */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={prefersReducedMotion ? {} : {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Inner glow */}
          <motion.div
            className="absolute inset-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 blur-sm"
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={prefersReducedMotion ? {} : {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
        {text && <p className={cn('text-muted-foreground font-medium', textSizes[size])}>{text}</p>}
      </div>
    )
  }

  // Default: Bars Loader (professional, modern, clean)
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('flex items-center justify-center gap-1', sizeClasses[size])}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full bg-primary',
              size === 'sm' && 'w-0.5',
              size === 'md' && 'w-1',
              size === 'lg' && 'w-1.5',
              size === 'xl' && 'w-2'
            )}
            style={{ height: '60%' }}
            animate={prefersReducedMotion ? {} : {
              scaleY: [1, 1.8, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={prefersReducedMotion ? {} : {
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      {text && <p className={cn('text-muted-foreground font-medium', textSizes[size])}>{text}</p>}
    </div>
  )
}

/**
 * Inline loading spinner for buttons and small spaces
 */
export function LoadingSpinner({ size = 'sm', className }: Pick<LoadingProps, 'size' | 'className'>) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'rounded-full bg-current',
            size === 'sm' && 'w-0.5 h-2',
            size === 'md' && 'w-0.5 h-3',
            size === 'lg' && 'w-1 h-4',
            size === 'xl' && 'w-1 h-5'
          )}
          animate={prefersReducedMotion ? {} : {
            scaleY: [1, 1.8, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Full-screen loading overlay
 */
export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loading size="xl" text={text || 'Loading...'} />
    </div>
  )
}

/**
 * Loading skeleton for content
 */
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-muted', className)} />
  )
}
