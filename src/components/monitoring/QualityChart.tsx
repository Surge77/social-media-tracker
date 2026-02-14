'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function QualityChart() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.5, delay: 0.5 }}
      className="rounded-lg border bg-card p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Quality Trends</h2>
          <p className="text-sm text-muted-foreground">Coming soon - Historical quality metrics</p>
        </div>
      </div>

      <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Chart will display quality trends over time once more data is collected
        </p>
      </div>
    </motion.div>
  )
}
