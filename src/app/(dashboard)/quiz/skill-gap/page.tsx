'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Minus, LogIn, BookOpen } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { computeSkillGap, type SkillGapResult } from '@/lib/quiz/skill-gap'
import { TechIcon } from '@/components/shared/TechIcon'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TechnologyWithScore } from '@/types'

export default function SkillGapPage() {
  const { user, loading: authLoading } = useAuth()
  const [gap, setGap] = useState<SkillGapResult | null>(null)
  const [gapTechs, setGapTechs] = useState<TechnologyWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [hasRoadmap, setHasRoadmap] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const supabase = createSupabaseBrowserClient()

    supabase
      .from('saved_roadmaps')
      .select('answers')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data?.answers) { setLoading(false); return }
        setHasRoadmap(true)

        const answers = data.answers as Record<string, string | string[]>
        const targetRole = answers['target-role'] as string
        const currentSkills = (answers['current-skills'] as string[]) ?? []

        const result = computeSkillGap(targetRole, currentSkills)
        setGap(result)

        if (result && result.gaps.length > 0) {
          const { data: techs } = await supabase
            .from('technologies')
            .select('*')
            .in('slug', result.gaps)
          setGapTechs((techs as TechnologyWithScore[]) ?? [])
        }
        setLoading(false)
      })
  }, [user])

  if (authLoading || loading) return null

  if (!user) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
        <h1 className="mb-2 text-2xl font-bold">Skill Gap Analysis</h1>
        <p className="mb-6 text-muted-foreground">Sign in and complete the roadmap quiz to see your skill gaps.</p>
        <Link href="/login?next=/quiz/skill-gap">
          <Button className="gap-2"><LogIn className="h-4 w-4" />Sign in</Button>
        </Link>
      </main>
    )
  }

  if (!hasRoadmap) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
        <h1 className="mb-2 text-2xl font-bold">Skill Gap Analysis</h1>
        <p className="mb-6 text-muted-foreground">Complete the roadmap quiz first — we'll use your target role and current skills to compute the gap.</p>
        <Link href="/quiz/roadmap">
          <Button>Build My Roadmap</Button>
        </Link>
      </main>
    )
  }

  if (!gap) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Could not compute skill gap for your selected role.</p>
      </main>
    )
  }

  const readinessColor =
    gap.readinessPercent >= 70 ? 'text-emerald-500' :
    gap.readinessPercent >= 40 ? 'text-warning' : 'text-destructive'

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Skill Gap Analysis</h1>
        <p className="mt-1 text-muted-foreground">
          Your current skills vs what <strong>{gap.roleName}</strong> roles require
        </p>
      </div>

      {/* Readiness score */}
      <Card className="mb-8 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Role Readiness</p>
            <div className={cn('text-5xl font-bold', readinessColor)}>
              {gap.readinessPercent}%
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {gap.known.length} of {gap.known.length + gap.gaps.length} required skills covered
            </p>
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 text-sm text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              <span>{gap.known.length} skills you have</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              <span>{gap.gapCount} skills to learn</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2.5 w-full rounded-full bg-secondary/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${gap.readinessPercent}%` }}
          />
        </div>
      </Card>

      {/* Gap techs with live scores */}
      {gap.gapCount > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Skills to Learn ({gap.gapCount})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {gap.gaps.map(slug => {
              const tech = gapTechs.find(t => t.slug === slug)
              const momentum = tech?.momentum ?? 0
              const MIcon = momentum > 3 ? TrendingUp : momentum < -3 ? TrendingDown : Minus
              const mColor = momentum > 3 ? 'text-emerald-500' : momentum < -3 ? 'text-destructive' : 'text-muted-foreground'

              return (
                <Link key={slug} href={`/technologies/${slug}`}>
                  <Card className="flex items-center gap-3 p-4 hover:bg-card/80 transition-colors">
                    {tech && <TechIcon slug={tech.slug} name={tech.name} color={tech.color} size={28} />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{tech?.name ?? slug}</p>
                      {tech && (
                        <p className="text-xs text-muted-foreground">
                          Score {Math.round(tech.composite_score ?? 0)}/100 · Jobs {Math.round(tech.jobs_score ?? 0)}/100
                        </p>
                      )}
                    </div>
                    {tech && (
                      <div className={cn('flex items-center gap-1 text-xs font-medium shrink-0', mColor)}>
                        <MIcon className="h-3.5 w-3.5" />
                        {momentum > 0 ? `+${momentum.toFixed(1)}` : momentum.toFixed(1)}
                      </div>
                    )}
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Known skills */}
      {gap.known.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Skills You Already Have ({gap.known.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {gap.known.map(slug => (
              <Link key={slug} href={`/technologies/${slug}`}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-500/20 transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {slug}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex gap-3">
        <Link href="/quiz/roadmap">
          <Button variant="outline">Update My Roadmap</Button>
        </Link>
        <Link href="/technologies">
          <Button>Explore Technologies</Button>
        </Link>
      </div>
    </main>
  )
}
