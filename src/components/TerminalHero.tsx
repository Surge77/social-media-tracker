'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface TrendData {
  tech: string
  trend: string
  value: number
  color: string
}

const mockTrends: TrendData[] = [
  { tech: 'TypeScript', trend: '↑ 23.4%', value: 89, color: 'cyan' },
  { tech: 'Rust', trend: '↑ 45.2%', value: 76, color: 'green' },
  { tech: 'Go', trend: '↑ 12.8%', value: 82, color: 'cyan' },
  { tech: 'Python', trend: '↓ 3.2%', value: 94, color: 'amber' },
  { tech: 'React', trend: '↑ 18.9%', value: 91, color: 'green' },
  { tech: 'Vue', trend: '↓ 5.1%', value: 78, color: 'amber' },
  { tech: 'Svelte', trend: '↑ 67.3%', value: 64, color: 'green' },
  { tech: 'Next.js', trend: '↑ 34.1%', value: 87, color: 'cyan' },
]

const commands = [
  '$ devtrends analyze --tech typescript',
  '> Analyzing 47,293 data points across 8 sources...',
  '> GitHub stars: +12.4K this week',
  '> Stack Overflow mentions: +234% MoM',
  '> Job postings: +4,127 new positions',
  '$ devtrends compare react vue svelte',
  '> Generating market analysis...',
  '$ devtrends forecast --horizon 90d',
  '> Running predictive models...',
]

export function TerminalHero() {
  const [currentCommand, setCurrentCommand] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(commands[commands.length - 1])
      return
    }

    const command = commands[currentCommand]
    let charIndex = 0

    const typingInterval = setInterval(() => {
      if (charIndex < command.length) {
        setDisplayedText(command.slice(0, charIndex + 1))
        charIndex++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setCurrentCommand((prev) => (prev + 1) % commands.length)
          setDisplayedText('')
        }, 2000)
      }
    }, 50)

    return () => clearInterval(typingInterval)
  }, [currentCommand, prefersReducedMotion])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background effects */}
      <div className="grid-bg" />
      <div className="scan-lines" />

      {/* ASCII Art Background */}
      <div className="absolute top-10 right-10 ascii-art hidden lg:block">
{`    ╔═══════════════════╗
    ║  TREND TERMINAL  ║
    ╚═══════════════════╝
       [ REAL-TIME ]
    ┌─────────────────┐
    │ ▓▓▓▓▓▓░░░░  67% │
    │ ▓▓▓▓▓▓▓▓░░  82% │
    │ ▓▓▓▓▓▓▓▓▓▓  94% │
    └─────────────────┘`}
      </div>

      <div className="relative z-10 max-w-7xl w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -50 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-surface border border-terminal-border rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-green"></span>
              </span>
              <span className="text-terminal-text-dim text-sm font-mono">
                LIVE • 8 sources streaming
              </span>
            </div>

            {/* Main Heading - NOT split color */}
            <div className="space-y-4">
              <h1 className="font-sans text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="block text-terminal-text">Developer Career</span>
                <span className="block text-terminal-text">Intelligence</span>
                <span className="block glow-cyan font-mono text-4xl lg:text-5xl mt-2">
                  [ TERMINAL ]
                </span>
              </h1>

              <p className="text-xl text-terminal-text-dim font-sans max-w-xl">
                Real-time technology trend analysis from 8 data sources.
                Track what&apos;s rising, what&apos;s falling, and what you should learn next.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="mono-number text-3xl glow-cyan">200+</div>
                <div className="text-xs text-terminal-text-muted font-sans uppercase tracking-wider">
                  Technologies
                </div>
              </div>
              <div className="space-y-1">
                <div className="mono-number text-3xl glow-green">8</div>
                <div className="text-xs text-terminal-text-muted font-sans uppercase tracking-wider">
                  Data Sources
                </div>
              </div>
              <div className="space-y-1">
                <div className="mono-number text-3xl glow-amber">24/7</div>
                <div className="text-xs text-terminal-text-muted font-sans uppercase tracking-wider">
                  Live Updates
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                className="group relative px-8 py-4 bg-terminal-cyan text-terminal-bg font-mono font-semibold rounded-lg overflow-hidden hover-glow transition-all"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {'> START_TERMINAL'}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </motion.button>

              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                className="px-8 py-4 border border-terminal-border text-terminal-text font-mono font-semibold rounded-lg hover:border-terminal-cyan hover:text-terminal-cyan transition-all"
              >
                {'> VIEW_DEMO'}
              </motion.button>
            </div>

            {/* Command Line Preview */}
            <div className="font-mono text-sm text-terminal-text-dim">
              <span className="glow-green">$</span> npx devtrends init
            </div>
          </motion.div>

          {/* Right: Live Terminal Window */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 50 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Glow effect behind terminal */}
            <div className="absolute -inset-4 bg-gradient-to-br from-terminal-cyan/20 to-terminal-green/20 blur-3xl opacity-50 rounded-3xl" />

            <div className="terminal-window relative">
              <div className="terminal-header">
                <div className="terminal-dot terminal-dot-red" />
                <div className="terminal-dot terminal-dot-amber" />
                <div className="terminal-dot terminal-dot-green" />
                <span className="ml-auto text-xs text-terminal-text-muted font-mono">
                  devtrends://live
                </span>
              </div>

              <div className="terminal-content min-h-[500px] space-y-4">
                {/* Live typing command */}
                <div className="flex items-center gap-2">
                  <span className="glow-green">$</span>
                  <span>{displayedText}</span>
                  {showCursor && <span className="cursor" />}
                </div>

                {/* Trend Data Display */}
                <div className="space-y-2 mt-8">
                  <div className="text-terminal-text-muted text-xs uppercase tracking-wider mb-4">
                    ┌─ TRENDING NOW ─────────────────────────┐
                  </div>

                  <AnimatePresence mode="popLayout">
                    {mockTrends.map((item, index) => (
                      <motion.div
                        key={item.tech}
                        initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 group hover:bg-terminal-bg/50 p-2 rounded transition-colors"
                      >
                        {/* Tech name */}
                        <span className="w-24 font-semibold glow-cyan">
                          {item.tech}
                        </span>

                        {/* Progress bar */}
                        <div className="flex-1 h-2 bg-terminal-border rounded-full overflow-hidden">
                          <motion.div
                            initial={prefersReducedMotion ? { width: `${item.value}%` } : { width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                            className={`h-full bg-gradient-to-r ${
                              item.color === 'cyan' ? 'from-terminal-cyan to-terminal-cyan/50' :
                              item.color === 'green' ? 'from-terminal-green to-terminal-green/50' :
                              'from-terminal-amber to-terminal-amber/50'
                            }`}
                          />
                        </div>

                        {/* Value */}
                        <span className="w-12 text-right mono-number text-terminal-text-dim">
                          {item.value}
                        </span>

                        {/* Trend */}
                        <span className={`w-20 text-right font-semibold ${
                          item.trend.includes('↑') ? 'glow-green' : 'glow-amber'
                        }`}>
                          {item.trend}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <div className="text-terminal-text-muted text-xs uppercase tracking-wider mt-4">
                    └────────────────────────────────────────┘
                  </div>
                </div>

                {/* Status footer */}
                <div className="mt-8 pt-4 border-t border-terminal-border text-xs text-terminal-text-muted space-y-1">
                  <div className="flex justify-between">
                    <span>Last update: {new Date().toLocaleTimeString()}</span>
                    <span className="glow-green">● CONNECTED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data sources: 8/8 active</span>
                    <span>Latency: 42ms</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
