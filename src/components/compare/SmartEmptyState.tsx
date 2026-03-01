'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Loader2,
  BrainCircuit,
} from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type TrendDirection = 'hot' | 'rising' | 'stable' | 'declining'

interface TechTrend {
  slug: string
  label: string
  trend: TrendDirection
}

interface Comparison {
  name: string
  slugs: string[]
  techs: TechTrend[]
  hot?: boolean
  description: string
  aiReasoning?: string
  trendReason?: string
}

interface CategoryData {
  label: string
  comparisons: Comparison[]
}

interface RecentComparison {
  slugs: string[]
  name: string
  timestamp: number
}

type DecideGoal = 'learning' | 'jobs' | 'project'
type DecideFocus = 'frontend' | 'backend' | 'fullstack' | 'devops' | 'data'
type DecideLevel = 'beginner' | 'mid' | 'senior'

// ─── Static Data ──────────────────────────────────────────────────────────────

const CATEGORIES: Record<string, CategoryData> = {
  frontend: {
    label: 'Frontend',
    comparisons: [
      {
        name: 'React vs Vue',
        slugs: ['react', 'vue'],
        techs: [
          { slug: 'react', label: 'React', trend: 'hot' },
          { slug: 'vue', label: 'Vue', trend: 'stable' },
        ],
        hot: true,
        description: 'The dominant UI library vs the progressive framework',
      },
      {
        name: 'TypeScript vs JavaScript',
        slugs: ['typescript', 'javascript'],
        techs: [
          { slug: 'typescript', label: 'TypeScript', trend: 'hot' },
          { slug: 'javascript', label: 'JavaScript', trend: 'stable' },
        ],
        hot: true,
        description: 'Typed superset adoption vs vanilla JS',
      },
      {
        name: 'Next.js vs Remix',
        slugs: ['nextjs', 'remix'],
        techs: [
          { slug: 'nextjs', label: 'Next.js', trend: 'rising' },
          { slug: 'remix', label: 'Remix', trend: 'stable' },
        ],
        description: 'Full-stack React meta-frameworks compared',
      },
      {
        name: 'React vs Angular',
        slugs: ['react', 'angular'],
        techs: [
          { slug: 'react', label: 'React', trend: 'hot' },
          { slug: 'angular', label: 'Angular', trend: 'declining' },
        ],
        description: 'Library vs opinionated enterprise framework',
      },
      {
        name: 'Svelte vs Vue',
        slugs: ['svelte', 'vue'],
        techs: [
          { slug: 'svelte', label: 'Svelte', trend: 'rising' },
          { slug: 'vue', label: 'Vue', trend: 'stable' },
        ],
        description: 'Compiler-first vs reactive progressive framework',
      },
      {
        name: 'Vite vs Webpack',
        slugs: ['vite', 'webpack'],
        techs: [
          { slug: 'vite', label: 'Vite', trend: 'hot' },
          { slug: 'webpack', label: 'Webpack', trend: 'declining' },
        ],
        description: 'Modern ESM bundler vs the incumbent',
      },
    ],
  },
  backend: {
    label: 'Backend',
    comparisons: [
      {
        name: 'Node.js vs Bun',
        slugs: ['nodejs', 'bun'],
        techs: [
          { slug: 'nodejs', label: 'Node.js', trend: 'stable' },
          { slug: 'bun', label: 'Bun', trend: 'hot' },
        ],
        hot: true,
        description: 'The incumbent runtime vs the fast challenger',
      },
      {
        name: 'Python vs Go',
        slugs: ['python', 'go'],
        techs: [
          { slug: 'python', label: 'Python', trend: 'rising' },
          { slug: 'go', label: 'Go', trend: 'rising' },
        ],
        description: 'Versatile scripting powerhouse vs systems-speed',
      },
      {
        name: 'Rust vs Go',
        slugs: ['rust', 'go'],
        techs: [
          { slug: 'rust', label: 'Rust', trend: 'rising' },
          { slug: 'go', label: 'Go', trend: 'rising' },
        ],
        description: 'Memory-safe systems language vs simplicity',
      },
      {
        name: 'FastAPI vs Express',
        slugs: ['fastapi', 'express'],
        techs: [
          { slug: 'fastapi', label: 'FastAPI', trend: 'hot' },
          { slug: 'express', label: 'Express', trend: 'stable' },
        ],
        description: 'Modern async Python API vs minimal Node.js server',
      },
      {
        name: 'Django vs FastAPI',
        slugs: ['django', 'fastapi'],
        techs: [
          { slug: 'django', label: 'Django', trend: 'stable' },
          { slug: 'fastapi', label: 'FastAPI', trend: 'rising' },
        ],
        description: 'Batteries-included vs high-performance async',
      },
      {
        name: 'Python vs JavaScript',
        slugs: ['python', 'javascript'],
        techs: [
          { slug: 'python', label: 'Python', trend: 'rising' },
          { slug: 'javascript', label: 'JavaScript', trend: 'stable' },
        ],
        description: 'Classic first-language debate for backend',
      },
    ],
  },
  devops: {
    label: 'DevOps',
    comparisons: [
      {
        name: 'GitHub Actions vs Jenkins',
        slugs: ['github-actions', 'jenkins'],
        techs: [
          { slug: 'github-actions', label: 'GH Actions', trend: 'hot' },
          { slug: 'jenkins', label: 'Jenkins', trend: 'declining' },
        ],
        hot: true,
        description: 'Cloud-native CI/CD vs the self-hosted veteran',
      },
      {
        name: 'Docker vs Kubernetes',
        slugs: ['docker', 'kubernetes'],
        techs: [
          { slug: 'docker', label: 'Docker', trend: 'stable' },
          { slug: 'kubernetes', label: 'Kubernetes', trend: 'rising' },
        ],
        description: 'Container packaging vs orchestration at scale',
      },
      {
        name: 'Terraform vs Pulumi',
        slugs: ['terraform', 'pulumi'],
        techs: [
          { slug: 'terraform', label: 'Terraform', trend: 'stable' },
          { slug: 'pulumi', label: 'Pulumi', trend: 'rising' },
        ],
        description: 'HCL IaC standard vs code-first infrastructure',
      },
      {
        name: 'AWS vs Azure',
        slugs: ['aws', 'azure'],
        techs: [
          { slug: 'aws', label: 'AWS', trend: 'stable' },
          { slug: 'azure', label: 'Azure', trend: 'rising' },
        ],
        description: 'Cloud market leader vs Microsoft enterprise cloud',
      },
    ],
  },
  data: {
    label: 'Data & ML',
    comparisons: [
      {
        name: 'PyTorch vs TensorFlow',
        slugs: ['pytorch', 'tensorflow'],
        techs: [
          { slug: 'pytorch', label: 'PyTorch', trend: 'hot' },
          { slug: 'tensorflow', label: 'TensorFlow', trend: 'declining' },
        ],
        hot: true,
        description: 'Research-favorite ML framework vs Google\'s incumbent',
      },
      {
        name: 'PostgreSQL vs MongoDB',
        slugs: ['postgresql', 'mongodb'],
        techs: [
          { slug: 'postgresql', label: 'PostgreSQL', trend: 'rising' },
          { slug: 'mongodb', label: 'MongoDB', trend: 'stable' },
        ],
        description: 'Relational power vs document flexibility',
      },
      {
        name: 'Pandas vs Polars',
        slugs: ['pandas', 'polars'],
        techs: [
          { slug: 'pandas', label: 'Pandas', trend: 'stable' },
          { slug: 'polars', label: 'Polars', trend: 'hot' },
        ],
        hot: true,
        description: 'The data science standard vs the Rust-powered challenger',
      },
      {
        name: 'Redis vs PostgreSQL',
        slugs: ['redis', 'postgresql'],
        techs: [
          { slug: 'redis', label: 'Redis', trend: 'stable' },
          { slug: 'postgresql', label: 'PostgreSQL', trend: 'rising' },
        ],
        description: 'In-memory cache vs ACID relational database',
      },
    ],
  },
  cloud: {
    label: 'Cloud',
    comparisons: [
      {
        name: 'Vercel vs Netlify',
        slugs: ['vercel', 'netlify'],
        techs: [
          { slug: 'vercel', label: 'Vercel', trend: 'hot' },
          { slug: 'netlify', label: 'Netlify', trend: 'stable' },
        ],
        hot: true,
        description: 'DX-first deploy platform vs JAMstack pioneer',
      },
      {
        name: 'Supabase vs Firebase',
        slugs: ['supabase', 'firebase'],
        techs: [
          { slug: 'supabase', label: 'Supabase', trend: 'hot' },
          { slug: 'firebase', label: 'Firebase', trend: 'stable' },
        ],
        hot: true,
        description: 'Open-source Postgres BaaS vs Google\'s NoSQL platform',
      },
      {
        name: 'AWS vs GCP',
        slugs: ['aws', 'gcp'],
        techs: [
          { slug: 'aws', label: 'AWS', trend: 'stable' },
          { slug: 'gcp', label: 'GCP', trend: 'rising' },
        ],
        description: 'Cloud pioneer vs Google\'s AI-first cloud',
      },
      {
        name: 'AWS vs Azure',
        slugs: ['aws', 'azure'],
        techs: [
          { slug: 'aws', label: 'AWS', trend: 'stable' },
          { slug: 'azure', label: 'Azure', trend: 'rising' },
        ],
        description: 'Broadest service catalog vs enterprise Microsoft cloud',
      },
    ],
  },
}

