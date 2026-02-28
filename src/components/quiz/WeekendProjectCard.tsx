'use client'

import React, { useEffect, useState } from 'react'
import { Rocket, Copy, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ProjectIdea } from '@/lib/ai/generators/project-ideas'

interface WeekendProjectCardProps {
  slug: string
  goal?: string
  level?: string
  className?: string
}

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: 'bg-success/10 text-green-600 dark:text-green-400',
  intermediate: 'bg-warning/10 text-orange-600 dark:text-orange-400',
  advanced: 'bg-destructive/10 text-red-600 dark:text-red-400',
}

export function WeekendProjectCard({ slug, goal = 'side-project', level = 'intermediate', className }: WeekendProjectCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const [idea, setIdea] = useState<ProjectIdea | null>(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load on first expand to avoid blocking render
  useEffect(() => {
    if (expanded && !loaded) {
      setLoaded(true)
      setLoading(true)
      fetch(`/api/quiz/projects?slug=${encodeURIComponent(slug)}&goal=${encodeURIComponent(goal)}&level=${encodeURIComponent(level)}`)
        .then(r => r.json())
        .then(data => {
          if (data.idea) setIdea(data.idea)
        })
        .catch(() => {
          // silently fail — show nothing
        })
        .finally(() => setLoading(false))
    }
  }, [expanded, loaded, slug, goal, level])

  const handleCopy = async () => {
    if (!idea?.starterSnippet) return
    try {
      await navigator.clipboard.writeText(idea.starterSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className={className}>
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="flex items-center justify-between w-full text-left group"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Your Weekend Project</span>
          {!expanded && <span className="text-xs text-muted-foreground">(expand to generate)</span>}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? {} : { height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3">
              {loading && (
                <Card className="p-4 space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              )}

              {!loading && idea && (
                <Card className="border border-border/50 overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-border/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Build: "{idea.name}"</h4>
                        <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{idea.estimatedHours}h</span>
                        </div>
                        <Badge className={cn('text-xs capitalize', DIFFICULTY_COLOR[idea.difficulty] ?? '')}>
                          {idea.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Code snippet */}
                  <div className="relative">
                    {/* macOS chrome */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#161b22] border-b border-border/30">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                      <span className="ml-3 font-mono text-[11px] text-zinc-500">
                        starter.{getExtension(idea.starterSnippetLanguage)}
                      </span>
                    </div>

                    <div className="bg-[#0d1117] p-4 overflow-x-auto">
                      <pre className="text-xs text-green-400 font-mono leading-relaxed whitespace-pre">
                        {idea.starterSnippet}
                      </pre>
                    </div>

                    <button
                      onClick={handleCopy}
                      className={cn(
                        'absolute top-10 right-3 flex items-center gap-1 px-2 py-1 rounded text-xs transition-all',
                        copied
                          ? 'bg-success/20 text-success'
                          : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white',
                      )}
                      aria-label={copied ? 'Copied!' : 'Copy snippet'}
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Success condition */}
                  <div className="p-4 bg-success/5 border-t border-success/20">
                    <div className="flex items-start gap-2">
                      <span className="text-success text-base" aria-hidden>✅</span>
                      <p className="text-sm text-foreground">{idea.successCondition}</p>
                    </div>
                  </div>
                </Card>
              )}

              {!loading && !idea && (
                <Card className="p-4 border-dashed border-border/50">
                  <p className="text-sm text-muted-foreground text-center">
                    Could not generate a project idea. Try refreshing.
                  </p>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getExtension(language: string): string {
  const map: Record<string, string> = {
    typescript: 'ts',
    javascript: 'js',
    python: 'py',
    solidity: 'sol',
    rust: 'rs',
    go: 'go',
    java: 'java',
    sql: 'sql',
    dockerfile: 'dockerfile',
    dart: 'dart',
  }
  return map[language?.toLowerCase()] ?? 'ts'
}
