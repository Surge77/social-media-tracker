'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

interface HyperTextProps {
  text: string
  className?: string
  duration?: number
  animateOnLoad?: boolean
}

export function HyperText({
  text,
  className,
  duration = 800,
  animateOnLoad = true,
}: HyperTextProps) {
  const [displayText, setDisplayText] = useState(animateOnLoad ? text.split('') : text.split(''))
  const [triggered, setTriggered] = useState(false)
  const iterationRef = useRef(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!animateOnLoad || prefersReducedMotion) return
    setTriggered(true)
  }, [animateOnLoad, prefersReducedMotion])

  useEffect(() => {
    if (!triggered) return

    let frame = 0
    const totalFrames = Math.floor(duration / 30)

    const interval = setInterval(() => {
      frame++
      setDisplayText(
        text.split('').map((char, i) => {
          if (char === ' ') return ' '
          const revealAt = Math.floor((i / text.length) * totalFrames)
          if (frame > revealAt) return char
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
      )
      if (frame >= totalFrames) {
        setDisplayText(text.split(''))
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [triggered, text, duration])

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>
  }

  return (
    <motion.span
      className={cn('inline-block', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayText.map((char, i) => (
        <span
          key={i}
          className={char !== text[i] ? 'text-primary/50' : ''}
        >
          {char}
        </span>
      ))}
    </motion.span>
  )
}
