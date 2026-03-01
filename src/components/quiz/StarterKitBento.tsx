'use client'

import React from 'react'
import { Play, BookOpen, Rocket, ExternalLink, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getTechResources } from '@/lib/quiz/resources'
import { getVideoForTech, getVideosForTech } from '@/lib/quiz/video-lookup'
import { getVideoIntentLabel } from '@/lib/quiz/video-intent'
import type { LearningMode } from '@/components/quiz/LearningStyleToggle'
import type { VideoIntent } from '@/lib/quiz/video-intent'
import type { YouTubeTopVideo } from '@/types'

interface StarterKitBentoProps {
  slug: string
  mode?: LearningMode
  /** Context-aware video intent. Changes which type of video is shown when API data is available. */
  videoIntent?: VideoIntent
  /** Live YouTube top videos from LatestSignals.youtube — passed by tech detail page when available */
  dynamicVideos?: YouTubeTopVideo[]
  className?: string
}

export function StarterKitBento({ slug, mode, videoIntent = 'learn', dynamicVideos, className }: StarterKitBentoProps) {
  const prefersReducedMotion = useReducedMotion()
  const resources = getTechResources(slug)

  // Resolve the best available video: API data > hardcoded fallback
  const resolvedVideo = getVideoForTech(slug, videoIntent, dynamicVideos)
  const intentLabel = videoIntent !== 'learn' ? getVideoIntentLabel(videoIntent) : undefined

  // Get all available videos for the Watch column
  const allVideos = getVideosForTech(slug, dynamicVideos)
  // Additional videos beyond the primary one — capped at 2 to keep Watch column proportional
  const additionalVideos = allVideos.filter(v => v.videoId !== resolvedVideo?.videoId).slice(0, 2)
  const totalVideoCount = (resolvedVideo ? 1 : 0) + additionalVideos.length

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
        className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start"
      >
        {/* Watch Column — card + up to 2 additional video rows */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="flex flex-col gap-1.5">
          <WatchCard
            video={resolvedVideo}
            highlighted={mode === 'video' || !mode}
            intentLabel={intentLabel}
            videoCount={totalVideoCount}
          />
          {additionalVideos.map((video) => (
            <a
              key={video.videoId}
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-card px-3 py-2 text-sm transition-all hover:bg-accent hover:shadow-sm group/link"
            >
              <Play className="h-3.5 w-3.5 shrink-0 text-red-500" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <span className="block truncate text-muted-foreground group-hover/link:text-foreground transition-colors text-sm">
                  {video.title}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  {video.channel}
                  {video.durationMinutes && ` · ${video.durationMinutes >= 60 ? `${Math.round(video.durationMinutes / 60)}h ${video.durationMinutes % 60}m` : `${video.durationMinutes}m`}`}
                </span>
              </div>
              {video.videoType && (
                <span className={cn(
                  'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                  video.videoType === 'crash-course' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                  video.videoType === 'full-tutorial' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                  video.videoType === 'project-based' && 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                  video.videoType === 'comparison' && 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
                  video.videoType === 'intro' && 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
                )}>
                  {video.videoType === 'crash-course' ? 'Crash Course' :
                    video.videoType === 'full-tutorial' ? 'Full Tutorial' :
                      video.videoType === 'project-based' ? 'Project' :
                        video.videoType === 'comparison' ? 'Compare' :
                          'Intro'}
                </span>
              )}
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/40 group-hover/link:text-muted-foreground transition-colors" aria-hidden="true" />
            </a>
          ))}
        </motion.div>

        {/* Read Card */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="flex flex-col">
          <ReadCard
            docsUrl={resources.docsUrl}
            highlighted={mode === 'docs'}
          />
        </motion.div>

        {/* Project Card */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="flex flex-col">
          <ProjectCard
            idea={resources.projectIdea}
            duration={resources.projectDuration}
            highlighted={mode === 'project'}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

function WatchCard({ video, highlighted, intentLabel, videoCount }: {
  video: import('@/lib/quiz/video-lookup').ResolvedVideo | null
  highlighted: boolean
  intentLabel?: string
  videoCount?: number
}) {
  if (!video) {
    return (
      <div className={cn(
        'flex flex-col rounded-lg border p-4 h-full',
        'border-dashed opacity-50',
      )}>
        <div className="flex items-center justify-center flex-1 gap-2 flex-col">
          <Play className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">No video curated yet</span>
        </div>
      </div>
    )
  }

  const thumbnailUrl = video.thumbnail
    ?? `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex flex-col rounded-lg border overflow-hidden h-full transition-all hover:-translate-y-1 hover:shadow-md',
        highlighted ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border/50',
      )}
    >
      {/* Fixed-height thumbnail */}
      <div className="relative h-[120px] bg-muted overflow-hidden shrink-0">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-4 h-4 text-zinc-900 ml-0.5" />
          </div>
        </div>
        {video.durationMinutes && (
          <Badge className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5">
            {video.durationMinutes}m
          </Badge>
        )}
        {intentLabel && video.source === 'api' && (
          <Badge className="absolute top-1.5 left-1.5 bg-primary/90 text-primary-foreground text-xs px-1.5 py-0.5">
            {intentLabel}
          </Badge>
        )}
      </div>

      {/* Info — grows to fill remaining card height */}
      <div className="flex flex-col flex-1 p-3 bg-card">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="p-1 rounded bg-red-500/10">
            <Play className="w-3 h-3 text-red-500" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {videoCount && videoCount > 1 ? `Watch · ${videoCount} videos` : 'Watch'}
          </span>
        </div>
        <p className="text-sm font-medium text-foreground line-clamp-2 flex-1">{video.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
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
      <div className="flex flex-col rounded-lg border border-dashed p-4 h-full opacity-50">
        <div className="flex items-center justify-center flex-1 gap-2 flex-col">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Docs not curated</span>
        </div>
      </div>
    )
  }

  const displayUrl = docsUrl.replace(/^https?:\/\//, '').split('/').slice(0, 2).join('/')

  return (
    <a
      href={docsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex flex-col rounded-lg border overflow-hidden h-full transition-all hover:-translate-y-1 hover:shadow-md',
        highlighted ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border/50',
      )}
    >
      {/* Top visual block — same height as WatchCard thumbnail */}
      <div className="h-[120px] shrink-0 flex items-center justify-center bg-blue-500/5 border-b border-border/50">
        <div className="p-4 rounded-2xl bg-blue-500/10">
          <BookOpen className="w-8 h-8 text-blue-500" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 bg-card">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded bg-blue-500/10">
              <BookOpen className="w-3 h-3 text-blue-500" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Read</span>
          </div>
          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-sm font-medium text-foreground flex-1">Official Quick Start</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{displayUrl}</p>
      </div>
    </a>
  )
}

function ProjectCard({ idea, duration, highlighted }: {
  idea: string | undefined
  duration: string | undefined
  highlighted: boolean
}) {
  if (!idea) {
    return (
      <div className="flex flex-col rounded-lg border border-dashed p-4 h-full opacity-50">
        <div className="flex items-center justify-center flex-1 gap-2 flex-col">
          <Rocket className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">No project idea yet</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group flex flex-col rounded-lg border overflow-hidden h-full transition-all hover:-translate-y-1 hover:shadow-md',
        highlighted ? 'border-primary/50 ring-1 ring-primary/30' : 'border-border/50',
      )}
    >
      {/* Top visual block — same height as WatchCard thumbnail */}
      <div className="relative h-[120px] shrink-0 flex items-center justify-center bg-orange-500/5 border-b border-border/50">
        <div className="p-4 rounded-2xl bg-orange-500/10">
          <Rocket className="w-8 h-8 text-orange-500" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 bg-card">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded bg-orange-500/10">
              <Rocket className="w-3 h-3 text-orange-500" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Build</span>
          </div>
          {duration && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              {duration}
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium text-foreground leading-snug flex-1 line-clamp-3">{idea}</p>
      </div>
    </div>
  )
}
