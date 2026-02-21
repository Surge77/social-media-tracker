'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TechStatsResponse } from '@/hooks/useTechStats'

interface WeeklyDigestProps {
  data: TechStatsResponse['weekly_digest'] | null
  isLoading: boolean
  isError: boolean
}

const PREVIEW_COUNT = 2

export function WeeklyDigest({ data, isLoading, isError }: WeeklyDigestProps) {
  const [expanded, setExpanded] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number] },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            📰 This Week in Tech
          </span>
          {data && (
            <span className="hidden sm:inline text-[10px] text-muted-foreground/60 font-normal">
              {data.period}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-muted" />
                <div
                  className="h-4 animate-pulse rounded bg-muted"
                  style={{ width: `${65 + i * 7}%` }}
                />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">Unable to load weekly digest.</p>
        ) : data && data.highlights.length > 0 ? (
          <>
            {/* Mobile: show period below header */}
            {data.period && (
              <p className="mb-2 text-[10px] text-muted-foreground/60 sm:hidden">{data.period}</p>
            )}

            <ul className="flex flex-col gap-2">
              {/* Always-visible bullets */}
              {data.highlights.slice(0, PREVIEW_COUNT).map((highlight, i) => (
                <BulletItem key={i} text={highlight} />
              ))}

              {/* Collapsible extra bullets */}
              <AnimatePresence initial={false}>
                {expanded && data.highlights.length > PREVIEW_COUNT && (
                  <motion.div
                    key="extra-bullets"
                    initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, height: 'auto' }}
                    exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                    className="flex flex-col gap-2 overflow-hidden"
                  >
                    {data.highlights.slice(PREVIEW_COUNT).map((highlight, i) => (
                      <BulletItem key={i + PREVIEW_COUNT} text={highlight} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </ul>

            {/* Show more / less toggle */}
            {data.highlights.length > PREVIEW_COUNT && (
              <button
                onClick={() => setExpanded((prev) => !prev)}
                className={cn(
                  'mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground',
                  'hover:text-foreground transition-colors focus-visible:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded'
                )}
                aria-expanded={expanded}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Show {data.highlights.length - PREVIEW_COUNT} more
                  </>
                )}
              </button>
            )}

            {/* New techs added pill */}
            {data.new_techs_added > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                  +{data.new_techs_added} new technologies added this week
                </span>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No digest available yet.</p>
        )}
      </div>
    </motion.div>
  )
}

function BulletItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed">
      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
      {text}
    </li>
  )
}