const CATEGORY_KEYS = ['frontend', 'backend', 'devops', 'data', 'cloud'] as const

// ─── Help Me Decide Matrix ────────────────────────────────────────────────────

function getRecommendedComparison(
  goal: DecideGoal,
  focus: DecideFocus,
  level: DecideLevel
): Comparison {
  const matrix: Record<string, Comparison> = {
    // Learning combos
    'learning-frontend-beginner': CATEGORIES.frontend.comparisons[0], // React vs Vue
    'learning-frontend-mid': CATEGORIES.frontend.comparisons[1],      // TypeScript vs JS
    'learning-frontend-senior': CATEGORIES.frontend.comparisons[2],   // Next.js vs Remix
    'learning-backend-beginner': CATEGORIES.backend.comparisons[5],   // Python vs JS
    'learning-backend-mid': CATEGORIES.backend.comparisons[1],        // Python vs Go
    'learning-backend-senior': CATEGORIES.backend.comparisons[2],     // Rust vs Go
    'learning-fullstack-beginner': CATEGORIES.frontend.comparisons[1],// TypeScript vs JS
    'learning-fullstack-mid': CATEGORIES.frontend.comparisons[2],     // Next.js vs Remix
    'learning-fullstack-senior': CATEGORIES.backend.comparisons[0],   // Node.js vs Bun
    'learning-devops-beginner': CATEGORIES.devops.comparisons[1],     // Docker vs K8s
    'learning-devops-mid': CATEGORIES.devops.comparisons[2],          // Terraform vs Pulumi
    'learning-devops-senior': CATEGORIES.devops.comparisons[0],       // GH Actions vs Jenkins
    'learning-data-beginner': CATEGORIES.data.comparisons[1],         // PostgreSQL vs MongoDB
    'learning-data-mid': CATEGORIES.data.comparisons[0],              // PyTorch vs TensorFlow
    'learning-data-senior': CATEGORIES.data.comparisons[2],           // Pandas vs Polars
    // Jobs combos
    'jobs-frontend-beginner': CATEGORIES.frontend.comparisons[0],     // React vs Vue
    'jobs-frontend-mid': CATEGORIES.frontend.comparisons[3],          // React vs Angular
    'jobs-frontend-senior': CATEGORIES.frontend.comparisons[2],       // Next.js vs Remix
    'jobs-backend-beginner': CATEGORIES.backend.comparisons[5],       // Python vs JS
    'jobs-backend-mid': CATEGORIES.backend.comparisons[1],            // Python vs Go
    'jobs-backend-senior': CATEGORIES.backend.comparisons[2],         // Rust vs Go
    'jobs-fullstack-beginner': CATEGORIES.frontend.comparisons[0],    // React vs Vue
    'jobs-fullstack-mid': CATEGORIES.frontend.comparisons[2],         // Next.js vs Remix
    'jobs-fullstack-senior': CATEGORIES.backend.comparisons[0],       // Node vs Bun
    'jobs-devops-beginner': CATEGORIES.devops.comparisons[1],         // Docker vs K8s
    'jobs-devops-mid': CATEGORIES.devops.comparisons[3],              // AWS vs Azure
    'jobs-devops-senior': CATEGORIES.devops.comparisons[0],           // GH Actions vs Jenkins
    'jobs-data-beginner': CATEGORIES.data.comparisons[1],             // PostgreSQL vs MongoDB
    'jobs-data-mid': CATEGORIES.data.comparisons[0],                  // PyTorch vs TensorFlow
    'jobs-data-senior': CATEGORIES.data.comparisons[2],               // Pandas vs Polars
    // Project combos
    'project-frontend-beginner': CATEGORIES.frontend.comparisons[0],  // React vs Vue
    'project-frontend-mid': CATEGORIES.frontend.comparisons[2],       // Next.js vs Remix
    'project-frontend-senior': CATEGORIES.frontend.comparisons[4],    // Svelte vs Vue
    'project-backend-beginner': CATEGORIES.backend.comparisons[3],    // FastAPI vs Express
    'project-backend-mid': CATEGORIES.backend.comparisons[4],         // Django vs FastAPI
    'project-backend-senior': CATEGORIES.backend.comparisons[2],      // Rust vs Go
    'project-fullstack-beginner': CATEGORIES.frontend.comparisons[2], // Next.js vs Remix
    'project-fullstack-mid': CATEGORIES.cloud.comparisons[1],         // Supabase vs Firebase
    'project-fullstack-senior': CATEGORIES.backend.comparisons[0],    // Node vs Bun
    'project-devops-beginner': CATEGORIES.devops.comparisons[1],      // Docker vs K8s
    'project-devops-mid': CATEGORIES.devops.comparisons[2],           // Terraform vs Pulumi
    'project-devops-senior': CATEGORIES.devops.comparisons[3],        // AWS vs Azure
    'project-data-beginner': CATEGORIES.data.comparisons[1],          // PostgreSQL vs MongoDB
    'project-data-mid': CATEGORIES.data.comparisons[0],               // PyTorch vs TensorFlow
    'project-data-senior': CATEGORIES.data.comparisons[2],            // Pandas vs Polars
  }

  const key = `${goal}-${focus}-${level}`
  return matrix[key] ?? CATEGORIES.frontend.comparisons[0]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: TrendDirection }) {
  if (trend === 'hot') {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-500">
        <Flame className="h-2.5 w-2.5" />
        Hot
      </span>
    )
  }
  if (trend === 'rising') {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">
        <TrendingUp className="h-2.5 w-2.5" />
        Rising
      </span>
    )
  }
  if (trend === 'declining') {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
        <TrendingDown className="h-2.5 w-2.5" />
        Declining
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
      <Minus className="h-2.5 w-2.5" />
      Stable
    </span>
  )
}

