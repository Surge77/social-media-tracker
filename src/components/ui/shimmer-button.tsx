'use client'

import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  shimmerColor?: string
  background?: string
  className?: string
}

export function ShimmerButton({
  children,
  shimmerColor = 'rgba(255,255,255,0.35)',
  background = 'hsl(var(--primary))',
  className,
  ...props
}: ShimmerButtonProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <button
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-md px-3 py-2',
        'text-primary-foreground transition-all duration-300',
        'hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        className,
      )}
      style={{ background }}
      {...props}
    >
      {/* Shimmer sweep */}
      {!prefersReducedMotion && (
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer-sweep_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent group-disabled:hidden"
          aria-hidden
        />
      )}
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </button>
  )
}
