'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'

interface MeteorsProps {
  number?: number
  className?: string
}

export function Meteors({ number = 12, className }: MeteorsProps) {
  const [styles, setStyles] = useState<CSSProperties[]>([])

  useEffect(() => {
    setStyles(
      Array.from({ length: number }, () => ({
        top: -5,
        left: `${Math.floor(Math.random() * (window.innerWidth + 400) - 200)}px`,
        animationDelay: `${(Math.random() * 4 + 0.2).toFixed(2)}s`,
        animationDuration: `${Math.floor(Math.random() * 8 + 5)}s`,
      })),
    )
  }, [number])

  return (
    <>
      {styles.map((style, i) => (
        <span
          key={i}
          className={cn(
            'pointer-events-none absolute size-0.5 rotate-[215deg] animate-meteor',
            'rounded-full bg-orange-400/50 shadow-[0_0_0_1px_rgba(249,115,22,0.08)]',
            className,
          )}
          style={style}
        >
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[60px] -translate-y-1/2 bg-gradient-to-r from-orange-400/50 to-transparent" />
        </span>
      ))}
    </>
  )
}
