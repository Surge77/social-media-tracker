'use client'

/*
 * Packages: devicon + @icons-pack/react-simple-icons are installed but not used
 * for icon rendering — CSS font icons are unreliable in Next.js App Router.
 *
 * Instead we use CDN image URLs (no CSS font, no hydration issues):
 *   Strategy 1 — Devicons CDN: full-color SVGs verified against devicon.json
 *     https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/{path}.svg
 *   Strategy 2 — Simple Icons CDN: color-tinted monochromatic SVGs
 *     https://cdn.simpleicons.org/{slug}/{hex}
 *   Strategy 3 — Inline SVG: custom-designed icons for 9 niche langs (theme-aware)
 *   Strategy 4 — Hash badge: deterministic color + abbreviation (unrecognised langs)
 */

import React, { useState } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

// ─── Strategy 1: Devicons CDN — full-color, verified against devicon.json ─────
const DI_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'

const DI: Record<string, string> = {
  // Mainstream (25)
  JavaScript:     'javascript/javascript-original',
  TypeScript:     'typescript/typescript-original',
  Python:         'python/python-original',
  Java:           'java/java-original',           // removed from simpleicons (Oracle); devicons has it
  'C#':           'csharp/csharp-original',
  'C++':          'cplusplus/cplusplus-original',
  PHP:            'php/php-original',
  Go:             'go/go-original',
  C:              'c/c-original',
  Swift:          'swift/swift-original',
  Kotlin:         'kotlin/kotlin-original',
  Ruby:           'ruby/ruby-original',
  Rust:           'rust/rust-original',
  Shell:          'bash/bash-original',           // Shell → bash
  R:              'r/r-original',
  Scala:          'scala/scala-original',
  Dart:           'dart/dart-original',
  Lua:            'lua/lua-original',
  Perl:           'perl/perl-original',
  Haskell:        'haskell/haskell-original',
  Elixir:         'elixir/elixir-original',
  Groovy:         'groovy/groovy-original',
  Julia:          'julia/julia-original',
  'F#':           'fsharp/fsharp-original',
  Clojure:        'clojure/clojure-original',
  // Systems / Emerging (10)
  Zig:            'zig/zig-original',
  Crystal:        'crystal/crystal-original',
  Nim:            'nim/nim-original',
  'Objective-C':  'objectivec/objectivec-plain',  // only plain exists; still renders
  MATLAB:         'matlab/matlab-original',
  PowerShell:     'powershell/powershell-original',
  Erlang:         'erlang/erlang-original',
  OCaml:          'ocaml/ocaml-original',
  Prolog:         'prolog/prolog-original',
  // Blockchain (2 in devicons)
  Solidity:       'solidity/solidity-original',
  Vyper:          'vyper/vyper-original',
  // Legacy / Niche (6 in devicons)
  Fortran:        'fortran/fortran-original',
  'Visual Basic': 'visualbasic/visualbasic-original',
  COBOL:          'cobol/cobol-original',
  CoffeeScript:   'coffeescript/coffeescript-original',
  Racket:         'racket/racket-original',
}

// ─── Strategy 2: Simple Icons CDN — tinted monochromatic SVGs ────────────────
// Used for languages devicons doesn't cover (D, Ada)
const SI: Record<string, string> = {
  D:    'd',          // D programming language
  Ada:  'ada',        // Ada programming language
  // Hack: 'hacklang' does not exist in simple-icons — handled via LOCAL_ICONS instead
}

// ─── Strategy 3: Inline SVG renderers — 10 niche languages with no CDN logo ──
// Rendered as JSX so fill color can be theme-adapted at render time.
type IconRenderer = (size: number, color: string) => React.ReactElement

