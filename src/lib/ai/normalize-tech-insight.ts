import type { TechInsight, TechInsightContext } from '@/lib/ai/generators/tech-insight'

type LegacyTechInsight = Partial<TechInsight> & {
  summary?: string
  outlook?: string
  strengths?: string[]
  weaknesses?: string[]
  recommendation?: string
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []
}

function joinSentences(items: string[]): string | null {
  if (items.length === 0) return null
  return items.join('. ')
}

function formatDelta(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}`
}

function getDimensionEntries(context: TechInsightContext) {
  return [
    { label: 'GitHub activity', value: context.subScores.github },
    { label: 'community buzz', value: context.subScores.community },
    { label: 'job market demand', value: context.subScores.jobs },
    { label: 'ecosystem health', value: context.subScores.ecosystem },
  ].filter((entry): entry is { label: string; value: number } => typeof entry.value === 'number')
}

function buildContextNarrative(context: TechInsightContext) {
  const dims = getDimensionEntries(context)
  const strongest = [...dims].sort((a, b) => b.value - a.value)[0] ?? null
  const weakest = [...dims].sort((a, b) => a.value - b.value)[0] ?? null

  const trendNarrative = `${context.name} ranks #${context.categoryRank} of ${context.categoryTotal} in ${context.category}. ` +
    `Momentum is ${context.momentum.trend}, with 7d ${formatDelta(context.momentum.shortTerm)}, ` +
    `30d ${formatDelta(context.momentum.mediumTerm)}, and 90d ${formatDelta(context.momentum.longTerm)} movement.`

  const careerAdvice =
    typeof context.subScores.jobs === 'number' && context.subScores.jobs >= 70
      ? `Worth learning if you want ${context.category} opportunities: hiring demand is ${context.subScores.jobs}/100 and the overall score is ${context.compositeScore}/100.`
      : context.compositeScore >= 60
        ? `${context.name} looks viable, but it is stronger as a deliberate bet than a default choice. Use it when the ecosystem fit matches your goals.`
        : `${context.name} is better treated as situational than core right now. Pair it with stronger adjacent skills before making it a primary focus.`

  const riskFactors =
    weakest
      ? `The main risk is ${weakest.label}, currently ${weakest.value}/100.${context.confidence.overall < 65 ? ` Confidence is only ${context.confidence.grade}, so this could move as more data arrives.` : ''}`
      : `Signal coverage is still limited, so the score may move as more data arrives.`

  const scoreExplanation =
    strongest && weakest
      ? `${context.name} scores ${context.compositeScore}/100, led by ${strongest.label} at ${strongest.value}/100 while ${weakest.label} lags at ${weakest.value}/100.`
      : `${context.name} scores ${context.compositeScore}/100 based on the currently available adoption, community, and hiring signals.`

  const momentumContext =
    `7d ${formatDelta(context.momentum.shortTerm)}, 30d ${formatDelta(context.momentum.mediumTerm)}, ` +
    `90d ${formatDelta(context.momentum.longTerm)}; trajectory is ${context.momentum.trend}.`

  const pros: string[] = []
  const cons: string[] = []

  if (strongest) pros.push(`Strongest dimension is ${strongest.label} at ${strongest.value}/100.`)
  if (typeof context.subScores.jobs === 'number' && context.subScores.jobs >= 70) {
    pros.push(`Hiring demand is solid at ${context.subScores.jobs}/100.`)
  }
  if (context.momentum.mediumTerm > 0) {
    pros.push(`30-day momentum is positive at ${formatDelta(context.momentum.mediumTerm)}.`)
  }

  if (weakest) cons.push(`Weakest dimension is ${weakest.label} at ${weakest.value}/100.`)
  if (context.confidence.overall < 65) {
    cons.push(`Confidence is ${context.confidence.grade}, so the picture is less stable than top-tier data.`)
  }
  if (context.momentum.volatility > 20) {
    cons.push(`Volatility is elevated at ${context.momentum.volatility.toFixed(1)}, which raises short-term noise risk.`)
  }

  const practicalAnalysis = {
    bestFitUseCases:
      typeof context.subScores.jobs === 'number' && context.subScores.jobs >= 70
        ? `${context.name} is best suited for teams that value current market demand and established adoption signals.`
        : `${context.name} is best suited for targeted use cases where its specific ecosystem advantages matter more than broad demand.`,
    avoidIf:
      weakest
        ? `Avoid making it a default stack choice if ${weakest.label} is critical for your decision.`
        : `Avoid committing heavily until stronger data coverage arrives.`,
    adoptionRisks: riskFactors,
    effortEstimate:
      context.compositeScore >= 70 ? 'low' : context.compositeScore >= 50 ? 'medium' : 'high',
    outlook90d:
      context.momentum.mediumTerm >= 0
        ? `Near-term outlook is constructive if current momentum holds. Watch whether ${context.name} can sustain its recent score trend.`
        : `Near-term outlook is cautious until the recent momentum slowdown stabilizes.`,
  } as const

  return {
    trendNarrative,
    careerAdvice,
    riskFactors,
    scoreExplanation,
    momentumContext,
    pros,
    cons,
    practicalAnalysis,
  }
}

