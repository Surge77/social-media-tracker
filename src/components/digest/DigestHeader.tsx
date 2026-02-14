'use client'

import React from 'react'
import { Calendar, Sparkles } from 'lucide-react'

interface DigestHeaderProps {
  weekStart: string
  generatedAt: string
}

export function DigestHeader({ weekStart, generatedAt }: DigestHeaderProps) {
  const weekStartDate = new Date(weekStart)
  const weekEndDate = new Date(weekStartDate)
  weekEndDate.setDate(weekEndDate.getDate() + 6)

  const weekRange = `${weekStartDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })} - ${weekEndDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`

  const generatedDate = new Date(generatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-primary">AI-Generated Intelligence</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Weekly Digest</h1>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{weekRange}</span>
        </div>

        <span>•</span>

        <span>Generated {generatedDate}</span>
      </div>
    </div>
  )
}
