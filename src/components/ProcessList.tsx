'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  Activity,
  Zap,
  TrendingUp,
  Brain,
  Bell,
  Shield,
  ArrowRight,
} from 'lucide-react'

interface Process {
  pid: string
  name: string
  description: string
  cpu: number
  memory: number
  status: 'running' | 'active' | 'idle'
  icon: React.ComponentType<{ className?: string }>
  color: 'cyan' | 'green' | 'amber'
}

const processes: Process[] = [
  {
    pid: '1024',
    name: 'real-time-stream',
    description: 'Live data aggregation from GitHub, Stack Overflow, Hacker News, and Reddit. Updates every 60 seconds.',
    cpu: 94,
    memory: 87,
    status: 'running',
    icon: Activity,
    color: 'green',
  },
  {
    pid: '2048',
    name: 'trend-analyzer',
    description: 'Time-decay scoring algorithm that surfaces technologies gaining momentum across multiple data sources.',
    cpu: 78,
    memory: 65,
    status: 'running',
    icon: TrendingUp,
    color: 'cyan',
  },
  {
    pid: '3072',
    name: 'job-market-monitor',
    description: 'Tracks 200+ technologies across job boards. Know which skills companies are actually hiring for.',
    cpu: 82,
    memory: 71,
    status: 'active',
    icon: Zap,
    color: 'amber',
  },
  {
    pid: '4096',
    name: 'ai-insights',
    description: 'LLM-powered analysis that explains WHY technologies are trending and what it means for your career.',
    cpu: 91,
    memory: 89,
    status: 'running',
    icon: Brain,
    color: 'cyan',
  },
  {
    pid: '5120',
    name: 'alert-system',
    description: 'Get notified when technologies in your watchlist cross momentum thresholds. Never miss a trend.',
    cpu: 45,
    memory: 38,
    status: 'idle',
    icon: Bell,
    color: 'green',
  },
  {
    pid: '6144',
    name: 'data-validator',
    description: 'Cross-source verification to filter noise and ensure signal quality. No fake trends.',
    cpu: 67,
    memory: 54,
    status: 'active',
    icon: Shield,
    color: 'amber',
  },
]

