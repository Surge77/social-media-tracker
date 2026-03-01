import React from 'react'
import { Play, TrendingUp, TrendingDown, Minus, Youtube } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { YouTubeTopVideo } from '@/types'

interface YouTubeSignals {
  videoCount30d: number
  totalViews: number
  avgLikes: number
  uploadVelocity: number
  topVideos: YouTubeTopVideo[]
}

interface YouTubeSignalsCardProps {
  signals: YouTubeSignals | null
  className?: string
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function YouTubeSignalsCard({ signals, className }: YouTubeSignalsCardProps) {
  if (!signals) {
    return (
      <div className={cn(
        'rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm',
        className
      )}>
        <div className="mb-3 flex items-center gap-2">
          <Youtube className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">YouTube Signals</h3>
        </div>
        <p className="text-sm text-muted-foreground">No YouTube data yet</p>
      </div>
    )
  }

  const engagementRate = signals.totalViews > 0
    ? ((signals.avgLikes / (signals.totalViews / signals.videoCount30d)) * 100).toFixed(1)
    : '0.0'

  const VelocityIcon = signals.uploadVelocity > 0
    ? TrendingUp
    : signals.uploadVelocity < 0 ? TrendingDown : Minus
  const velocityColor = signals.uploadVelocity > 0
    ? 'text-success'
    : signals.uploadVelocity < 0 ? 'text-destructive' : 'text-muted-foreground'

  const tutorials = signals.topVideos.filter(v => v.intent === 'tutorial')
  const comparisons = signals.topVideos.filter(v => v.intent === 'comparison')
  const displayVideos = [...tutorials, ...comparisons].slice(0, 3)

  return (
    <div className={cn(
      'rounded-lg border border-border bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50',
      className
    )}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Youtube className="w-4 h-4 text-red-500" />
        <h3 className="font-semibold text-foreground">YouTube Signals</h3>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Videos (30d)</span>
          <span className="font-mono font-medium text-foreground">{signals.videoCount30d}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total views</span>
          <span className="font-mono font-medium text-foreground">{formatCount(signals.totalViews)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Avg likes</span>
          <span className="font-mono font-medium text-foreground">{formatCount(signals.avgLikes)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Engagement</span>
          <span className="font-mono font-medium text-foreground">{engagementRate}%</span>
        </div>
      </div>

      {/* Upload velocity */}
      <div className="flex items-center gap-1.5 text-xs mb-4 pb-3 border-b border-border/50">
        <VelocityIcon className={cn('w-3.5 h-3.5', velocityColor)} />
        <span className={cn('font-medium', velocityColor)}>
          {signals.uploadVelocity > 0 ? '+' : ''}{signals.uploadVelocity} uploads
        </span>
        <span className="text-muted-foreground">vs prior week</span>
      </div>

      {/* Top videos */}
      {displayVideos.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Trending Videos
          </p>
          {displayVideos.map(video => (
            <a
              key={video.videoId}
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 group rounded-lg p-1.5 -mx-1.5 transition-colors hover:bg-muted/50"
            >
              {/* Thumbnail */}
              <div className="relative w-16 h-10 rounded overflow-hidden shrink-0 bg-muted">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3 h-3 text-white" />
                </div>
                {video.intent === 'comparison' && (
                  <div className="absolute top-0.5 left-0.5 bg-black/70 rounded px-1 text-[9px] text-white/80">
                    compare
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {video.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {video.channel} · {formatCount(video.views)} views · {formatDate(video.publishedAt)}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