function ComparisonCard({
  comparison,
  onClick,
  prefersReducedMotion,
}: {
  comparison: Comparison
  onClick: () => void
  prefersReducedMotion: boolean
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-lg border bg-card/50 p-4 text-left transition-all',
        comparison.hot
          ? 'border-orange-500/30 hover:border-orange-500/60 hover:bg-card hover:shadow-md'
          : 'border-border hover:border-primary/40 hover:bg-card hover:shadow-md'
      )}
      whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
    >
      {/* Hot indicator strip */}
      {comparison.hot && (
        <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-gradient-to-r from-orange-500/60 via-orange-400 to-orange-500/60" />
      )}

      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {comparison.name}
        </p>
        {comparison.hot && (
          <span className="shrink-0 rounded-full bg-orange-500/10 p-1">
            <Flame className="h-3 w-3 text-orange-500" />
          </span>
        )}
      </div>

      <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
        {comparison.description}
      </p>

      {/* Tech trend indicators */}
      <div className="flex flex-wrap gap-2">
        {comparison.techs.map((tech) => (
          <div key={tech.slug} className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-foreground">{tech.label}</span>
            <TrendBadge trend={tech.trend} />
          </div>
        ))}
      </div>
    </motion.button>
  )
}

// ─── Recent Comparisons ───────────────────────────────────────────────────────

