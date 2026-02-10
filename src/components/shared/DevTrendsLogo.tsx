import React from 'react'
import { cn } from '@/lib/utils'

interface DevTrendsLogoProps {
  variant?: 'icon' | 'full'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  xs: { icon: 20, text: 'text-sm', gap: 'gap-1.5' },
  sm: { icon: 24, text: 'text-base', gap: 'gap-2' },
  md: { icon: 32, text: 'text-xl', gap: 'gap-2.5' },
  lg: { icon: 40, text: 'text-2xl', gap: 'gap-3' },
} as const

/**
 * DevTrends brand mark and wordmark.
 *
 * The mark: a rounded square with the signature gradient,
 * containing two intersecting trend lines (multi-source data)
 * and a peak node (the current insight moment).
 *
 * Design principles:
 * - Works at 16px (favicon) through 80px (hero)
 * - Distinct silhouette — not a generic chart icon
 * - Two lines represent multi-source intelligence
 * - The bright dot = "this is where you are now"
 */
export const DevTrendsLogo = React.forwardRef<HTMLDivElement, DevTrendsLogoProps>(
  ({ variant = 'full', size = 'sm', className }, ref) => {
    const { icon, text, gap } = sizeMap[size]

    return (
      <div
        ref={ref}
        className={cn('inline-flex items-center', gap, className)}
      >
        <DevTrendsMark size={icon} />
        {variant === 'full' && (
          <span className={cn(text, 'font-bold tracking-tight text-foreground select-none')}>
            Dev<span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Trends</span>
          </span>
        )}
      </div>
    )
  }
)

DevTrendsLogo.displayName = 'DevTrendsLogo'

/**
 * The standalone mark — can be used as favicon, app icon, etc.
 */
export function DevTrendsMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dt-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect width="32" height="32" rx="8" fill="url(#dt-grad)" />

      {/* Secondary trend line — subtle, shows multi-source depth */}
      <path
        d="M6 21 C10 22.5, 14 19, 18 16.5 S24 13, 26 12"
        stroke="white"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Primary trend line — bold ascending curve with inflection */}
      <path
        d="M6 24.5 C9 24, 12 22, 15 18 C18 14, 21 10.5, 25.5 7"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Peak insight node */}
      <circle cx="25.5" cy="7" r="2.2" fill="white" />
    </svg>
  )
}
