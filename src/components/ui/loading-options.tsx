'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: { container: 'w-8 h-8', bar: 'w-1', dot: 'w-2 h-2', ring: 'w-6 h-6' },
  md: { container: 'w-12 h-12', bar: 'w-1.5', dot: 'w-3 h-3', ring: 'w-10 h-10' },
  lg: { container: 'w-16 h-16', bar: 'w-2', dot: 'w-4 h-4', ring: 'w-14 h-14' },
  xl: { container: 'w-24 h-24', bar: 'w-3', dot: 'w-6 h-6', ring: 'w-20 h-20' },
}

// OPTION 1: Bars Loader (Recommended)
export function BarsLoader({ size = 'md', className }: LoaderProps) {
  const prefersReducedMotion = useReducedMotion()
  const sizes = sizeMap[size]

  return (
    <div className={cn('flex items-center justify-center gap-1', sizes.container, className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={cn('rounded-full bg-primary', sizes.bar)}
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
  )
}

// OPTION 2: Ripple Effect
export function RippleLoader({ size = 'md', className }: LoaderProps) {
  const prefersReducedMotion = useReducedMotion()
  const sizes = sizeMap[size]

  return (
    <div className={cn('relative', sizes.container, className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-primary"
          initial={{ opacity: 1, scale: 0 }}
          animate={prefersReducedMotion ? { opacity: 0.3 } : {
            opacity: [1, 0],
            scale: [0, 1],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

// OPTION 3: Grid Loader
export function GridLoader({ size = 'md', className }: LoaderProps) {
  const prefersReducedMotion = useReducedMotion()
  const sizes = sizeMap[size]

  return (
    <div className={cn('grid grid-cols-3 gap-1', sizes.container, className)}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <motion.div
          key={i}
          className={cn('rounded-sm bg-primary', sizes.dot)}
          animate={prefersReducedMotion ? {} : {
            opacity: [0.2, 1, 0.2],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// OPTION 4: Progress Ring
export function ProgressRingLoader({ size = 'md', className }: LoaderProps) {
  const prefersReducedMotion = useReducedMotion()
  const sizes = sizeMap[size]

  return (
    <div className={cn('relative', sizes.ring, className)}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-primary/20"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDasharray: '283', strokeDashoffset: '283' }}
          animate={prefersReducedMotion ? {} : {
            strokeDashoffset: [283, 0, 283],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
    </div>
  )
}

// OPTION 5: Dual Ring
export function DualRingLoader({ size = 'md', className }: LoaderProps) {
  const prefersReducedMotion = useReducedMotion()
  const sizes = sizeMap[size]

  return (
    <div className={cn('relative', sizes.ring, className)}>
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
        animate={prefersReducedMotion ? {} : { rotate: 360 }}
        transition={prefersReducedMotion ? {} : {
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Inner ring (counter-rotating) */}
      <motion.div
        className="absolute inset-2 rounded-full border-4 border-transparent border-t-primary/60"
        animate={prefersReducedMotion ? {} : { rotate: -360 }}
        transition={prefersReducedMotion ? {} : {
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

// OPTION 6: Bounce
export function BounceLoader({ size = 'md', className }: LoaderProps) {
  const prefersReducedMotion = useReducedMotion()
  const sizes = sizeMap[size]

  return (
    <div className={cn('relative', sizes.container, className)}>
      <motion.div
        className={cn('absolute left-1/2 -translate-x-1/2 rounded-full bg-primary', sizes.dot)}
        animate={prefersReducedMotion ? {} : {
          y: [0, -20, 0],
        }}
        transition={prefersReducedMotion ? {} : {
          duration: 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
