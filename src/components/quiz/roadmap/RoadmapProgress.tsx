'use client'

// src/components/quiz/roadmap/RoadmapProgress.tsx
// Progress tracking UI overlay

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Flame, Clock, Target } from 'lucide-react'
import { getRoadmapProgress, calculateCompletion } from '@/lib/quiz/roadmap-progress'
import type { GeneratedRoadmap } from '@/lib/quiz/roadmap-engine'

interface RoadmapProgressProps {
  roadmap: GeneratedRoadmap
}

export function RoadmapProgressTracker({ roadmap }: RoadmapProgressProps) {
  const [progress, setProgress] = useState<ReturnType<typeof getRoadmapProgress>>(null)

  useEffect(() => {
    const loadProgress = () => {
      const stored = getRoadmapProgress(roadmap.roadmapId)
      setProgress(stored)
    }

    loadProgress()

    // Listen for progress updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'devtrends-roadmap-progress') {
        loadProgress()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [roadmap.roadmapId])

  if (!progress) return null

  const allNodes = roadmap.phases.flatMap(p => p.nodes.map(n => n.id))
  const completionPercentage = calculateCompletion(progress.completedNodes, allNodes)

  return (
    <Card className="sticky top-20 z-10 mb-6 border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Completion */}
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Your Progress</span>
              <Badge variant="secondary">{completionPercentage}%</Badge>
            </div>
            <Progress value={completionPercentage} className="mt-1 w-32" />
          </div>
        </div>

        {/* Streak */}
        {progress.streakDays > 0 && (
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">{progress.streakDays} day streak!</span>
          </div>
        )}

        {/* Hours logged */}
        {progress.totalHoursLogged > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {progress.totalHoursLogged}h invested
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
