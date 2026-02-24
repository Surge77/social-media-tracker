'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ReactNode } from 'react'

interface MagicCardProps {
  children: ReactNode
  className?: string
  gradientColor?: string
  gradientSize?: number
}

export function MagicCard({
  children,
  className,
  gradientColor = 'rgba(249,115,22,0.12)',
  gradientSize = 320,
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={prefersReducedMotion ? undefined : handleMouseMove}
      onMouseEnter={prefersReducedMotion ? undefined : () => setHovered(true)}
      onMouseLeave={prefersReducedMotion ? undefined : () => setHovered(false)}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Spotlight overlay */}
      {!prefersReducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-[inherit]"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(${gradientSize}px circle at ${pos.x}px ${pos.y}px, ${gradientColor}, transparent 60%)`,
          }}
        />
      )}
      {children}
    </div>
  )
}
