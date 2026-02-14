'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, Target } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

export type UserRole = 'beginner' | 'mid-level' | 'senior' | 'tech-lead'
export type UserGoal = 'learning' | 'side-project' | 'production' | 'job-hunting' | 'migration'

interface ContextSelectorProps {
  role: UserRole | null
  goal: UserGoal | null
  onRoleChange: (role: UserRole) => void
  onGoalChange: (goal: UserGoal) => void
  className?: string
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'mid-level', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
  { value: 'tech-lead', label: 'Tech Lead' },
]

const GOALS: { value: UserGoal; label: string }[] = [
  { value: 'learning', label: 'Learning' },
  { value: 'side-project', label: 'Side Project' },
  { value: 'production', label: 'Production Use' },
  { value: 'job-hunting', label: 'Job Hunting' },
  { value: 'migration', label: 'Migration' },
]

export function ContextSelector({
  role,
  goal,
  onRoleChange,
  onGoalChange,
  className,
}: ContextSelectorProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-lg border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-4',
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-md bg-primary/10 p-1.5">
          <Target className="h-4 w-4 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Tell us about yourself <span className="text-muted-foreground">(optional, improves advice)</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Role Selector */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            Your role
          </label>
          <select
            value={role || ''}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className={cn(
              'w-full rounded-md border border-border bg-background px-3 py-2 text-sm',
              'outline-none ring-offset-background transition-all',
              'focus-visible:ring-2 focus-visible:ring-ring',
              !role && 'text-muted-foreground'
            )}
          >
            <option value="" disabled>
              Select your role...
            </option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Goal Selector */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            Your goal
          </label>
          <select
            value={goal || ''}
            onChange={(e) => onGoalChange(e.target.value as UserGoal)}
            className={cn(
              'w-full rounded-md border border-border bg-background px-3 py-2 text-sm',
              'outline-none ring-offset-background transition-all',
              'focus-visible:ring-2 focus-visible:ring-ring',
              !goal && 'text-muted-foreground'
            )}
          >
            <option value="" disabled>
              Select your goal...
            </option>
            {GOALS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Helper text */}
      {(role || goal) && (
        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 text-xs text-muted-foreground"
        >
          ✨ AI advice will be personalized for {role && <span className="font-medium text-foreground">{ROLES.find(r => r.value === role)?.label}</span>}
          {role && goal && ' '}
          {goal && <>focused on <span className="font-medium text-foreground">{GOALS.find(g => g.value === goal)?.label}</span></>}
        </motion.p>
      )}
    </motion.div>
  )
}
