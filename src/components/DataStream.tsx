'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface StreamEvent {
  id: string
  source: string
  tech: string
  event: string
  timestamp: string
  color: 'cyan' | 'green' | 'amber'
}

const sources = ['GitHub', 'HN', 'Reddit', 'StackOverflow', 'Dev.to', 'Jobs']
const techs = ['TypeScript', 'Rust', 'Go', 'Python', 'React', 'Vue', 'Svelte', 'Next.js', 'Deno', 'Bun']
const events = [
  'New repository trending',
  'Spike in mentions',
  'Job posting surge',
  'High engagement thread',
  'Tutorial published',
  'Package release',
  'Conference announcement',
  'Framework update',
]

function generateEvent(): StreamEvent {
  const colors: ('cyan' | 'green' | 'amber')[] = ['cyan', 'green', 'amber']
  return {
    id: Math.random().toString(36).substr(2, 9),
    source: sources[Math.floor(Math.random() * sources.length)],
    tech: techs[Math.floor(Math.random() * techs.length)],
    event: events[Math.floor(Math.random() * events.length)],
    timestamp: new Date().toLocaleTimeString(),
    color: colors[Math.floor(Math.random() * colors.length)],
  }
}

export function DataStream() {
  const [events, setEvents] = useState<StreamEvent[]>([])
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    // Initialize with some events
    const initialEvents = Array.from({ length: 5 }, generateEvent)
    setEvents(initialEvents)

    if (prefersReducedMotion) return

    // Add new events periodically
    const interval = setInterval(() => {
      setEvents((prev) => {
        const newEvent = generateEvent()
        const updated = [newEvent, ...prev].slice(0, 8) // Keep last 8 events
        return updated
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="grid-bg opacity-20" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-surface border border-terminal-border rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-green" />
            </span>
            <span className="text-terminal-text-dim text-sm font-mono">
              STREAMING • {events.length} events
            </span>
          </div>

          <h2 className="font-sans text-4xl lg:text-6xl font-bold text-terminal-text">
            Real-Time Intelligence
          </h2>

          <p className="text-xl text-terminal-text-dim font-sans max-w-2xl">
            Watch trends emerge in real-time. Every mention, star, and job posting tracked and analyzed instantly.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Live Event Stream */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-amber" />
              <div className="terminal-dot terminal-dot-green" />
              <span className="ml-auto text-xs text-terminal-text-muted font-mono">
                stream://live-events
              </span>
            </div>

            <div className="p-6 min-h-[500px]">
              <div className="space-y-3">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                    exit={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3 p-3 bg-terminal-bg rounded-lg border border-terminal-border hover:border-terminal-cyan/50 transition-colors"
                  >
                    {/* Timestamp */}
                    <div className="text-xs text-terminal-text-muted font-mono whitespace-nowrap">
                      {event.timestamp}
                    </div>

                    {/* Source badge */}
                    <div
                      className={`px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap ${
                        event.color === 'cyan'
                          ? 'bg-terminal-cyan/10 text-terminal-cyan'
                          : event.color === 'green'
                          ? 'bg-terminal-green/10 text-terminal-green'
                          : 'bg-terminal-amber/10 text-terminal-amber'
                      }`}
                    >
                      {event.source}
                    </div>

                    {/* Event details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-terminal-text font-mono">
                        <span className={`font-bold ${
                          event.color === 'cyan' ? 'text-terminal-cyan' :
                          event.color === 'green' ? 'text-terminal-green' :
                          'text-terminal-amber'
                        }`}>
                          {event.tech}
                        </span>
                        {' · '}
                        <span className="text-terminal-text-dim">{event.event}</span>
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full ${
                        event.color === 'cyan' ? 'bg-terminal-cyan' :
                        event.color === 'green' ? 'bg-terminal-green' :
                        'bg-terminal-amber'
                      }`} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stream footer */}
              <div className="mt-6 pt-4 border-t border-terminal-border text-xs text-terminal-text-muted font-mono">
                <div className="flex justify-between">
                  <span>Buffer: 8 events</span>
                  <span className="text-terminal-green">● CONNECTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Metrics */}
          <div className="space-y-6">
            {/* Data Sources Status */}
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot terminal-dot-red" />
                <div className="terminal-dot terminal-dot-amber" />
                <div className="terminal-dot terminal-dot-green" />
                <span className="ml-auto text-xs text-terminal-text-muted font-mono">
                  sources://status
                </span>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-sm text-terminal-text-muted uppercase tracking-wider font-mono">
                  Data Source Status
                </h3>

                <div className="space-y-3">
                  {sources.map((source, index) => {
                    const latency = Math.floor(Math.random() * 100) + 20
                    return (
                      <div key={source} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-terminal-green" />
                          <span className="font-mono text-sm text-terminal-text">
                            {source}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-terminal-text-muted font-mono">
                            {latency}ms
                          </span>
                          <span className="text-xs text-terminal-green font-mono">
                            ACTIVE
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Real-time Metrics */}
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot terminal-dot-red" />
                <div className="terminal-dot terminal-dot-amber" />
                <div className="terminal-dot terminal-dot-green" />
                <span className="ml-auto text-xs text-terminal-text-muted font-mono">
                  metrics://real-time
                </span>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs text-terminal-text-muted uppercase tracking-wider">
                      Events/min
                    </div>
                    <div className="mono-number text-3xl text-terminal-cyan">
                      1,247
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-terminal-text-muted uppercase tracking-wider">
                      Technologies
                    </div>
                    <div className="mono-number text-3xl text-terminal-green">
                      200+
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-terminal-text-muted uppercase tracking-wider">
                      Avg Latency
                    </div>
                    <div className="mono-number text-3xl text-terminal-amber">
                      42ms
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-terminal-text-muted uppercase tracking-wider">
                      Uptime
                    </div>
                    <div className="mono-number text-3xl text-terminal-green">
                      99.9%
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-terminal-border">
                  <div className="text-xs text-terminal-text-muted mb-2 uppercase tracking-wider">
                    System Load
                  </div>
                  <div className="space-y-2">
                    {['Data Ingestion', 'Analysis', 'Storage'].map((label, i) => {
                      const value = Math.floor(Math.random() * 40) + 60
                      return (
                        <div key={label} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-terminal-text-dim">{label}</span>
                            <span className="text-terminal-cyan">{value}%</span>
                          </div>
                          <div className="h-1.5 bg-terminal-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-terminal-cyan"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
