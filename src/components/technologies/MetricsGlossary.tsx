'use client'

import React from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface Term {
  term: string
  definition: string
  badge?: { label: string; className: string }
}

interface Section {
  title: string
  terms: Term[]
}

// ---- List page sections ----

const LIST_SECTIONS: Section[] = [
  {
    title: 'Verdict Badges',
    terms: [
      {
        term: 'Learn It',
        definition: 'Strong job demand + rising momentum + above-median score. The clearest signal to invest time now — low risk, high reward.',
        badge: { label: 'Learn It', className: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25' },
      },
      {
        term: 'Watch It',
        definition: 'Momentum is accelerating or demand is building. Early movers will benefit — worth starting soon before competition increases.',
        badge: { label: 'Watch It', className: 'text-amber-500 bg-amber-500/10 border-amber-500/25' },
      },
      {
        term: 'Maintain',
        definition: 'Solid demand but not accelerating. If it\'s already in your stack, keep it. New learners should compare alternatives first.',
        badge: { label: 'Maintain', className: 'text-sky-400 bg-sky-500/10 border-sky-500/25' },
      },
      {
        term: 'Caution',
        definition: 'Job and momentum signals are inconsistent — one is strong, one is weak. Evaluate your specific context before committing significant time.',
        badge: { label: 'Caution', className: 'text-orange-500 bg-orange-500/10 border-orange-500/25' },
      },
      {
        term: 'Declining',
        definition: 'Multiple signals — momentum, demand, or community — are falling. Your time is likely better spent on higher-momentum alternatives.',
        badge: { label: 'Declining', className: 'text-red-400 bg-red-500/10 border-red-500/25' },
      },
    ],
  },
  {
    title: 'Sub-score Bars  (GH · CO · JB · EC)',
    terms: [
      {
        term: 'GH — GitHub',
        definition: 'Open-source health: star velocity, fork momentum, issue close rate, and active contributors. High = lots of developer attention and active maintenance.',
        badge: { label: 'GH', className: 'text-violet-400 bg-violet-500/10 border-violet-500/25' },
      },
      {
        term: 'CO — Community',
        definition: 'Developer buzz across Hacker News, Reddit, Dev.to, tech blogs, and YouTube. High = developers are actively talking about and teaching it.',
        badge: { label: 'CO', className: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25' },
      },
      {
        term: 'JB — Jobs',
        definition: 'Employer demand across Adzuna, JSearch, and Remotive job listings. High = companies are actively hiring for this skill right now.',
        badge: { label: 'JB', className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
      },
      {
        term: 'EC — Ecosystem',
        definition: 'Adoption depth: package downloads, Stack Overflow question volume, and dependent package count. High = the ecosystem is mature and well-supported.',
        badge: { label: 'EC', className: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
      },
    ],
  },
  {
    title: 'Other Indicators',
    terms: [
      {
        term: 'Score (0–100)',
        definition: 'Composite signal combining GitHub, Community, Jobs, and Ecosystem — weighted by category. A language weights jobs heavily; an AI/ML framework weights community more.',
      },
      {
        term: 'Momentum',
        definition: 'Direction of change over the past 30–90 days, computed from a 3-window exponential moving average. Rising = score trending up; Declining = trending down; Stable = holding steady.',
      },
      {
        term: 'Job demand bar',
        definition: 'The raw jobs sub-score (0–100) visualized as a fill bar. Directly represents how many job postings mention this technology relative to all tracked techs.',
      },
    ],
  },
]

// ---- Detail page sections ----

const DETAIL_SECTIONS: Section[] = [
  {
    title: 'Career & Stack Verdicts',
    terms: [
      {
        term: 'Learn Now',
        definition: 'Strong composite score, positive momentum, and solid job demand. Investing time here has a high expected return.',
        badge: { label: 'Career', className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
      },
      {
        term: 'Watch',
        definition: 'Promising signals but not yet a clear win — data may be limited, momentum is early, or job demand is uncertain. Revisit in 30–60 days.',
        badge: { label: 'Career', className: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
      },
      {
        term: 'Low Priority',
        definition: 'Low composite score, limited job demand, or declining momentum. May still be valid for specific niche use cases.',
        badge: { label: 'Career', className: 'text-slate-400 bg-slate-500/10 border-slate-500/25' },
      },
      {
        term: 'Adopt',
        definition: 'Mature ecosystem, active GitHub, and solid overall score. Safe to use in production without major risk.',
        badge: { label: 'Stack', className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
      },
      {
        term: 'Pilot',
        definition: 'Worth evaluating in a low-risk context (internal tool, side project, proof of concept) before committing to production.',
        badge: { label: 'Stack', className: 'text-primary bg-primary/10 border-primary/25' },
      },
      {
        term: 'Wait',
        definition: 'Thin ecosystem, low GitHub activity, or too early for a production bet. Monitor for 3–6 months before adopting.',
        badge: { label: 'Stack', className: 'text-slate-400 bg-slate-500/10 border-slate-500/25' },
      },
    ],
  },
  {
    title: 'Confidence Grades (A – F)',
    terms: [
      {
        term: 'A / B',
        definition: 'High signal coverage. Scores are computed from 10+ data sources with strong agreement across GitHub, jobs, community, and ecosystem. Trust the numbers.',
        badge: { label: 'A–B', className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
      },
      {
        term: 'C',
        definition: 'Moderate coverage. Some sources are missing or signals partially disagree. Directionally reliable but treat exact numbers with caution.',
        badge: { label: 'C', className: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
      },
      {
        term: 'D / F',
        definition: 'Low coverage. Fewer than 4 data sources contributed, or signals strongly contradict each other. Use only as a weak directional indicator.',
        badge: { label: 'D–F', className: 'text-red-400 bg-red-500/10 border-red-500/25' },
      },
    ],
  },
  {
    title: 'Score Dimensions',
    terms: [
      {
        term: 'GitHub score',
        definition: 'Star velocity (30-day gain), fork momentum, issue close rate, and active contributor count. High = lots of developer attention and active maintenance.',
      },
      {
        term: 'Community score',
        definition: 'Developer buzz across Hacker News, Reddit, Dev.to, RSS blogs, and YouTube tutorials. High = developers are actively talking about and teaching this technology.',
      },
      {
        term: 'Jobs score',
        definition: 'Employer demand across Adzuna, JSearch, and Remotive listings. High = companies are actively hiring for this skill right now.',
      },
      {
        term: 'Ecosystem score',
        definition: 'Package downloads, Stack Overflow question volume (30-day and all-time), and dependent package count. High = mature, well-supported ecosystem.',
      },
      {
        term: 'Momentum',
        definition: 'Signed score from a 3-window exponential moving average. Above +5 = clear upward trend; below −5 = clear decline; near 0 = holding steady.',
      },
    ],
  },
  {
    title: 'Pair Scores & Risk Flags',
    terms: [
      {
        term: 'Pair score (0–100)',
        definition: 'How well two technologies complement each other: demand synergy (30%), momentum alignment (25%), ecosystem fit (20%), community validation (15%), maturity balance (10%).',
      },
      {
        term: 'Divergent trends',
        definition: 'One technology is gaining momentum while the other is losing it. The pairing may become unbalanced over time.',
      },
      {
        term: 'Hype vs. jobs gap',
        definition: 'High community discussion but few actual job postings. Popular in discourse, but employers are not yet hiring for it at scale.',
      },
      {
        term: 'Both declining',
        definition: 'Both technologies show strong negative momentum. Pairing two falling technologies compounds adoption risk.',
      },
      {
        term: 'Thin ecosystem',
        definition: 'One or both technologies have low ecosystem scores — limited packages, Stack Overflow answers, or community resources.',
      },
      {
        term: 'Limited data',
        definition: 'One or both technologies have low data completeness (< 30% of sources). The pair score is based on sparse signals.',
      },
    ],
  },
]

interface MetricsGlossaryProps {
  variant?: 'list' | 'detail'
}

export function MetricsGlossary({ variant = 'detail' }: MetricsGlossaryProps) {
  const [open, setOpen] = React.useState(false)
  const sections = variant === 'list' ? LIST_SECTIONS : DETAIL_SECTIONS

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <HelpCircle className="h-3.5 w-3.5" />
          What do these metrics mean?
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <div className="rounded-xl border border-border bg-muted/10 p-5 space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {section.terms.map((t) => (
                  <div
                    key={t.term}
                    className="rounded-lg border border-border/50 bg-card/30 px-3 py-2.5"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{t.term}</span>
                      {t.badge && (
                        <span
                          className={cn(
                            'inline-flex items-center rounded border px-1.5 py-0 text-[10px] font-semibold',
                            t.badge.className
                          )}
                        >
                          {t.badge.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {t.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-3">
            Scores update daily from 15 data sources.{' '}
            <a href="/methodology" className="text-primary hover:underline underline-offset-2">
              Read the full methodology →
            </a>
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
