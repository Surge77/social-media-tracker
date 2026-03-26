'use client'

import { useCallback, useEffect } from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'
import { useReducedMotion } from './useReducedMotion'

interface ParallaxLayerResult {
  x: MotionValue<number>
  y: MotionValue<number>
}

/**
 * Tracks mouse position across the entire viewport and returns
 * spring-driven x/y values scaled by `depth`.
 *
 * Positive depth → moves *with* the cursor.
 * Negative depth → moves *against* the cursor (inverse parallax).
 *
 * @param depth Multiplier for parallax intensity (e.g. 0.5, -80).
 */
export function useParallaxLayer(depth = 1): ParallaxLayerResult {
  const prefersReducedMotion = useReducedMotion()

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 50, damping: 30, mass: 0.5 })
  const springY = useSpring(rawY, { stiffness: 50, damping: 30, mass: 0.5 })

  const handleMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReducedMotion) return
      const nx = (e.clientX / window.innerWidth - 0.5) * 2   // -1 … +1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2  // -1 … +1
      rawX.set(nx * depth)
      rawY.set(ny * depth)
    },
    [prefersReducedMotion, rawX, rawY, depth],
  )

  useEffect(() => {
    if (prefersReducedMotion) return
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [prefersReducedMotion, handleMove])

  return { x: springX, y: springY }
}
