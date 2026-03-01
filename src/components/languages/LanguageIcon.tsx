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
 *   Strategy 3 — Hash badge: deterministic color + abbreviation (13 niche langs)
 */

import React, { useState } from 'react'
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
// Used for languages devicons doesn't cover (D, Ada, Hack)
const SI: Record<string, string> = {
  D:    'd',          // D programming language
  Ada:  'ada',        // Ada programming language
  Hack: 'hacklang',   // Meta's Hack language
}

// Light-colored brands need a darker hex so the icon shows on both themes
const SI_COLOR_OVERRIDE: Record<string, string> = {
  JavaScript: 'c9b200',
  Nim:        'c8b000',
  Ada:        '01a862',  // #02f88c is too bright on light backgrounds
}

// ─── Strategy 3: Local SVG overrides — custom icons for niche languages ──────
// Languages with no official logo on any CDN get custom-designed SVGs
const LO: Record<string, string> = {
  Assembly:  '/icons/languages/assembly.svg',
  Move:      '/icons/languages/move.svg',
  Cairo:     '/icons/languages/cairo.svg',
  'Ink!':    '/icons/languages/ink.svg',
  Clarity:   '/icons/languages/clarity.svg',
  Tact:      '/icons/languages/tact.svg',
  Tcl:       '/icons/languages/tcl.svg',
  Carbon:    '/icons/languages/carbon.svg',
  VHDL:      '/icons/languages/vhdl.svg',
}

// ─── Strategy 4: Hash badge — fallback for any unrecognised language ──────────

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
  Assembly:       '#6e4c13',
  Erlang:         '#b83998',
  OCaml:          '#ef7a08',
  Solidity:       '#363636',
  CoffeeScript:   '#2f2625',
  Hack:           '#878787',
  Fortran:        '#4d41b1',
  'Visual Basic': '#945db7',
  COBOL:          '#005ca5',
  Tcl:            '#7b9cb0',
  D:              '#ba595e',
  Prolog:         '#74283c',
  Vyper:          '#2b247c',
  Move:           '#4a90e2',
  Cairo:          '#ff6b6b',
  'Ink!':         '#e6007a',
  Clarity:        '#5546ff',
  Tact:           '#0088cc',
  Ada:            '#02f88c',
  Racket:         '#9f1d20',
  Carbon:         '#333333',
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

// ─── Component ────────────────────────────────────────────────────────────────
type Stage = 'devicons' | 'simpleicons' | 'local' | 'badge'

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
  const brandColor = COLORS[language] ?? hashColor(language)

  function initialStage(): Stage {
    if (DI[language])  return 'devicons'
    if (SI[language])  return 'simpleicons'
    if (LO[language])  return 'local'
    return 'badge'
  }

  const [stage, setStage] = useState<Stage>(initialStage)

  function handleError() {
    if (stage === 'devicons' && SI[language]) {
      setStage('simpleicons')
    } else if (stage === 'devicons' && LO[language]) {
      setStage('local')
    } else if (stage === 'simpleicons' && LO[language]) {
      setStage('local')
    } else {
      setStage('badge')
    }
  }

  const imgSize = Math.round(size * 0.62)

  const src: string | null =
    stage === 'devicons'
      ? `${DI_BASE}/${DI[language]}.svg`
      : stage === 'simpleicons'
      ? `https://cdn.simpleicons.org/${SI[language]}/${SI_COLOR_OVERRIDE[language] ?? brandColor.replace('#', '')}`
      : stage === 'local'
      ? LO[language]
      : null

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    background: showBackground
      ? `radial-gradient(circle at 35% 35%, ${brandColor}28, ${brandColor}10)`
      : undefined,
    boxShadow: showBackground ? `0 0 0 1px ${brandColor}25` : undefined,
  }

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
        />
      ) : (
        // Strategy 3: hash-colored badge with abbreviation
        <span
          className="font-mono font-black text-white select-none leading-none"
          style={{
            fontSize: Math.round(size * (getAbbr(language).length > 2 ? 0.24 : 0.30)),
            backgroundColor: brandColor,
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
