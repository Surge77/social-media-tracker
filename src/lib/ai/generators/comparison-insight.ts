/**
 * Comparison insight generator — multi-technology analysis.
 *
 * Replaces template-based comparisons with genuinely analytical,
 * nuanced comparisons that identify contradictions and tradeoffs.
 */

import type { AIProvider, GenerateOptions } from '@/lib/ai/provider'
import type { TechInsightContext } from '@/lib/ai/generators/tech-insight'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getActivePrompt } from '@/lib/ai/prompt-manager'
import { buildPromptWithinBudget, BUDGETS } from '@/lib/ai/token-budget'
import type { PromptSection } from '@/lib/ai/token-budget'

// ---- Types ----

export interface UserContext {
  role: 'beginner' | 'mid-level' | 'senior' | 'tech-lead'
  goal: 'learning' | 'side-project' | 'production' | 'job-hunting' | 'migration'
}

export interface ComparisonInsight {
  headline: string
  verdict: string
  dimensionAnalysis: {
    github: string
    community: string
    jobs: string
    ecosystem: string
  }
  surprisingFinding: string | null
  careerAdvice: {
    forBeginners: string
    forExperienced: string
    forJobSeekers: string
  }
  timeHorizon: {
    shortTerm: string
    longTerm: string
  }
  winner: {
    overall: string | null
    byUseCase: Array<{ useCase: string; recommendation: string }>
  }
  riskAnalysis?: {
    risks: Array<{
      technology: string
      risk: string
      severity: 'low' | 'medium' | 'high'
      mitigation: string
    }>
  }
  learningCurve?: {
    comparisons: Array<{
      technology: string
      difficulty: 'easy' | 'moderate' | 'steep'
      timeToProductivity: string
      prerequisites: string
    }>
  }
  marketOutlook?: {
    predictions: Array<{
      technology: string
      outlook: 'growing' | 'stable' | 'declining'
      confidence: 'low' | 'medium' | 'high'
      reasoning: string
    }>
  }
  migrationAdvice?: {
    paths: Array<{
      from: string
      to: string
      difficulty: 'easy' | 'moderate' | 'hard'
      effort: string
      gotchas: string
    }>
  }
}

// ---- Generator ----

export async function generateComparisonInsight(
  contexts: TechInsightContext[],
  provider: AIProvider,
  supabase: SupabaseClient,
  userContext?: UserContext
): Promise<ComparisonInsight> {
  const prompt = buildComparisonPrompt(contexts, userContext)

  // Load system prompt from database
  const systemPrompt = await getActivePrompt(supabase, 'comparison-system')

  const options: GenerateOptions = {
    systemPrompt: systemPrompt || undefined,
    temperature: 0.3,
    maxTokens: 2048,
  }

  return provider.generateJSON<ComparisonInsight>(
    prompt,
    undefined,
    options
  )
}

// ---- Prompt builder ----

