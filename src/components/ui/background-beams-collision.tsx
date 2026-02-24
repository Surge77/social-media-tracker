'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ReactNode, CSSProperties } from 'react'

interface Beam {
  id: number
  x: string
  delay: number
  duration: number
  width: number
  color: string
}

interface Explosion {
  id: number
  x: number
  y: number
  color: string
}

const BEAMS: Beam[] = [
  { id: 1, x: '4%',  delay: 0,    duration: 7,   width: 2,   color: '#f97316' },
  { id: 2, x: '14%', delay: 2,    duration: 8,   width: 1.5, color: '#f59e0b' },
  { id: 3, x: '27%', delay: 0.5,  duration: 6,   width: 2,   color: '#fb923c' },
  { id: 4, x: '42%', delay: 3,    duration: 9,   width: 1,   color: '#f97316' },
  { id: 5, x: '57%', delay: 1,    duration: 7.5, width: 2,   color: '#fbbf24' },
  { id: 6, x: '68%', delay: 2.5,  duration: 6.5, width: 1.5, color: '#f59e0b' },
  { id: 7, x: '80%', delay: 0.8,  duration: 8,   width: 2,   color: '#f97316' },
  { id: 8, x: '92%', delay: 1.8,  duration: 7,   width: 1,   color: '#fb923c' },
]

function BeamWithCollision({
  beam,
  containerRef,
  collisionRef,
  onCollide,
}: {
  beam: Beam
  containerRef: React.RefObject<HTMLDivElement | null>
  collisionRef: React.RefObject<HTMLDivElement | null>
  onCollide: (x: number, y: number, color: string) => void
}) {
  const beamRef = useRef<HTMLDivElement>(null)
  const hasCollided = useRef(false)

  useEffect(() => {
    const checkCollision = () => {
      const beamEl = beamRef.current
      const collision = collisionRef.current
      const container = containerRef.current
      if (!beamEl || !collision || !container) return

      const beamRect = beamEl.getBoundingClientRect()
      const collisionRect = collision.getBoundingClientRect()

      if (
        beamRect.bottom >= collisionRect.top &&
        beamRect.top <= collisionRect.bottom &&
        !hasCollided.current
      ) {
        hasCollided.current = true
        const containerRect = container.getBoundingClientRect()
        onCollide(
          beamRect.left - containerRect.left + beamRect.width / 2,
          collisionRect.top - containerRect.top,
          beam.color,
        )
        setTimeout(() => { hasCollided.current = false }, (beam.duration * 1000) + beam.delay * 1000)
      }
    }

    const interval = setInterval(checkCollision, 50)
    return () => clearInterval(interval)
  }, [beam, collisionRef, containerRef, onCollide])

  return (
    <motion.div
      ref={beamRef}
      className="absolute top-0 m-auto h-full w-px rounded-full"
      style={{
        left: beam.x,
        background: `linear-gradient(to bottom, transparent, ${beam.color}, transparent)`,
        width: beam.width,
      }}
      initial={{ y: '-100%', opacity: 0 }}
      animate={{ y: '100%', opacity: [0, 1, 1, 0] }}
      transition={{
        y:       { delay: beam.delay, duration: beam.duration, repeat: Infinity, ease: 'linear' },
        opacity: { delay: beam.delay, duration: beam.duration, repeat: Infinity, ease: 'easeInOut', times: [0, 0.05, 0.95, 1] },
      }}
    />
  )
}

export function BackgroundBeamsCollision({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const collisionRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [explosions, setExplosions] = useState<Explosion[]>([])
  let idRef = useRef(0)

  const onCollide = useCallback((x: number, y: number, color: string) => {
    const id = ++idRef.current
    setExplosions(prev => [...prev, { id, x, y, color }])
    setTimeout(() => setExplosions(prev => prev.filter(e => e.id !== id)), 1500)
  }, [])

  if (prefersReducedMotion) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        {children}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Beams */}
      {BEAMS.map(beam => (
        <BeamWithCollision
          key={beam.id}
          beam={beam}
          containerRef={containerRef}
          collisionRef={collisionRef}
          onCollide={onCollide}
        />
      ))}

      {/* Explosion particles */}
      {explosions.map(exp => (
        <Explosion key={exp.id} x={exp.x} y={exp.y} color={exp.color} />
      ))}

      {/* Collision detection line (invisible, positioned at content area) */}
      <div
        ref={collisionRef}
        className="pointer-events-none absolute left-0 right-0 h-px"
        style={{ top: '45%' }}
      />

      {/* Content */}
      {children}
    </div>
  )
}

function Explosion({ x, y, color }: { x: number; y: number; color: string }) {
  const particles = Array.from({ length: 14 }, (_, i) => {
    const angle = (360 / 14) * i
    const radius = Math.random() * 60 + 20
    const rad = (angle * Math.PI) / 180
    return { dx: Math.cos(rad) * radius, dy: Math.sin(rad) * radius }
  })

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: x, top: y } as CSSProperties}
    >
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute inline-block h-1 w-1 rounded-full"
          style={{ background: color, left: 0, top: 0 }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0 }}
          transition={{ duration: 0.8 + Math.random() * 0.4, ease: 'easeOut' }}
        />
      ))}
      {/* Central flash */}
      <motion.span
        className="absolute -left-2 -top-2 h-4 w-4 rounded-full"
        style={{ background: color }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}
