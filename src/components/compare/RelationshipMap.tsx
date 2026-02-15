'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  GitMerge,
  Zap,
  Shield,
  Box,
} from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { CompareData } from '@/types'

interface RelationshipMapProps {
  compareData: CompareData
  className?: string
}

const RELATIONSHIP_CONFIG: Record<string, {
  label: string
  icon: React.ReactNode
  color: string
  description: string
}> = {
  'builds-on': {
    label: 'Builds On',
    icon: <ArrowRight className="h-3.5 w-3.5" />,
    color: 'text-blue-400',
    description: 'Foundation dependency',
  },
  'competes-with': {
    label: 'Competes With',
    icon: <Zap className="h-3.5 w-3.5" />,
    color: 'text-orange-400',
    description: 'Direct alternative',
  },
  'complements': {
    label: 'Complements',
    icon: <GitMerge className="h-3.5 w-3.5" />,
    color: 'text-emerald-400',
    description: 'Works well together',
  },
  'supersedes': {
    label: 'Supersedes',
    icon: <Shield className="h-3.5 w-3.5" />,
    color: 'text-purple-400',
    description: 'Replaces older tech',
  },
  'ecosystem': {
    label: 'Same Ecosystem',
    icon: <Box className="h-3.5 w-3.5" />,
    color: 'text-cyan-400',
    description: 'Part of same stack',
  },
}

export function RelationshipMap({ compareData, className }: RelationshipMapProps) {
  const prefersReducedMotion = useReducedMotion()
  const relationships = compareData.relationships || []

  // DEBUG: Log what we're receiving
  console.log('RelationshipMap DEBUG:', {
    hasCompareData: !!compareData,
    relationshipsFromData: compareData.relationships,
    relationshipsLength: relationships.length,
    technologies: compareData.technologies?.map(t => t.slug)
  })

  // Build tech lookup
  const techBySlug = new Map(
    compareData.technologies.map((tech) => [tech.slug, tech])
  )

  if (relationships.length === 0) {
    return (
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn('rounded-xl border border-border bg-card/30 p-5', className)}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Technology Relationships</h3>
          <p className="text-sm text-muted-foreground">
            How these technologies relate to each other
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No documented relationships between these technologies yet
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('rounded-xl border border-border bg-card/30 p-5', className)}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Technology Relationships</h3>
        <p className="text-sm text-muted-foreground">
          How these technologies relate to each other
        </p>
      </div>

      {/* Relationship list */}
      <div className="space-y-2.5">
        {relationships.map((rel, idx) => {
          const sourceTech = techBySlug.get(rel.source)
          const targetTech = techBySlug.get(rel.target)
          const config = RELATIONSHIP_CONFIG[rel.type] || RELATIONSHIP_CONFIG['ecosystem']

          if (!sourceTech || !targetTech) return null

          return (
            <motion.div
              key={`${rel.source}-${rel.target}-${rel.type}`}
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="group rounded-lg border border-border bg-card/50 p-4 transition-all hover:border-primary/50 hover:bg-card"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Source tech */}
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: sourceTech.color }}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {sourceTech.name}
                  </span>
                </div>

                {/* Relationship type */}
                <div className="flex flex-col items-center gap-1">
                  <div className={cn('flex items-center gap-1', config.color)}>
                    {config.icon}
                    <span className="text-xs font-medium">{config.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {config.description}
                  </span>
                </div>

                {/* Target tech */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {targetTech.name}
                  </span>
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: targetTech.color }}
                  />
                </div>
              </div>

              {/* Strength indicator */}
              {rel.strength > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Relationship strength</span>
                    <span>{Math.round(rel.strength * 100)}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${rel.strength * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 rounded-lg border border-border bg-card/50 p-3">
        <p className="mb-2 text-xs font-semibold text-foreground">Relationship Types</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(RELATIONSHIP_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={config.color}>{config.icon}</div>
              <div>
                <p className="text-xs font-medium text-foreground">{config.label}</p>
                <p className="text-[10px] text-muted-foreground">{config.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