const RECENT_KEY = 'devtrends:recent_comparisons'

function RecentComparisons({
  onCompare,
  prefersReducedMotion,
}: {
  onCompare: (slugs: string[]) => void
  prefersReducedMotion: boolean
}) {
  const [recents, setRecents] = useState<RecentComparison[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      if (raw) {
        const parsed: RecentComparison[] = JSON.parse(raw)
        setRecents(parsed.slice(0, 3))
      }
    } catch {
      // ignore
    }
  }, [])

  if (recents.length === 0) return null

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-md bg-muted p-1.5">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Recently Compared</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {recents.map((r) => (
          <motion.button
            key={r.slugs.join(',')}
            onClick={() => onCompare(r.slugs)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-card hover:text-primary"
            whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
          >
            <RotateCcw className="h-3 w-3 text-muted-foreground" />
            {r.name}
          </motion.button>
        ))}
      </div>
    </section>
  )
}

// ─── Help Me Decide ───────────────────────────────────────────────────────────

const GOAL_OPTIONS: { value: DecideGoal; label: string; description: string }[] = [
  { value: 'learning', label: 'Learning', description: 'I want to learn something new' },
  { value: 'jobs', label: 'Job hunting', description: 'I\'m looking at market demand' },
  { value: 'project', label: 'Project choice', description: 'I\'m picking a stack to build with' },
]

