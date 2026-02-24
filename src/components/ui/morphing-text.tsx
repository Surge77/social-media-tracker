'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface MorphingTextProps {
  texts: string[]
  className?: string
  interval?: number
}

export function MorphingText({ texts, className, interval = 2200 }: MorphingTextProps) {
  const [index, setIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % texts.length), interval)
    return () => clearInterval(t)
  }, [texts.length, interval])

  if (prefersReducedMotion) {
    return <span className={cn('inline-block', className)}>{texts[0]}</span>
  }

  return (
    <span className="relative inline-block">
      <AnimatePresence mode="wait">
        <motion.span
          key={texts[index]}
          initial={{ opacity: 0, filter: 'blur(10px)', y: 8 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          exit={{ opacity: 0, filter: 'blur(10px)', y: -8 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={cn('inline-block', className)}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
