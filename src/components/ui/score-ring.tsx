'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

interface ScoreRingProps {
  score: number // 0–100
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
  color?: string
}

export function ScoreRing({
  score,
  size = 72,
  strokeWidth = 5,
  className,
  label,
  color = 'hsl(var(--primary))',
}: ScoreRingProps) {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<SVGSVGElement>(null)
  const [triggered, setTriggered] = useState(false)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, score))
  const targetOffset = circumference * (1 - clamped / 100)

  useEffect(() => {
    if (prefersReducedMotion) { setTriggered(true); return }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true) },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  const dashOffset = triggered ? targetOffset : circumference

  return (
    <div
      className={cn('relative flex items-center justify-center shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg ref={ref} width={size} height={size} className="-rotate-90" aria-hidden>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: prefersReducedMotion
              ? 'none'
              : 'stroke-dashoffset 1.1s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold tabular-nums leading-none text-foreground">
          {Math.round(clamped)}
        </span>
        {label && (
          <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