export function hasStructuredTechInsight(input: unknown): boolean {
  if (!input || typeof input !== 'object') return false
  const insight = input as Record<string, unknown>

  return (
    nonEmptyString(insight.trendNarrative) !== null &&
    nonEmptyString(insight.careerAdvice) !== null &&
    nonEmptyString(insight.riskFactors) !== null &&
    nonEmptyString(insight.scoreExplanation) !== null
  )
}

export function normalizeTechInsight(
  input: unknown,
  techName?: string,
  context?: TechInsightContext
): TechInsight {
  const insight = (input && typeof input === 'object' ? input : {}) as LegacyTechInsight
  const contextFallback = context ? buildContextNarrative(context) : null

  const summary = nonEmptyString(insight.summary)
  const outlook = nonEmptyString(insight.outlook)
  const recommendation = nonEmptyString(insight.recommendation)
  const strengths = stringList(insight.strengths)
  const weaknesses = stringList(insight.weaknesses)
  const pros = stringList(insight.pros)
  const cons = stringList(insight.cons)

  const normalizedPros = pros.length > 0 ? pros : strengths.length > 0 ? strengths : contextFallback?.pros ?? []
  const normalizedCons = cons.length > 0 ? cons : weaknesses.length > 0 ? weaknesses : contextFallback?.cons ?? []

  return {
    headline:
      nonEmptyString(insight.headline) ??
      recommendation ??
      `${techName ?? 'Technology'} AI analysis`,
    learningPriority:
      insight.learningPriority === 'critical' ||
      insight.learningPriority === 'high' ||
      insight.learningPriority === 'medium' ||
      insight.learningPriority === 'low' ||
      insight.learningPriority === 'skip'
        ? insight.learningPriority
        : 'medium',
    trendNarrative:
      nonEmptyString(insight.trendNarrative) ??
      summary ??
      outlook ??
      contextFallback?.trendNarrative ??
      `${techName ?? 'This technology'} has limited structured AI commentary right now, but the latest signals are still being analyzed.`,
    careerAdvice:
      nonEmptyString(insight.careerAdvice) ??
      recommendation ??
      outlook ??
      summary ??
      contextFallback?.careerAdvice ??
      `Use the current score and momentum as directional guidance while a fuller career analysis is generated for ${techName ?? 'this technology'}.`,
    riskFactors:
      nonEmptyString(insight.riskFactors) ??
      joinSentences(normalizedCons) ??
      contextFallback?.riskFactors ??
      'No major AI risk notes are available yet. Check data confidence and recent momentum before making a decision.',
    scoreExplanation:
      nonEmptyString(insight.scoreExplanation) ??
      summary ??
      contextFallback?.scoreExplanation ??
      `${techName ?? 'This technology'} score reflects the currently available signals across adoption, community, and job-market demand.`,
    momentumContext:
      nonEmptyString(insight.momentumContext) ??
      outlook ??
      contextFallback?.momentumContext ??
      'Fresh AI momentum commentary is being generated from the latest data.',
    lifecycleStage: nonEmptyString(insight.lifecycleStage) ?? 'emerging',
    confidenceNote:
      nonEmptyString(insight.confidenceNote) ??
      'This analysis is derived from the latest platform signals and may be refreshed as new data arrives.',
    pros: normalizedPros,
    cons: normalizedCons,
    practicalAnalysis:
      insight.practicalAnalysis && typeof insight.practicalAnalysis === 'object'
        ? insight.practicalAnalysis
        : contextFallback?.practicalAnalysis,
    lastUpdated: nonEmptyString(insight.lastUpdated) ?? new Date().toISOString(),
  }
}