const LOCAL_ICONS: Record<string, IconRenderer> = {
  Assembly: (size, c) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="1.5" stroke={c} strokeWidth="1.5"/>
      <line x1="10" y1="7" x2="10" y2="4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="7" x2="14" y2="4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="17" x2="10" y2="20" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="17" x2="14" y2="20" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="10" x2="4" y2="10" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="14" x2="4" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="17" y1="10" x2="20" y2="10" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="17" y1="14" x2="20" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" fill={c}/>
    </svg>
  ),
  Move: (size, c) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13 6l6 6-6 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 7v10" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 7l3 3" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 17l3-3" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Cairo: (size, c) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3L20 19H4L12 3Z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 8L16.5 17H7.5L12 8Z" fill={c} fillOpacity="0.25"/>
      <line x1="12" y1="9" x2="12" y2="16" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'Ink!': (size, c) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3C12 3 7 9 7 13.5C7 16.538 9.239 19 12 19C14.761 19 17 16.538 17 13.5C17 9 12 3 12 3Z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 19V21" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9.5 14.5C9.5 14.5 10.5 16 12 16" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Clarity: (size, c) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="11" r="5" stroke={c} strokeWidth="1.5"/>
      <line x1="15.5" y1="15.5" x2="19" y2="19" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="11" x2="14" y2="11" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Tact: (size, c) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polygon points="12,3 21,8.5 21,15.5 12,21 3,15.5 3,8.5" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/>
      <polygon points="12,7 17,10 17,14 12,17 7,14 7,10" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  ),
  Tcl: (size, c) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="4" rx="1" stroke={c} strokeWidth="1.5"/>
      <line x1="8" y1="10" x2="8" y2="7" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="10" x2="12" y2="7" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="10" x2="16" y2="7" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="14" x2="8" y2="17" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="14" x2="12" y2="17" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="14" x2="16" y2="17" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Carbon: (size, c) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" fill={c}/>
      <circle cx="12" cy="5" r="1.5" stroke={c} strokeWidth="1.5"/>
      <circle cx="12" cy="19" r="1.5" stroke={c} strokeWidth="1.5"/>
      <circle cx="5.5" cy="8.5" r="1.5" stroke={c} strokeWidth="1.5"/>
      <circle cx="18.5" cy="8.5" r="1.5" stroke={c} strokeWidth="1.5"/>
      <circle cx="5.5" cy="15.5" r="1.5" stroke={c} strokeWidth="1.5"/>
      <circle cx="18.5" cy="15.5" r="1.5" stroke={c} strokeWidth="1.5"/>
      <line x1="12" y1="9.5" x2="12" y2="6.5" stroke={c} strokeWidth="1"/>
      <line x1="12" y1="14.5" x2="12" y2="17.5" stroke={c} strokeWidth="1"/>
      <line x1="9.8" y1="10.7" x2="7.0" y2="9.2" stroke={c} strokeWidth="1"/>
      <line x1="14.2" y1="10.7" x2="17.0" y2="9.2" stroke={c} strokeWidth="1"/>
      <line x1="9.8" y1="13.3" x2="7.0" y2="14.8" stroke={c} strokeWidth="1"/>
      <line x1="14.2" y1="13.3" x2="17.0" y2="14.8" stroke={c} strokeWidth="1"/>
    </svg>
  ),
  VHDL: (size, c) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="1" stroke={c} strokeWidth="1.5"/>
      <line x1="9" y1="6" x2="9" y2="4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="6" x2="12" y2="4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="6" x2="15" y2="4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="9" y1="18" x2="9" y2="20" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="12" y2="20" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="15" y1="18" x2="15" y2="20" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="9" y="9" width="6" height="6" rx="0.5" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="1"/>
    </svg>
  ),
  Hack: (size, c) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Curly braces — { h } — representing Hack's PHP/typed-language heritage */}
      <path d="M8 5C6.5 5 6 5.5 6 7v2.5C6 10.5 5 11 4 12c1 .5 2 1 2 2.5V17c0 1.5.5 2 2 2" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 5c1.5 0 2 .5 2 2v2.5c0 1 1 1.5 2 2-1 .5-2 1-2 2.5V17c0 1.5-.5 2-2 2" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="10" y1="9" x2="10" y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="12" x2="14" y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="9" x2="14" y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

