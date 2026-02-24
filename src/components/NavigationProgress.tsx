'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const BINARY_FRAMES = [
  '010010', '001100', '100101', '111010', '111101',
  '010111', '101011', '111000', '110011', '110101',
]

const MIN_DISPLAY_MS = 500 // always visible for at least this long

export function NavigationProgress() {
  const pathname = usePathname()
  const [width, setWidth]       = useState(0)
  const [opacity, setOpacity]   = useState(0)
  const [frame, setFrame]       = useState(0)
  const [tickerOn, setTickerOn] = useState(false)

  const prevPath     = useRef(pathname)
  const timerRef     = useRef<ReturnType<typeof setTimeout>>(undefined)
  const rafRef       = useRef<number>(0)
  const tickerRef    = useRef<ReturnType<typeof setInterval>>(undefined)
  const startTimeRef = useRef<number>(0)

  function startTicker() {
    startTimeRef.current = Date.now()
    setTickerOn(true)
    setFrame(0)
    clearInterval(tickerRef.current)
    tickerRef.current = setInterval(
      () => setFrame(f => (f + 1) % BINARY_FRAMES.length),
      80,
    )
  }

  function stopAfterMinDuration() {
    const elapsed = Date.now() - startTimeRef.current
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setWidth(100)
      timerRef.current = setTimeout(() => {
        setOpacity(0)
        timerRef.current = setTimeout(() => {
          clearInterval(tickerRef.current)
          setTickerOn(false)
          setWidth(0)
        }, 250)
      }, 180)
    }, remaining)
  }

  // Detect internal link clicks → start bar + ticker
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') ?? ''
      if (!href || href.startsWith('http') || href.startsWith('#') || href === pathname) return

      clearTimeout(timerRef.current)
      cancelAnimationFrame(rafRef.current!)
      setOpacity(1)
      setWidth(0)
      startTicker()
      rafRef.current = requestAnimationFrame(() => {
        requestAnimationFrame(() => setWidth(70))
      })
    }

    document.addEventListener('click', onLinkClick, true)
    return () => document.removeEventListener('click', onLinkClick, true)
  }, [pathname])

  // Pathname changed → wait out minimum duration then complete
  useEffect(() => {
    if (pathname === prevPath.current) return
    prevPath.current = pathname
    cancelAnimationFrame(rafRef.current!)
    stopAfterMinDuration()
    return () => clearTimeout(timerRef.current)
  }, [pathname])

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(tickerRef.current)
    clearTimeout(timerRef.current)
  }, [])

  return (
    <>
      {/* Progress bar */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[200] h-[2px] w-full"
      >
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            opacity,
            background: 'linear-gradient(90deg, hsl(16 100% 60%), hsl(30 100% 65%), hsl(16 100% 60%))',
            backgroundSize: '200% 100%',
            boxShadow: '0 0 12px hsl(16 100% 60% / 0.8), 0 0 4px hsl(16 100% 60% / 0.6)',
            transition:
              width === 0
                ? 'none'
                : width === 100
                ? 'width 200ms ease-out, opacity 250ms ease'
                : 'width 800ms cubic-bezier(0.05, 0.8, 0.3, 1), opacity 100ms ease',
          }}
        />
      </div>

      {/* Binary ticker — top-right corner */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-4 top-2.5 z-[200]"
        style={{
          opacity: tickerOn ? 1 : 0,
          transition: 'opacity 120ms ease',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '0.6rem',
            color: 'hsl(16 100% 60%)',
            letterSpacing: '0.15em',
            lineHeight: 1,
            display: 'block',
          }}
        >
          {BINARY_FRAMES[frame]}
        </span>
      </div>
    </>
  )
}
