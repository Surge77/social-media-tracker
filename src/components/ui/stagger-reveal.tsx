'use client'

import React from 'react'
import { motion, type Variants } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Direction = 'bottom' | 'top' | 'left' | 'right'

interface StaggerRevealProps {
  children: React.ReactNode
  /** Direction children slide in from (default: 'bottom'). */
  from?: Direction
  /** Delay between each child (default: 0.06s). */
  staggerDelay?: number
  /** px offset for slide-in (default: 30). */
  offset?: number
  className?: string
}

const getInitial = (from: Direction, offset: number) => {
  switch (from) {
    case 'top': return { opacity: 0, y: -offset, scale: 0.96 }
    case 'left': return { opacity: 0, x: -offset, scale: 0.96 }
    case 'right': return { opacity: 0, x: offset, scale: 0.96 }
    case 'bottom':
    default: return { opacity: 0, y: offset, scale: 0.96 }
  }
}

export function StaggerReveal({
  children,
  from = 'bottom',
  staggerDelay = 0.06,
  offset = 30,
  className,
}: StaggerRevealProps) {
  const prefersReducedMotion = useReducedMotion()

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
      },
    },
  }

  const item: Variants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: getInitial(from, offset),
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 100, damping: 20 },
        },
      }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={className}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? (
          <motion.div variants={item}>{child}</motion.div>
        ) : child,
      )}
    </motion.div>
  )
}
