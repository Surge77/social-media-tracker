'use client'

import React, { useState } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { getTechIcon } from '@/lib/tech-icons'

interface TechIconProps {
  slug: string
  name: string
  /** Brand hex color from the DB (e.g. "#3178c6") */
  color?: string | null
  size?: number
  className?: string
  /** Show subtle brand-tinted background behind the icon. Default: true. */
  showBackground?: boolean
}

const DI = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'
const CRYPTO = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/icon'

const CDN_OVERRIDES: Record<string, string> = {
  java:          `${DI}/java/java-original.svg`,
  csharp:        `${DI}/csharp/csharp-original.svg`,
  hardhat:       `${DI}/hardhat/hardhat-original.svg`,
  vyper:         `${DI}/vyper/vyper-original.svg`,
  aave:          `${CRYPTO}/aave.svg`,
  uniswap:       `${CRYPTO}/uni.svg`,
  'the-graph':   `${CRYPTO}/grt.svg`,
  bitcoin:       `${CRYPTO}/btc.svg`,
  ethereum:      `${CRYPTO}/eth.svg`,
  aws:           `${DI}/amazonwebservices/amazonwebservices-plain-wordmark.svg`,
  azure:         `${DI}/azure/azure-original.svg`,
  dynamodb:      `${DI}/dynamodb/dynamodb-original.svg`,
  'openai-api':  `/icons/openai.svg`,
}

type Stage = 'cdn' | 'simple' | 'fallback'

/** Returns perceived luminance (0–1) of a hex color. */
function hexLuminance(hex: string): number {
  const h = hex.replace('#', '')
  if (h.length < 6) return 0.5
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/**
 * Returns a theme-aware CSS fill for an inline SVG icon.
 *
 * Dark / midnight themes:
 *   - Luminance < 0.18 (dark grays, near-blacks) → light neutral so icon shows on dark bg
 *
 * Light theme:
 *   - Luminance > 0.55 (JS yellow, React cyan, etc.) → darken 40% so icon shows on white bg
 *
 * The brand-tinted container background provides additional contrast.
 */
function adaptiveFill(brandHex: string, isDark: boolean): string {
  const lum = hexLuminance(brandHex)

  if (isDark && lum < 0.18) return '#b0bec5'  // dark colors → soft light-blue-gray on dark bg

  if (!isDark && lum > 0.55) {
    const h = brandHex.replace('#', '')
    const r = Math.round(parseInt(h.slice(0, 2), 16) * 0.6)
    const g = Math.round(parseInt(h.slice(2, 4), 16) * 0.6)
    const b = Math.round(parseInt(h.slice(4, 6), 16) * 0.6)
    return `rgb(${r},${g},${b})`
  }

  return `#${brandHex.replace('#', '')}`
}

/**
 * Renders an official icon for a technology with a brand-tinted background pill
 * that ensures visibility across dark, midnight, and light themes.
 *
 * Rendering priority:
 * 1. CDN image (Devicons / spothq) — for slugs where simple-icons is wrong/missing
 * 2. Simple Icons inline SVG — theme-aware fill, no network request
 * 3. Colored initial circle — last resort
 */
export function TechIcon({
  slug,
  name,
  color,
  size = 20,
  className,
  showBackground = true,
}: TechIconProps) {
  const { resolvedTheme } = useTheme()
  // Default to dark treatment when theme is not yet resolved (dark is default theme)
  const isDark = resolvedTheme !== 'light'

  const cdnSrc = CDN_OVERRIDES[slug] ?? null
  const icon = !cdnSrc ? getTechIcon(slug) : null

  const initialStage: Stage = cdnSrc ? 'cdn' : icon ? 'simple' : 'fallback'
  const [stage, setStage] = useState<Stage>(initialStage)

  // Reset when slug changes
  const [prevSlug, setPrevSlug] = useState(slug)
  if (prevSlug !== slug) {
    setPrevSlug(slug)
    setStage(initialStage)
  }

  const brandHex = icon ? `#${icon.hex}` : (color ?? '#6b7280')
  const bgAlpha = '20'
  const ringAlpha = '30'

  const containerStyle: React.CSSProperties = showBackground ? {
    width: size,
    height: size,
    background: `radial-gradient(circle at 35% 35%, ${brandHex}${bgAlpha}, ${brandHex}0c)`,
    boxShadow: `0 0 0 1px ${brandHex}${ringAlpha}`,
    borderRadius: '6px',
    flexShrink: 0,
  } : {
    width: size,
    height: size,
    flexShrink: 0,
  }

  const innerSize = Math.round(size * 0.68)

  // CDN image with error fallback
  if (stage === 'cdn' && cdnSrc) {
    return (
      <span
        className={cn('inline-flex items-center justify-center shrink-0', className)}
        style={containerStyle}
        role="img"
        aria-label={name}
      >
        <img
          src={cdnSrc}
          alt={name}
          width={innerSize}
          height={innerSize}
          className="object-contain select-none"
          onError={() => setStage(icon ? 'simple' : 'fallback')}
          draggable={false}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </span>
    )
  }

  // Simple Icons inline SVG with theme-aware fill
  if (stage === 'simple' && icon) {
    const fill = adaptiveFill(icon.hex, isDark)
    return (
      <span
        className={cn('inline-flex items-center justify-center shrink-0', className)}
        style={containerStyle}
        role="img"
        aria-label={icon.title}
      >
        <svg
          viewBox="0 0 24 24"
          width={innerSize}
          height={innerSize}
          fill={fill}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d={icon.path} />
        </svg>
      </span>
    )
  }

  // Fallback: colored circle with initial
  const initial = name.charAt(0).toUpperCase()
  const bg = color ?? '#6b7280'
  return (
    <span
      role="img"
      aria-label={name}
      className={cn('inline-flex shrink-0 items-center justify-center rounded-md font-bold', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        fontSize: Math.max(8, Math.floor(size * 0.45)),
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  )
}
