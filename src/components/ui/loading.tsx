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

  // Default: Orbital loader (most visually appealing)
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Central core */}
        <motion.div
          className="absolute inset-0 m-auto w-1/3 h-1/3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.2, 1],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={prefersReducedMotion ? {} : {
              duration: 2.5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.3,
            }}
          >
            <div
              className={cn(
                'absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500',
                size === 'sm' && 'w-1 h-1',
                size === 'md' && 'w-1.5 h-1.5',
                size === 'lg' && 'w-2 h-2',
                size === 'xl' && 'w-3 h-3'
              )}
              style={{ opacity: 1 - i * 0.25 }}
            />
          </motion.div>
        ))}

        {/* Outer ring with gradient */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, rgba(249, 115, 22, 0.3) 50%, transparent 100%)',
          }}
          animate={prefersReducedMotion ? {} : { rotate: 360 }}
          transition={prefersReducedMotion ? {} : {
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
      {text && <p className={cn('text-muted-foreground font-medium animate-pulse', textSizes[size])}>{text}</p>}
    </div>
  )
}

/**
 * Inline loading spinner for buttons and small spaces
 */
export function LoadingSpinner({ size = 'sm', className }: Pick<LoadingProps, 'size' | 'className'>) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className={cn('rounded-full border-2 border-primary/20 border-t-primary', sizeClasses[size], className)}
      animate={prefersReducedMotion ? {} : { rotate: 360 }}
      transition={prefersReducedMotion ? {} : {
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
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