// ─── Brand colors (background tinting for all 53 languages) ──────────────────
const COLORS: Record<string, string> = {
  JavaScript:     '#f7df1e',
  TypeScript:     '#3178c6',
  Python:         '#3776ab',
  Java:           '#ed8b00',
  Rust:           '#ce412b',
  Go:             '#00add8',
  'C++':          '#00599c',
  'C#':           '#239120',
  C:              '#a8b9cc',
  PHP:            '#777bb4',
  Ruby:           '#cc342d',
  Swift:          '#f05138',
  Kotlin:         '#7f52ff',
  Scala:          '#dc322f',
  R:              '#276dc3',
  Dart:           '#00b4ab',
  Shell:          '#89e051',
  Lua:            '#6e4c9e',
  Perl:           '#0298c3',
  Haskell:        '#5e5086',
  Elixir:         '#6e4a7e',
  Groovy:         '#4298b8',
  Julia:          '#9558b2',
  'F#':           '#b845fc',
  Clojure:        '#5881d8',
  Zig:            '#f7a41d',
  Crystal:        '#776791',
  Nim:            '#f3d400',
  'Objective-C':  '#438eff',
  MATLAB:         '#e16737',
  PowerShell:     '#5391fe',
  Assembly:       '#b8863b',
  Erlang:         '#b83998',
  OCaml:          '#ef7a08',
  Solidity:       '#5a5a8a',   // #363636 was too dark on dark bg → shifted to visible mid-blue
  CoffeeScript:   '#7a6060',   // #2f2625 was near-black → lightened to visible brown-gray
  Hack:           '#878787',
  Fortran:        '#4d41b1',
  'Visual Basic': '#945db7',
  COBOL:          '#005ca5',
  Tcl:            '#7b9cb0',
  D:              '#ba595e',
  Prolog:         '#74283c',
  Vyper:          '#5b52a0',   // #2b247c was very dark → lightened
  Move:           '#4a90e2',
  Cairo:          '#ff6b6b',
  'Ink!':         '#e6007a',
  Clarity:        '#5546ff',
  Tact:           '#0088cc',
  Ada:            '#02f88c',
  Racket:         '#9f1d20',
  Carbon:         '#888888',   // #333333 was near-black → mid-gray visible on all themes
  VHDL:           '#6b8e23',
}

// ─── Exported language list ───────────────────────────────────────────────────
export const LANGUAGES = {
  mainstream: [
    'JavaScript', 'Python', 'Java', 'TypeScript', 'C#', 'C++',
    'PHP', 'Go', 'C', 'Swift', 'Kotlin', 'Ruby', 'Rust', 'Shell',
    'R', 'Scala', 'Dart', 'Lua', 'Perl', 'Haskell', 'Elixir',
    'Groovy', 'Julia', 'F#', 'Clojure',
  ],
  systemsEmerging: [
    'Zig', 'Crystal', 'Nim', 'Objective-C', 'MATLAB',
    'PowerShell', 'Assembly', 'Erlang', 'OCaml', 'Prolog',
  ],
  blockchain: [
    'Solidity', 'Vyper', 'Move', 'Cairo', 'Ink!', 'Clarity', 'Tact',
  ],
  legacyNiche: [
    'Fortran', 'Visual Basic', 'D', 'Ada', 'Tcl', 'COBOL',
    'Racket', 'Carbon', 'Hack', 'CoffeeScript', 'VHDL',
  ],
} as const

export type LanguageName =
  | (typeof LANGUAGES.mainstream)[number]
  | (typeof LANGUAGES.systemsEmerging)[number]
  | (typeof LANGUAGES.blockchain)[number]
  | (typeof LANGUAGES.legacyNiche)[number]

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
 * Returns a theme-aware color for icon strokes/fills.
 * Dark/midnight: lighten dark colors. Light: darken bright colors.
 */
function iconColor(brandHex: string, isDark: boolean): string {
  const lum = hexLuminance(brandHex)
  if (isDark && lum < 0.18) return '#b0bec5'
  if (!isDark && lum > 0.55) {
    const h = brandHex.replace('#', '')
    const r = Math.round(parseInt(h.slice(0, 2), 16) * 0.58)
    const g = Math.round(parseInt(h.slice(2, 4), 16) * 0.58)
    const b = Math.round(parseInt(h.slice(4, 6), 16) * 0.58)
    return `rgb(${r},${g},${b})`
  }
  return brandHex.startsWith('#') ? brandHex : `#${brandHex}`
}

function hashColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = name.charCodeAt(i) + ((h << 5) - h)
    h |= 0
  }
  return `hsl(${Math.abs(h) % 360}, 58%, 42%)`
}

function getAbbr(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()
}