const FOCUS_OPTIONS: { value: DecideFocus; label: string }[] = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full-stack' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data / ML' },
]

const LEVEL_OPTIONS: { value: DecideLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
]

function HelpMeDecide({
  onCompare,
  prefersReducedMotion,
}: {
  onCompare: (slugs: string[]) => void
  prefersReducedMotion: boolean
}) {
  const [open, setOpen] = useState(false)
  const [goal, setGoal] = useState<DecideGoal | null>(null)
  const [focus, setFocus] = useState<DecideFocus | null>(null)
  const [level, setLevel] = useState<DecideLevel | null>(null)
  const [aiRecommendation, setAiRecommendation] = useState<Comparison | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Trigger AI recommendation when all 3 are selected
  useEffect(() => {
    if (goal && focus && level) {
      const fetchRecommendation = async () => {
        setIsLoading(true)
        setAiRecommendation(null)
        try {
          const res = await fetch(`/api/ai/recommend?goal=${goal}&focus=${focus}&level=${level}`)
          const data = await res.json()
          if (data.recommendation) {
            const rec = data.recommendation
            setAiRecommendation({
              name: rec.name,
              slugs: rec.slugs,
              description: rec.explanation,
              techs: rec.slugs.map((s: string) => ({
                slug: s,
                label: s.charAt(0).toUpperCase() + s.slice(1),
                trend: 'rising',
              })),
              aiReasoning: rec.explanation,
              trendReason: rec.trendReason,
            })
          } else {
            // Fallback to static matrix
            setAiRecommendation(getRecommendedComparison(goal, focus, level))
          }
        } catch (err) {
          console.error('Failed to get recommendation:', err)
          setAiRecommendation(getRecommendedComparison(goal, focus, level))
        } finally {
          setIsLoading(false)
        }
      }
      fetchRecommendation()
    }
  }, [goal, focus, level])

  const reset = () => {
    setGoal(null)
    setFocus(null)
    setLevel(null)
    setAiRecommendation(null)
  }

  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full rounded-lg border px-4 py-3 text-left transition-all',
          open
            ? 'border-primary/40 bg-primary/5'
            : 'border-dashed border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">AI Tech Consultant</p>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  BETA
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Get personalized comparison advice based on your specific goals
              </p>
            </div>
          </div>
          <ChevronRight
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
              open && 'rotate-90'
            )}
          />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, height: 'auto' }}
            exit={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
              {/* Step 1: Goal */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  1 · What's your goal?
                </p>
                <div className="flex flex-wrap gap-2">
                  {GOAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setGoal(opt.value)}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                        goal === opt.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-card'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Focus */}
              <div className={cn('transition-opacity', !goal && 'opacity-40 pointer-events-none')}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  2 · Your domain?
                </p>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFocus(opt.value)}
                      disabled={!goal}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                        focus === opt.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-card'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Level */}
              <div
                className={cn(
                  'transition-opacity',
                  (!goal || !focus) && 'opacity-40 pointer-events-none'
                )}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  3 · Experience level?
                </p>
                <div className="flex flex-wrap gap-2">
                  {LEVEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setLevel(opt.value)}
                      disabled={!goal || !focus}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                        level === opt.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-card'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result / Loading */}
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-6 text-center"
                  >
                    <Loader2 className="mb-2 h-6 w-6 animate-spin text-primary" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Consulting market trends...
                    </p>
                  </motion.div>
                )}

                {aiRecommendation && !isLoading && (
                  <motion.div
                    key="result"
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? {} : { opacity: 0, y: 4 }}
                    className="relative overflow-hidden rounded-lg border border-primary/30 bg-card p-4 shadow-sm"
                  >
                    <div className="absolute right-0 top-0 p-2 opacity-10">
                      <BrainCircuit size={40} className="text-primary" />
                    </div>

                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      AI Recommendation
                    </p>
                    <p className="mb-1 font-semibold text-foreground">{aiRecommendation.name}</p>
                    
                    <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                      {aiRecommendation.aiReasoning || aiRecommendation.description}
                    </p>

                    {aiRecommendation.trendReason && (
                      <div className="mb-4 flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          {aiRecommendation.trendReason}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          onCompare(aiRecommendation.slugs)
                          setOpen(false)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Load comparison
                        <ChevronRight className="h-3 w-3" />
                      </button>
                      <button
                        onClick={reset}
                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                      >
                        Start over
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ─── Category Browser ─────────────────────────────────────────────────────────

function CategoryBrowser({
  onCompare,
  prefersReducedMotion,
}: {
  onCompare: (slugs: string[]) => void
  prefersReducedMotion: boolean
}) {
  const [activeTab, setActiveTab] = useState<string>('frontend')
  const currentCategory = CATEGORIES[activeTab]

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-md bg-orange-500/10 p-1.5">
          <Flame className="h-4 w-4 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Browse by Category</h3>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {CATEGORY_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              activeTab === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {CATEGORIES[key].label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 6 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? {} : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {currentCategory.comparisons.map((comparison) => (
            <ComparisonCard
              key={comparison.name}
              comparison={comparison}
              onClick={() => onCompare(comparison.slugs)}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface SmartEmptyStateProps {
  onQuickCompare?: (slugs: string[]) => void
}

export function SmartEmptyState({ onQuickCompare }: SmartEmptyStateProps) {
  const prefersReducedMotion = useReducedMotion()

  const handleCompare = (slugs: string[]) => {
    onQuickCompare?.(slugs)
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="space-y-6 rounded-lg border border-dashed border-border bg-muted/20 p-6"
    >
      {/* Recently Compared */}
      <RecentComparisons onCompare={handleCompare} prefersReducedMotion={prefersReducedMotion} />

      {/* Help Me Decide */}
      <HelpMeDecide onCompare={handleCompare} prefersReducedMotion={prefersReducedMotion} />

      {/* Category Browser */}
      <CategoryBrowser onCompare={handleCompare} prefersReducedMotion={prefersReducedMotion} />

      <p className="text-center text-xs text-muted-foreground">
        Or use the selector above to choose your own technologies
      </p>
    </motion.div>
  )
}

// ─── Utility: Save to recent comparisons (call from ComparePageClient) ────────

export function saveRecentComparison(slugs: string[], name: string) {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const existing: RecentComparison[] = raw ? JSON.parse(raw) : []

    // Remove duplicate if exists
    const filtered = existing.filter((r) => r.slugs.join(',') !== slugs.join(','))

    const updated: RecentComparison[] = [
      { slugs, name, timestamp: Date.now() },
      ...filtered,
    ].slice(0, 5)

    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  } catch {
    // ignore
  }
}