function buildComparisonPrompt(
  contexts: TechInsightContext[],
  userContext?: UserContext
): string {
  const names = contexts.map((c) => c.name).join(' vs ')
  const sharedCategory =
    new Set(contexts.map((c) => c.category)).size === 1
      ? contexts[0].category
      : null

  // Build personalization context
  const roleLabels = {
    beginner: 'a beginner developer',
    'mid-level': 'a mid-level developer',
    senior: 'a senior developer',
    'tech-lead': 'a tech lead',
  }
  const goalLabels = {
    learning: 'learning new skills',
    'side-project': 'building a side project',
    production: 'choosing for production use',
    'job-hunting': 'maximizing job opportunities',
    migration: 'migrating from an existing technology',
  }

  const personalization = userContext
    ? `\n\nPERSONALIZATION CONTEXT:
The user is ${roleLabels[userContext.role]} focused on ${goalLabels[userContext.goal]}.
Tailor the verdict, career advice, and recommendations specifically for this context.
The careerAdvice.forBeginners/forExperienced/forJobSeekers should still be included, but emphasize the advice that matches the user's profile.`
    : ''

  const sections: PromptSection[] = [
    {
      key: 'instruction',
      priority: 1,
      content: `Compare these technologies and generate a ComparisonInsight JSON with ALL fields:${personalization}

REQUIRED FIELDS:
- headline: string
- verdict: string
- dimensionAnalysis: {github: string, community: string, jobs: string, ecosystem: string}
- surprisingFinding: string | null
- careerAdvice: {forBeginners: string, forExperienced: string, forJobSeekers: string}
- timeHorizon: {shortTerm: string, longTerm: string}
- winner: {overall: string | null, byUseCase: Array<{useCase: string, recommendation: string}>}
  IMPORTANT: byUseCase MUST be an array of objects, NOT a string!

OPTIONAL FIELDS (include if relevant):
- riskAnalysis: {risks: Array<{technology: string, risk: string, severity: 'low'|'medium'|'high', mitigation: string}>}
- learningCurve: {comparisons: Array<{technology: string, difficulty: 'easy'|'moderate'|'steep', timeToProductivity: string, prerequisites: string}>}
- marketOutlook: {predictions: Array<{technology: string, outlook: 'growing'|'stable'|'declining', confidence: 'low'|'medium'|'high', reasoning: string}>}
- migrationAdvice: {paths: Array<{from: string, to: string, difficulty: 'easy'|'moderate'|'hard', effort: string, gotchas: string}>}

COMPARISON: ${names}${sharedCategory ? ` (same category: ${sharedCategory})` : ' (cross-category comparison)'}

Return ONLY valid JSON matching this exact schema. No markdown, no code fences.`,
    },
  ]

  // Add a section for each technology
  for (const ctx of contexts) {
    const jobTotal = [
      ctx.signals.jobPostings.adzuna,
      ctx.signals.jobPostings.jsearch,
      ctx.signals.jobPostings.remotive,
    ]
      .filter((v): v is number => v !== null)
      .reduce((a, b) => a + b, 0)

    sections.push({
      key: `tech_${ctx.slug}`,
      priority: 1,
      content: `--- ${ctx.name.toUpperCase()} ---
Score: ${ctx.compositeScore}/100 | Rank: #${ctx.categoryRank} of ${ctx.categoryTotal}
Sub-scores: GitHub ${ctx.subScores.github ?? 'N/A'}, Community ${ctx.subScores.community ?? 'N/A'}, Jobs ${ctx.subScores.jobs ?? 'N/A'}, Ecosystem ${ctx.subScores.ecosystem ?? 'N/A'}
Momentum: 7d ${ctx.momentum.shortTerm > 0 ? '+' : ''}${ctx.momentum.shortTerm.toFixed(2)}, 30d ${ctx.momentum.mediumTerm > 0 ? '+' : ''}${ctx.momentum.mediumTerm.toFixed(2)}, trend: ${ctx.momentum.trend}
Confidence: ${ctx.confidence.grade} (${Math.round(ctx.confidence.overall)}%)
Signals: ${ctx.signals.githubStars?.toLocaleString() ?? 'N/A'} stars, ${ctx.signals.hnMentions ?? 'N/A'} HN mentions, ${jobTotal > 0 ? jobTotal.toLocaleString() : 'N/A'} jobs, ${ctx.signals.downloads.weekly?.toLocaleString() ?? 'N/A'} downloads/week`,
    })
  }

  // Head-to-head comparison section
  if (contexts.length === 2) {
    const [a, b] = contexts
    sections.push({
      key: 'head_to_head',
      priority: 2,
      content: `HEAD-TO-HEAD DELTAS:
- Score: ${a.name} ${a.compositeScore} vs ${b.name} ${b.compositeScore} (${a.compositeScore > b.compositeScore ? a.name : b.name} leads by ${Math.abs(a.compositeScore - b.compositeScore)})
- GitHub: ${a.subScores.github ?? 'N/A'} vs ${b.subScores.github ?? 'N/A'}
- Community: ${a.subScores.community ?? 'N/A'} vs ${b.subScores.community ?? 'N/A'}
- Jobs: ${a.subScores.jobs ?? 'N/A'} vs ${b.subScores.jobs ?? 'N/A'}
- Ecosystem: ${a.subScores.ecosystem ?? 'N/A'} vs ${b.subScores.ecosystem ?? 'N/A'}
- Momentum trend: ${a.name} is ${a.momentum.trend}, ${b.name} is ${b.momentum.trend}`,
    })
  }

  return (
    buildPromptWithinBudget(sections, BUDGETS.comparison) +
    '\n\nGenerate the ComparisonInsight JSON.'
  )
}
