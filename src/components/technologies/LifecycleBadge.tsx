import { cn } from '@/lib/utils'

interface LifecycleBadgeProps {
  stage: string | undefined
  label?: string
  className?: string
}

interface StageConfig {
  emoji: string
  defaultLabel: string
  textClass: string
  bgClass: string
}

const STAGE_CONFIG: Record<string, StageConfig> = {
  emerging: {
    emoji: '🌱',
    defaultLabel: 'Emerging',
    textClass: 'text-green-400',
    bgClass: 'bg-green-500/10',
  },
  growing: {
    emoji: '📈',
    defaultLabel: 'Growth',
    textClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10',
  },
  hype: {
    emoji: '🔥',
    defaultLabel: 'Hype',
    textClass: 'text-orange-400',
    bgClass: 'bg-orange-500/10',
  },
  mature: {
    emoji: '🏛️',
    defaultLabel: 'Mature',
    textClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10',
  },
  plateau: {
    emoji: '➡️',
    defaultLabel: 'Plateau',
    textClass: 'text-gray-400',
    bgClass: 'bg-gray-500/10',
  },
  declining: {
    emoji: '📉',
    defaultLabel: 'Declining',
    textClass: 'text-red-400',
    bgClass: 'bg-red-500/10',
  },
  legacy: {
    emoji: '🏚️',
    defaultLabel: 'Legacy',
    textClass: 'text-red-600',
    bgClass: 'bg-red-600/10',
  },
  niche: {
    emoji: '🎯',
    defaultLabel: 'Niche',
    textClass: 'text-yellow-400',
    bgClass: 'bg-yellow-500/10',
  },
}

export default function LifecycleBadge({ stage, label, className }: LifecycleBadgeProps) {
  if (!stage) return null

  const config = STAGE_CONFIG[stage.toLowerCase()]
  if (!config) return null

  const displayLabel = label ?? config.defaultLabel

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5',
        'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
        config.textClass,
        config.bgClass,
        className,
      )}
    >
      <span aria-hidden="true">{config.emoji}</span>
      {displayLabel}
    </span>
  )
}
