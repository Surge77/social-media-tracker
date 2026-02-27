'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { RefObject } from 'react'

interface AnimatedBeamProps {
  containerRef: RefObject<HTMLElement | null>
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  curvature?: number
  reverse?: boolean
  duration?: number
  delay?: number
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
  className?: string
}

function getCenter(el: HTMLElement, container: HTMLElement) {
  const er = el.getBoundingClientRect()
  const cr = container.getBoundingClientRect()
  return { x: er.left - cr.left + er.width / 2, y: er.top - cr.top + er.height / 2 }
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3,
  delay = 0,
  pathColor = 'currentColor',
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = '#f97316',
  gradientStopColor = '#f59e0b',
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  className,
}: AnimatedBeamProps) {
  const gradId = useRef(`ab-${Math.random().toString(36).slice(2)}`).current
  const [d, setD] = useState('')
  const [dims, setDims] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const update = () => {
      const c = containerRef.current
      const f = fromRef.current
      const t = toRef.current
      if (!c || !f || !t) return
      const cr = c.getBoundingClientRect()
      setDims({ w: cr.width, h: cr.height })
      const fp = getCenter(f, c)
      const tp = getCenter(t, c)
      const sx = fp.x + startXOffset, sy = fp.y + startYOffset
      const ex = tp.x + endXOffset, ey = tp.y + endYOffset
      const mx = (sx + ex) / 2, my = (sy + ey) / 2
      const len = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2)
      const nx = -(ey - sy) / len, ny = (ex - sx) / len
      const cpx = mx + nx * curvature, cpy = my + ny * curvature
      setD(`M ${sx},${sy} Q ${cpx},${cpy} ${ex},${ey}`)
    }
    update()
    const obs = new ResizeObserver(update)
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset])

  if (!d) return null

  return (
    <svg
      fill="none"
      width={dims.w}
      height={dims.h}
      className={cn('pointer-events-none absolute inset-0 z-0', className)}
    >
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1={reverse ? '100%' : '0%'}
          x2={reverse ? '0%' : '100%'}
        >
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="50%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Static path */}
      <path d={d} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} fill="none" />
      {/* Animated beam */}
      <motion.path
        d={d}
        stroke={`url(#${gradId})`}
        strokeWidth={pathWidth + 1}
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
        transition={{
          pathLength: { delay, duration, repeat: Infinity, ease: 'linear' },
          opacity: { delay, duration, repeat: Infinity, ease: 'easeInOut', times: [0, 0.1, 0.9, 1] },
        }}
      />
    </svg>
  )
}
