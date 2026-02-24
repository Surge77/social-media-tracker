'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

const BINARY_FRAMES = [
  '010010', '001100', '100101', '111010', '111101',
  '010111', '101011', '111000', '110011', '110101',
]
const BINARY_INTERVAL = 80

function useBinaryFrame(paused = false) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setFrame(f => (f + 1) % BINARY_FRAMES.length), BINARY_INTERVAL)
    return () => clearInterval(id)
  }, [paused])
  return BINARY_FRAMES[frame]
}

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'minimal' | 'dots' | 'pulse'
  className?: string
  text?: string
}

const binaryFontSizes = {
  sm: '0.6rem',
  md: '0.85rem',
  lg: '1.15rem',
  xl: '1.5rem',
}

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}

/**
 * DevTrends branded loading animation
 * Default variant: binary spinner (ora/cli-spinners)
 */
export function Loading({
  size = 'md',
  variant = 'default',
  className,
  text,
}: LoadingProps) {
  const prefersReducedMotion = useReducedMotion()
  const binaryFrame = useBinaryFrame(variant !== 'default')

  if (variant === 'minimal') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <div className="relative w-8 h-8">
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
        <div className="relative w-12 h-12">
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

  // Default: binary spinner
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <span
        style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: binaryFontSizes[size],
          color: 'hsl(var(--primary))',
          letterSpacing: '0.12em',
          display: 'block',
          lineHeight: 1,
        }}
        aria-label="Loading"
        aria-live="polite"
      >
        {prefersReducedMotion ? '010010' : binaryFrame}
      </span>
      {text && <p className={cn('text-muted-foreground font-medium', textSizes[size])}>{text}</p>}
    </div>
  )
}

/**
 * Inline loading spinner for buttons and small spaces
 */
export function LoadingSpinner({ size = 'sm', className }: Pick<LoadingProps, 'size' | 'className'>) {
  const prefersReducedMotion = useReducedMotion()
  const binaryFrame = useBinaryFrame(false)

  const inlineFontSizes = {
    sm: '0.55rem',
    md: '0.7rem',
    lg: '0.85rem',
    xl: '1rem',
  }

  return (
    <span
      style={{
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: inlineFontSizes[size],
        color: 'currentColor',
        letterSpacing: '0.1em',
        lineHeight: 1,
        display: 'inline-block',
      }}
      className={className}
      aria-label="Loading"
    >
      {prefersReducedMotion ? '0101' : binaryFrame.slice(0, 4)}
    </span>
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
