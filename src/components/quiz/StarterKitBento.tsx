'use client'

import React, { useState } from 'react'
import { Play, BookOpen, Terminal, ExternalLink, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TerminalCard } from '@/components/ui/terminal-card'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getTechResources } from '@/lib/quiz/resources'
import type { LearningMode } from '@/components/quiz/LearningStyleToggle'

interface StarterKitBentoProps {
  slug: string
  mode?: LearningMode
  className?: string
}

export function StarterKitBento({ slug, mode, className }: StarterKitBentoProps) {
  const prefersReducedMotion = useReducedMotion()
  const resources = getTechResources(slug)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  }

  if (!resources) {
    return (
      <div className={cn('rounded-lg border border-dashed border-border/50 p-4 opacity-60', className)}>
        <p className="text-sm text-muted-foreground text-center">Resources not yet curated for this technology.</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
        Starter Kit
      </h3>
      <motion.div
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? false : 'visible'}
        variants={prefersReducedMotion ? undefined : containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {/* Watch Card */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <WatchCard
            youtube={resources.youtube}
            highlighted={mode === 'video' || !mode}
          />
        </motion.div>

        {/* Read Card */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <ReadCard
            docsUrl={resources.docsUrl}
            highlighted={mode === 'docs'}
          />
        </motion.div>

        {/* Execute Card */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <ExecuteCard
            command={resources.cliCommand}
            label={resources.cliLabel}
            highlighted={mode === 'project'}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

function WatchCard({ youtube, highlighted }: {
  youtube: { videoId: string; title: string; channel: string; durationMinutes: number } | undefined
  highlighted: boolean
}) {
  if (!youtube) {
    return (
      <Card className={cn(
        'border-dashed opacity-50 p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]',
      )}>
        <Play className="w-5 h-5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">No video curated yet</span>
      </Card>
    )
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${youtube.videoId}/mqdefault.jpg`
  const youtubeUrl = `https://www.youtube.com/watch?v=${youtube.videoId}`

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group block rounded-lg border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md',
        highlighted ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border/50',
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={youtube.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-4 h-4 text-zinc-900 ml-0.5" />
          </div>
        </div>
        <Badge className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5">
          {youtube.durationMinutes}m
        </Badge>
      </div>

      {/* Info */}
      <div className="p-3 bg-card">
        <p className="text-xs font-medium text-foreground line-clamp-2">{youtube.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{youtube.channel}</p>
      </div>
    </a>
  )
}

function ReadCard({ docsUrl, highlighted }: {
  docsUrl: string | undefined
  highlighted: boolean
}) {
  if (!docsUrl) {
    return (
      <Card className="border-dashed opacity-50 p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]">
        <BookOpen className="w-5 h-5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Docs not curated</span>
      </Card>
    )
  }

  const displayUrl = docsUrl.replace(/^https?:\/\//, '').split('/').slice(0, 3).join('/')

  return (
    <a
      href={docsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex flex-col justify-between rounded-lg border p-4 min-h-[120px] transition-all hover:-translate-y-1 hover:shadow-md',
        highlighted ? 'border-primary/50 ring-1 ring-primary/30 bg-primary/5' : 'border-border/50 bg-card',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <BookOpen className="w-4 h-4 text-blue-500" />
        </div>
        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="mt-auto">
        <p className="text-sm font-medium text-foreground">Official Quick Start</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{displayUrl}</p>
      </div>
    </a>
  )
}

function ExecuteCard({ command, label, highlighted }: {
  command: string | undefined
  label: string | undefined
  highlighted: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!command) return
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  if (!command) {
    return (
      <Card className="border-dashed opacity-50 p-4 flex flex-col items-center justify-center gap-2 min-h-[120px]">
        <Terminal className="w-5 h-5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">No CLI command</span>
      </Card>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden min-h-[120px] transition-all',
        highlighted ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border/50',
      )}
    >
      <TerminalCard title={label ?? 'cli'} className="h-full border-0 rounded-lg">
        <div className="flex flex-col gap-2">
          <code className="text-xs text-green-400 font-mono break-all leading-relaxed">
            {command}
          </code>
          <button
            onClick={handleCopy}
            className={cn(
              'self-end flex items-center gap-1 px-2 py-1 rounded text-xs transition-all',
              copied
                ? 'bg-success/20 text-success'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white',
            )}
            aria-label={copied ? 'Copied!' : 'Copy command'}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </TerminalCard>
    </div>
  )
}
