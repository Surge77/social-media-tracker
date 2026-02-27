'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

type Direction = 'up' | 'down' | 'left' | 'right'
type TagName = keyof React.JSX.IntrinsicElements

interface TextAnimationProps {
  text: string
  classname?: string
  variants?: Variants
  as?: TagName
  letterAnime?: boolean
  lineAnime?: boolean
  direction?: Direction
}

const directionVariants = (direction: Direction): Variants => {
  const initial: Record<string, number> = {}
  if (direction === 'up')    initial.y = 30
  if (direction === 'down')  initial.y = -30
  if (direction === 'left')  initial.x = 30
  if (direction === 'right') initial.x = -30

  return {
    hidden:  { ...initial, opacity: 0, filter: 'blur(4px)' },
    visible: {
      x: 0, y: 0, opacity: 1, filter: 'blur(0px)',
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  }
}

const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04 } },
}

export default function TextAnimation({
  text,
  classname,
  variants,
  as: Tag = 'h1',
  letterAnime = false,
  lineAnime = false,
  direction = 'up',
}: TextAnimationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })

  const itemVariants = variants ?? directionVariants(direction)

  // Line mode — whole block or split by \n
  if (lineAnime) {
    const lines = text.split('\n').filter(Boolean)
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
        className={classname}
      >
        {(lines.length > 1 ? lines : [text]).map((line, i) => (
          <motion.span key={i} variants={itemVariants} className="block">
            {line}
          </motion.span>
        ))}
      </motion.div>
    )
  }

  // Letter or word mode
  const units = letterAnime ? text.split('') : text.split(' ')
  const MotionTag = motion[Tag as 'div'] ?? motion.div

  return (
    <MotionTag
      ref={ref as React.RefObject<HTMLDivElement>}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={cn('flex flex-wrap', classname)}
    >
      {units.map((unit, i) => (
        <motion.span
          key={i}
          variants={itemVariants}
          className="inline-block"
          style={{ marginRight: letterAnime ? (unit === ' ' ? '0.3em' : '0') : '0.3em' }}
        >
          {unit === ' ' ? '\u00A0' : unit}
        </motion.span>
      ))}
    </MotionTag>
  )
}
