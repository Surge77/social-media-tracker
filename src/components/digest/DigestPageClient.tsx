'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { DigestHeader } from '@/components/digest/DigestHeader'
import { DigestCard } from '@/components/digest/DigestCard'
import type { WeeklyDigest } from '@/lib/ai/generators/weekly-digest'

export function DigestPageClient() {
  const prefersReducedMotion = useReducedMotion()
  const [digest, setDigest] = React.useState<WeeklyDigest | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchDigest() {
      try {
        const response = await fetch('/api/ai/digest/latest')
        if (!response.ok) {
          throw new Error('Failed to fetch digest')
        }

        const data = await response.json()

        if (data.digest) {
          setDigest(data.digest)
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDigest()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <p className="text-destructive">Failed to load digest: {error}</p>
        </div>
      </div>
    )
  }

  if (!digest) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-4">Weekly Digest</h1>
          <div className="rounded-lg border bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No digest available yet. Check back Monday for the latest weekly intelligence report.
            </p>
            <p className="text-sm text-muted-foreground">
              Weekly digests are generated every Monday at 3am UTC.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.5 }}
      >
        <DigestHeader weekStart={digest.weekStart} generatedAt={digest.generatedAt} />

        <div className="space-y-6 mt-8">
          {digest.sections.map((section, index) => (
            <DigestCard
              key={index}
              section={section}
              index={index}
            />
          ))}
        </div>

        {digest.keyTakeaways && digest.keyTakeaways.length > 0 && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.5, delay: 0.3 }}
            className="mt-8 rounded-lg border bg-primary/5 border-primary/20 p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              {digest.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold">•</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
