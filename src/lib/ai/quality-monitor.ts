/**
 * AI output quality monitoring.
 *
 * Every generated insight is validated BEFORE caching.
 * If quality < 60, the insight is rejected and regenerated.
 */

// ---- Types ----

export interface QualityChecks {
  citesData: boolean
  mentionsPeers: boolean
  matchesConfidence: boolean
  noHallucination: boolean
  hasActionableAdvice: boolean
  hasProsCons: boolean
  prosConsNonGeneric: boolean
  practicalBlocksPresent: boolean
  appropriateLength: boolean
}

export interface QualityResult {
  checks: QualityChecks
  score: number // 0-100
  passed: boolean // true if score >= 60
}

// ---- Main checker ----

/**
 * Run quality checks on a tech insight.
 *
 * @param insight - The generated insight JSON (as string or object)
 * @param inputContext - The original prompt context (for hallucination check)
 * @param confidenceGrade - The tech's confidence grade (A-F)
 */
export function checkInsightQuality(
  insight: Record<string, unknown>,
  inputContext: string,
  confidenceGrade: string
): QualityResult {
  const text = JSON.stringify(insight)
  // 1. Cites data: does it reference specific numbers?
  const numberPattern = /\d+[,.]?\d*/g
  const numbersFound = text.match(numberPattern)?.length ?? 0
  const citesData = numbersFound >= 4

  // 2. Mentions peers: does it compare against category peers?
  const peerPatterns = [
    /compared to/i,
    /vs\.?\s/i,
    /more than/i,
    /less than/i,
    /higher than/i,
    /lower than/i,
    /\#\d+\s+(in|of)/i,
    /rank/i,
    /ahead of/i,
    /behind/i,
  ]
  const mentionsPeers = peerPatterns.some((p) => p.test(text))

  // 3. Matches confidence: if low confidence, does it acknowledge uncertainty?
  let matchesConfidence = true
  if (confidenceGrade === 'D' || confidenceGrade === 'F') {
    const uncertaintyPatterns = [
      /limited data/i,
      /sparse/i,
      /preliminary/i,
      /uncertain/i,
      /may change/i,
      /few sources/i,
      /short history/i,
    ]
    matchesConfidence = uncertaintyPatterns.some((p) => p.test(text))
  }

  // 4. No hallucination: check that numbers in the output appear in the input
  const outputNumbers =
    text.match(/\b\d{2,}\b/g)?.map((n) => n.replace(/,/g, '')) ?? []
  const inputNumbers = new Set(
    inputContext.match(/\b\d+\b/g)?.map((n) => n.replace(/,/g, '')) ?? []
  )
  // Allow small numbers (< 100) since those could be valid derivations
  const suspectNumbers = outputNumbers.filter(
    (n) => parseInt(n) >= 100 && !inputNumbers.has(n)
  )
  const noHallucination = suspectNumbers.length <= 2 // allow minor formatting differences

  // 5. Has actionable advice: ends with a recommendation?
  const advicePatterns = [
    /recommend/i,
    /should\s+(learn|consider|watch|skip|avoid|invest|wait)/i,
    /worth\s+(learning|considering|watching)/i,
    /priority/i,
    /action/i,
    /suggest/i,
  ]
  const hasActionableAdvice = advicePatterns.some((p) => p.test(text))

  const pros = Array.isArray(insight.pros)
    ? insight.pros.filter((v): v is string => typeof v === 'string')
    : []
  const cons = Array.isArray(insight.cons)
    ? insight.cons.filter((v): v is string => typeof v === 'string')
    : []
  const hasProsCons = pros.length >= 3 && cons.length >= 3

  const genericPhrases = [
    /good performance/i,
    /easy to use/i,
    /popular/i,
    /depends on project/i,
    /not always best/i,
    /it may change/i,
    /general web apps/i,
  ]
  const prosConsText = `${pros.join(' ')} ${cons.join(' ')}`.trim()
  const genericHits = genericPhrases.filter((p) => p.test(prosConsText)).length
  const prosConsNonGeneric =
    hasProsCons &&
    genericHits <= 1 &&
    (prosConsText.match(/\d+[,.]?\d*/g)?.length ?? 0) >= 2

  const practical =
    insight.practicalAnalysis && typeof insight.practicalAnalysis === 'object'
      ? (insight.practicalAnalysis as Record<string, unknown>)
      : null
  const effort = practical?.effortEstimate
  const practicalBlocksPresent =
    !!practical &&
    typeof practical.bestFitUseCases === 'string' &&
    practical.bestFitUseCases.trim().length >= 8 &&
    typeof practical.avoidIf === 'string' &&
    practical.avoidIf.trim().length >= 8 &&
    typeof practical.adoptionRisks === 'string' &&
    practical.adoptionRisks.trim().length >= 8 &&
    typeof practical.outlook90d === 'string' &&
    practical.outlook90d.trim().length >= 8 &&
    (effort === 'low' || effort === 'medium' || effort === 'high')

  // 6. Appropriate length: not too short, not too long
  const appropriateLength = text.length >= 250 && text.length <= 7000

  // Score calculation (weighted)
  const checks: QualityChecks = {
    citesData,
    mentionsPeers,
    matchesConfidence,
    noHallucination,
    hasActionableAdvice,
    hasProsCons,
    prosConsNonGeneric,
    practicalBlocksPresent,
    appropriateLength,
  }

  const weights = {
    citesData: 18,
    mentionsPeers: 12,
    matchesConfidence: 10,
    noHallucination: 15,
    hasActionableAdvice: 12,
    hasProsCons: 12,
    prosConsNonGeneric: 11,
    practicalBlocksPresent: 10,
    appropriateLength: 10,
  }

  const score = (Object.keys(checks) as (keyof QualityChecks)[]).reduce(
    (sum, key) => sum + (checks[key] ? weights[key] : 0),
    0
  )

  const hardFail = !hasProsCons || !practicalBlocksPresent || !prosConsNonGeneric
  return { checks, score, passed: !hardFail && score >= 60 }
}
