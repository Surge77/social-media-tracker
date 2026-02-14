'use client'

import React, { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackButtonsProps {
  insightId: string
  className?: string
}

export function FeedbackButtons({ insightId, className }: FeedbackButtonsProps) {
  const [submitted, setSubmitted] = useState<'up' | 'down' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFeedback = async (helpful: boolean) => {
    if (submitted || isSubmitting) return

    setIsSubmitting(true)
    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId, helpful }),
      })
      setSubmitted(helpful ? 'up' : 'down')
    } catch {
      // Silently fail — feedback is non-critical
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
        {submitted === 'up' ? (
          <ThumbsUp size={13} className="text-emerald-400" />
        ) : (
          <ThumbsDown size={13} className="text-amber-400" />
        )}
        <span>Thanks for the feedback</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3 text-xs text-muted-foreground', className)}>
      <span>Was this helpful?</span>
      <button
        onClick={() => handleFeedback(true)}
        disabled={isSubmitting}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50"
      >
        <ThumbsUp size={13} />
        Yes
      </button>
      <button
        onClick={() => handleFeedback(false)}
        disabled={isSubmitting}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-amber-500/10 hover:text-amber-400 disabled:opacity-50"
      >
        <ThumbsDown size={13} />
        No
      </button>
    </div>
  )
}
