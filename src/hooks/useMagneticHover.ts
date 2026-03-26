'use client'

import { useCallback } from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'
import { useReducedMotion } from './useReducedMotion'

interface MagneticHoverResult {
  x: MotionValue<number>
  y: MotionValue<number>
  handlePointerMove: (e: React.PointerEvent<HTMLElement>) => void
  handlePointerLeave: () => void
}

/**
 * Tracks pointer position relative to element center and returns
 * spring-driven x/y translations that pull the element towards the cursor.
 *
 * @param strength Multiplier for magnetic pull (default 0.25).
 */
export function useMagneticHover(strength = 0.25): MagneticHoverResult {
  const prefersReducedMotion = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 })
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 })

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (prefersReducedMotion) return
      const rect = e.currentTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      x.set((e.clientX - centerX) * strength)
      y.set((e.clientY - centerY) * strength)
    },
    [prefersReducedMotion, x, y, strength],
  )

  const handlePointerLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return { x: springX, y: springY, handlePointerMove, handlePointerLeave }
}