export function ProcessList() {
  const [selectedPid, setSelectedPid] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const selectedProcess = processes.find((p) => p.pid === selectedPid)

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
            <span className="text-terminal-cyan text-sm font-mono">{'$ ps aux | grep devtrends'}</span>
          </div>

          <h2 className="font-sans text-4xl lg:text-6xl font-bold text-terminal-text">
            Running Processes
          </h2>

          <p className="text-xl text-terminal-text-dim font-sans max-w-2xl">
            Six concurrent data pipelines running 24/7 to surface career-critical insights.
          </p>
        </motion.div>

        {/* Process Table */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-amber" />
            <div className="terminal-dot terminal-dot-green" />
            <span className="ml-auto text-xs text-terminal-text-muted font-mono">
              system-monitor://processes
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 text-xs text-terminal-text-muted uppercase tracking-wider font-mono pb-4 border-b border-terminal-border">
              <div className="col-span-1">PID</div>
              <div className="col-span-1">STATUS</div>
              <div className="col-span-4">PROCESS</div>
              <div className="col-span-2 text-right">CPU %</div>
              <div className="col-span-2 text-right">MEM %</div>
              <div className="col-span-2 text-right">ACTION</div>
            </div>

            {/* Process Rows */}
            <div className="space-y-3">
              {processes.map((process, index) => {
                const Icon = process.icon
                const isSelected = selectedPid === process.pid

                return (
                  <motion.div
                    key={process.pid}
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                    whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedPid(isSelected ? null : process.pid)}
                    className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-terminal-bg border-terminal-cyan shadow-lg'
                        : 'bg-terminal-surface/50 border-terminal-border hover:border-terminal-cyan/50 hover:bg-terminal-bg/50'
                    }`}
                  >
                    {/* PID */}
                    <div className="col-span-1 font-mono text-sm text-terminal-text-dim">
                      {process.pid}
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono ${
                          process.status === 'running'
                            ? 'bg-terminal-green/10 text-terminal-green'
                            : process.status === 'active'
                            ? 'bg-terminal-cyan/10 text-terminal-cyan'
                            : 'bg-terminal-amber/10 text-terminal-amber'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {process.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Process Name */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          process.color === 'cyan'
                            ? 'bg-terminal-cyan/10 text-terminal-cyan'
                            : process.color === 'green'
                            ? 'bg-terminal-green/10 text-terminal-green'
                            : 'bg-terminal-amber/10 text-terminal-amber'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-mono font-semibold text-terminal-text">
                          {process.name}
                        </div>
                      </div>
                    </div>

                    {/* CPU */}
                    <div className="col-span-2 text-right space-y-1">
                      <div className="mono-number text-terminal-text">{process.cpu}%</div>
                      <div className="h-1 bg-terminal-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-terminal-cyan"
                          style={{ width: `${process.cpu}%` }}
                        />
                      </div>
                    </div>

                    {/* Memory */}
                    <div className="col-span-2 text-right space-y-1">
                      <div className="mono-number text-terminal-text">{process.memory}%</div>
                      <div className="h-1 bg-terminal-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-terminal-green"
                          style={{ width: `${process.memory}%` }}
                        />
                      </div>
                    </div>

                    {/* Action */}
                    <div className="col-span-2 text-right">
                      <button
                        className={`text-xs font-mono transition-colors flex items-center gap-1 ml-auto ${
                          isSelected
                            ? 'text-terminal-cyan'
                            : 'text-terminal-text-muted hover:text-terminal-cyan'
                        }`}
                      >
                        {isSelected ? 'CLOSE' : 'INSPECT'}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Process Details Panel */}
            {selectedProcess && (
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, height: 'auto' }}
                exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                className="mt-6 p-6 bg-terminal-bg border border-terminal-cyan rounded-lg space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <selectedProcess.icon className="w-6 h-6 text-terminal-cyan" />
                    <div>
                      <h3 className="font-mono font-bold text-lg text-terminal-cyan">
                        {selectedProcess.name}
                      </h3>
                      <p className="text-sm text-terminal-text-muted font-mono">
                        PID: {selectedProcess.pid}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono ${
                      selectedProcess.status === 'running'
                        ? 'bg-terminal-green/10 text-terminal-green'
                        : selectedProcess.status === 'active'
                        ? 'bg-terminal-cyan/10 text-terminal-cyan'
                        : 'bg-terminal-amber/10 text-terminal-amber'
                    }`}
                  >
                    {selectedProcess.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-terminal-text-dim font-sans leading-relaxed">
                  {selectedProcess.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-terminal-border">
                  <div className="space-y-2">
                    <div className="text-xs text-terminal-text-muted uppercase tracking-wider">
                      Resource Usage
                    </div>
                    <div className="space-y-1 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-terminal-text-dim">CPU:</span>
                        <span className="text-terminal-cyan">{selectedProcess.cpu}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-terminal-text-dim">Memory:</span>
                        <span className="text-terminal-green">{selectedProcess.memory}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-terminal-text-muted uppercase tracking-wider">
                      Runtime Info
                    </div>
                    <div className="space-y-1 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-terminal-text-dim">Uptime:</span>
                        <span className="text-terminal-text">24/7</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-terminal-text-dim">Priority:</span>
                        <span className="text-terminal-amber">HIGH</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-terminal-text-dim font-mono mb-6">
            All processes optimized for minimal latency and maximum signal
          </p>
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            className="px-8 py-4 bg-terminal-green text-terminal-bg font-mono font-semibold rounded-lg hover-glow transition-all inline-flex items-center gap-2"
          >
            {'> LAUNCH_DASHBOARD'}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
