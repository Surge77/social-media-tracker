'use client'

import React, { useState } from 'react'
import { RotateCcw, Bookmark, Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ResultActionsProps {
  onRetake: () => void
  retakeLabel?: string
  shareText?: string
}

export function ResultActions({
  onRetake,
  retakeLabel = 'Retake Quiz',
  shareText,
}: ResultActionsProps) {
  const [saved, setSaved] = useState(false)
  const [shared, setShared] = useState(false)

  const handleSave = () => {
    // saveQuizResult is already called by the quiz page before rendering results.
    // This button acknowledges the save with visual feedback.
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = shareText
      ? `${shareText}\n\n${url}`
      : url

    try {
      await navigator.clipboard.writeText(text)
      setShared(true)
      setTimeout(() => setShared(false), 2500)
    } catch {
      // Fallback for browsers without clipboard API
      try {
        const el = document.createElement('textarea')
        el.value = text
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        setShared(true)
        setTimeout(() => setShared(false), 2500)
      } catch {
        // silent fail
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-border">
      <Button onClick={onRetake} variant="outline" className="flex-1 sm:flex-none">
        <RotateCcw className="w-4 h-4 mr-2" />
        {retakeLabel}
      </Button>

      <Button
        variant="ghost"
        className="flex-1 sm:flex-none"
        onClick={handleSave}
      >
        {saved ? (
          <>
            <Check className="w-4 h-4 mr-2 text-emerald-500" />
            <span className="text-emerald-500">Saved locally</span>
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4 mr-2" />
            Save Result
          </>
        )}
      </Button>

      <Button
        variant="ghost"
        className="flex-1 sm:flex-none"
        onClick={handleShare}
      >
        {shared ? (
          <>
            <Check className="w-4 h-4 mr-2 text-emerald-500" />
            <span className="text-emerald-500">Link copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </>
        )}
      </Button>
    </div>
  )
}