// ─── Component ────────────────────────────────────────────────────────────────
type Stage = 'devicons' | 'simpleicons' | 'badge'

// Overrides for Simple Icons that have too-bright colors on light bg
const SI_COLOR_OVERRIDE: Record<string, string> = {
  JavaScript: 'c9b200',
  Nim:        'c8b000',
  Ada:        '01a862',  // #02f88c is too bright on light backgrounds
}

interface LanguageIconProps {
  language: string
  size?: number
  className?: string
  showBackground?: boolean
}

export function LanguageIcon({
  language,
  size = 24,
  className,
  showBackground = true,
}: LanguageIconProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== 'light'

  const brandColor = COLORS[language] ?? hashColor(language)
  const isLocal = !!LOCAL_ICONS[language]

  function initialStage(): Stage {
    if (DI[language])  return 'devicons'
    if (SI[language])  return 'simpleicons'
    return 'badge'  // LOCAL_ICONS and hash badge both render as 'badge' stage
  }

  const [stage, setStage] = useState<Stage>(initialStage)

  function handleError() {
    if (stage === 'devicons' && SI[language]) {
      setStage('simpleicons')
    } else {
      setStage('badge')
    }
  }

  const imgSize = Math.round(size * 0.62)

  // Compute theme-aware hex for Simple Icons CDN URL
  const siHex = (() => {
    const override = SI_COLOR_OVERRIDE[language]
    if (override) return override
    const lum = hexLuminance(brandColor)
    const h = brandColor.replace('#', '')
    if (isDark && lum < 0.18) {
      // Too dark for dark bg — blend 50% toward white
      const r = Math.round(parseInt(h.slice(0, 2), 16) * 0.5 + 127.5).toString(16).padStart(2, '0')
      const g = Math.round(parseInt(h.slice(2, 4), 16) * 0.5 + 127.5).toString(16).padStart(2, '0')
      const b = Math.round(parseInt(h.slice(4, 6), 16) * 0.5 + 127.5).toString(16).padStart(2, '0')
      return `${r}${g}${b}`
    }
    if (!isDark && lum > 0.55) {
      // Too bright for light bg — darken 42%
      const r = Math.round(parseInt(h.slice(0, 2), 16) * 0.58).toString(16).padStart(2, '0')
      const g = Math.round(parseInt(h.slice(2, 4), 16) * 0.58).toString(16).padStart(2, '0')
      const b = Math.round(parseInt(h.slice(4, 6), 16) * 0.58).toString(16).padStart(2, '0')
      return `${r}${g}${b}`
    }
    return h
  })()

  const src: string | null =
    stage === 'devicons'
      ? `${DI_BASE}/${DI[language]}.svg`
      : stage === 'simpleicons'
      ? `https://cdn.simpleicons.org/${SI[language]}/${siHex}`
      : null

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    background: showBackground
      ? `radial-gradient(circle at 35% 35%, ${brandColor}28, ${brandColor}10)`
      : undefined,
    boxShadow: showBackground ? `0 0 0 1px ${brandColor}25` : undefined,
  }

  // Local inline SVG icon (theme-adaptive color)
  const localIconColor = iconColor(brandColor, isDark)

  return (
    <div
      className={cn('flex items-center justify-center rounded-full shrink-0', className)}
      style={containerStyle}
    >
      {src ? (
        <img
          src={src}
          alt={language}
          width={imgSize}
          height={imgSize}
          className="object-contain select-none"
          onError={handleError}
          draggable={false}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : isLocal && stage === 'badge' ? (
        // Strategy 3: inline SVG with theme-aware brand color
        LOCAL_ICONS[language](imgSize, localIconColor)
      ) : (
        // Strategy 4: hash-colored badge with abbreviation
        <span
          className="font-mono font-black text-white select-none leading-none"
          style={{
            fontSize: Math.round(size * (getAbbr(language).length > 2 ? 0.24 : 0.30)),
            backgroundColor: isDark
              ? hashColor(language)
              : iconColor(hashColor(language), false),
            width:  Math.round(size * 0.78),
            height: Math.round(size * 0.78),
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 8px ${brandColor}50`,
          }}
        >
          {getAbbr(language)}
        </span>
      )}
    </div>
  )
}
