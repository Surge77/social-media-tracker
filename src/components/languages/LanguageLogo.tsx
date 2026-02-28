'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

// ─── Devicons: full-color SVGs verified against devicon.json ────────────────
// URL: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/{name}/{name}-{variant}.svg
const DI: Record<string, string> = {
  JavaScript:     'javascript/javascript-original',
  TypeScript:     'typescript/typescript-original',
  Python:         'python/python-original',
  Java:           'java/java-original',
  Rust:           'rust/rust-original',
  Go:             'go/go-original',
  'C++':          'cplusplus/cplusplus-original',
  'C#':           'csharp/csharp-original',
  C:              'c/c-original',
  PHP:            'php/php-original',
  Ruby:           'ruby/ruby-original',
  Swift:          'swift/swift-original',
  Kotlin:         'kotlin/kotlin-original',
  Scala:          'scala/scala-original',
  R:              'r/r-original',
  Dart:           'dart/dart-original',
  Shell:          'bash/bash-original',
  Lua:            'lua/lua-original',
  Perl:           'perl/perl-original',
  Haskell:        'haskell/haskell-original',
  Elixir:         'elixir/elixir-original',
  Groovy:         'groovy/groovy-original',
  Julia:          'julia/julia-original',
  'F#':           'fsharp/fsharp-original',
  Clojure:        'clojure/clojure-original',
  Zig:            'zig/zig-original',
  Crystal:        'crystal/crystal-original',
  Nim:            'nim/nim-original',
  MATLAB:         'matlab/matlab-original',
  PowerShell:     'powershell/powershell-original',
  Erlang:         'erlang/erlang-original',
  OCaml:          'ocaml/ocaml-original',
  Solidity:       'solidity/solidity-original',
  CoffeeScript:   'coffeescript/coffeescript-original',
  Fortran:        'fortran/fortran-original',
  'Visual Basic': 'visualbasic/visualbasic-original',
  COBOL:          'cobol/cobol-original',
  Prolog:         'prolog/prolog-original',
}

// ─── Simpleicons: tinted monochromatic SVGs (for langs not in devicons) ──────
// URL: https://cdn.simpleicons.org/{slug}/{hex}
const SI: Record<string, string> = {
  'Objective-C':  'objectivec',   // devicons only has plain (no color)
  Hack:           'hacklang',
  D:              'd',
  // Fallbacks in case a devicons URL 404s:
  JavaScript:     'javascript',
  TypeScript:     'typescript',
  Python:         'python',
  Rust:           'rust',
  'C#':           'csharp',
  PHP:            'php',
  Swift:          'swift',
  Kotlin:         'kotlin',
  Scala:          'scala',
  Dart:           'dart',
  Shell:          'gnubash',
  Lua:            'lua',
  Perl:           'perl',
  Haskell:        'haskell',
  Elixir:         'elixir',
  Groovy:         'apachegroovy',
  Julia:          'julia',
  'F#':           'fsharp',
  Clojure:        'clojure',
  Zig:            'zig',
  Crystal:        'crystal',
  Nim:            'nimlang',
  PowerShell:     'powershell',
  Erlang:         'erlang',
  OCaml:          'ocaml',
  Solidity:       'solidity',
  CoffeeScript:   'coffeescript',
  Fortran:        'fortran',
  'Visual Basic': 'visualbasic',
}

// ─── Brand colors ─────────────────────────────────────────────────────────────
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
  Tcl:            '#e4cc98',
  D:              '#ba595e',
  Prolog:         '#74283c',
}

// Light brand colors need darkening so the tinted simpleicons SVG is visible
const SI_COLOR_OVERRIDE: Record<string, string> = {
  JavaScript: 'c9b200',
  Nim:        'c8b000',
  Tcl:        'b8a060',
}

function siColor(lang: string): string {
  return SI_COLOR_OVERRIDE[lang] ?? (COLORS[lang] ?? '#6b7280').replace('#', '')
}

function diUrl(lang: string): string | null {
  const path = DI[lang]
  return path
    ? `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}.svg`
    : null
}

function siUrl(lang: string): string | null {
  const slug = SI[lang]
  return slug ? `https://cdn.simpleicons.org/${slug}/${siColor(lang)}` : null
}

type Stage = 'devicons' | 'simpleicons' | 'initials'

interface LanguageLogoProps {
  language: string
  size?: number
  className?: string
  showBackground?: boolean
}

export function LanguageLogo({
  language,
  size = 32,
  className,
  showBackground = true,
}: LanguageLogoProps) {
  // Determine starting stage: prefer devicons, fall back to simpleicons, else initials
  function getInitialStage(): Stage {
    if (diUrl(language)) return 'devicons'
    if (siUrl(language)) return 'simpleicons'
    return 'initials'
  }

  const [stage, setStage] = useState<Stage>(getInitialStage)

  const brandColor = COLORS[language] ?? '#6b7280'
  const imgSize    = Math.round(size * 0.62)

  const src =
    stage === 'devicons'    ? diUrl(language) :
    stage === 'simpleicons' ? siUrl(language) :
    null

  function handleError() {
    if (stage === 'devicons' && siUrl(language)) {
      setStage('simpleicons')
    } else {
      setStage('initials')
    }
  }

  // Initials: "C", "C++", "C#" shown as-is (short); others use first 2 chars
  const initials = language.startsWith('C') && language.length <= 3
    ? language
    : language.slice(0, 2)

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full shrink-0',
        className,
      )}
      style={{
        width: size,
        height: size,
        background: showBackground
          ? `radial-gradient(circle at 35% 35%, ${brandColor}28, ${brandColor}10)`
          : undefined,
        boxShadow: showBackground ? `0 0 0 1px ${brandColor}25` : undefined,
      }}
    >
      {src && stage !== 'initials' ? (
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
        <span
          className="font-mono font-black text-white select-none leading-none"
          style={{
            fontSize: size * 0.28,
            backgroundColor: brandColor,
            width:  size * 0.78,
            height: size * 0.78,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 8px ${brandColor}50`,
          }}
        >
          {initials}
        </span>
      )}
    </div>
  )
}
