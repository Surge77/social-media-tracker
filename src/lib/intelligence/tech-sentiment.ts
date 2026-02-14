/**
 * Tech-domain sentiment enhancement.
 *
 * Layers on top of wink-sentiment with tech-specific boosters/dampeners.
 * "React is dead" registers as mildly negative in general English,
 * but in tech communities it's a strong bearish signal.
 * "Production-ready" barely registers in general English,
 * but in tech it's a strong positive.
 */

import { analyzeSentiment } from '@/lib/scoring/sentiment'

// ---- Tech-specific sentiment modifiers ----

/**
 * Phrases that boost sentiment in tech context.
 * Values are added to the 0-1 base score.
 */
const TECH_BOOSTERS: Array<{ pattern: RegExp; boost: number }> = [
  { pattern: /production[\s-]ready/i,      boost: 0.15 },
  { pattern: /blazing[\s-]fast/i,          boost: 0.12 },
  { pattern: /game[\s-]changer/i,          boost: 0.15 },
  { pattern: /stable[\s-]release/i,        boost: 0.10 },
  { pattern: /developer[\s-]experience/i,  boost: 0.08 },
  { pattern: /type[\s-]safe/i,             boost: 0.08 },
  { pattern: /battle[\s-]tested/i,         boost: 0.12 },
  { pattern: /first[\s-]class\s+support/i, boost: 0.10 },
  { pattern: /zero[\s-]config/i,           boost: 0.08 },
  { pattern: /drop[\s-]in\s+replacement/i, boost: 0.06 },
  { pattern: /v\d+\.\d+\s+released/i,     boost: 0.10 },
  { pattern: /major\s+release/i,           boost: 0.10 },
  { pattern: /\bLTS\b/,                    boost: 0.08 },
  { pattern: /performance\s+improvement/i, boost: 0.08 },
  { pattern: /backed\s+by/i,              boost: 0.06 },
  { pattern: /officially\s+supported/i,    boost: 0.10 },
]

/**
 * Phrases that dampen sentiment in tech context.
 * Values are subtracted from the 0-1 base score.
 */
const TECH_DAMPENERS: Array<{ pattern: RegExp; dampen: number }> = [
  { pattern: /\bdeprecated\b/i,              dampen: 0.20 },
  { pattern: /\blegacy\b/i,                  dampen: 0.10 },
  { pattern: /\bbloated\b/i,                 dampen: 0.15 },
  { pattern: /breaking[\s-]change/i,         dampen: 0.08 },
  { pattern: /\babandoned\b/i,               dampen: 0.20 },
  { pattern: /\bunmaintained\b/i,            dampen: 0.18 },
  { pattern: /is\s+dead/i,                   dampen: 0.15 },
  { pattern: /vendor[\s-]lock/i,             dampen: 0.12 },
  { pattern: /technical[\s-]debt/i,          dampen: 0.10 },
  { pattern: /memory[\s-]leak/i,             dampen: 0.12 },
  { pattern: /security[\s-]vulnerabilit/i,   dampen: 0.18 },
  { pattern: /\bCVE[\s-]\d+/i,              dampen: 0.15 },
  { pattern: /end[\s-]of[\s-]life/i,         dampen: 0.18 },
  { pattern: /no\s+longer\s+maintained/i,    dampen: 0.20 },
  { pattern: /critical\s+bug/i,              dampen: 0.12 },
  { pattern: /supply[\s-]chain\s+attack/i,   dampen: 0.20 },
]

/**
 * Sarcasm/irony markers common in developer communities.
 * When detected, we reduce confidence in the sentiment score.
 */
const SARCASM_PATTERNS: RegExp[] = [
  /yet[\s-]another/i,
  /javascript[\s-]fatigue/i,
  /\bjust\s+use\b/i,
  /how\s+hard\s+can\s+it\s+be/i,
  /what\s+could\s+(possibly\s+)?go\s+wrong/i,
  /laughs?\s+in\s+production/i,
  /surprised\s+pikachu/i,
  /\bin\s+this\s+economy\b/i,
  /\b(obligatory|mandatory)\b/i,
  /\brewrite\s+it\s+in\s+rust\b/i,
]

// ---- Public API ----

export interface TechSentimentResult {
  score: number       // 0-1, tech-adjusted sentiment
  confidence: number  // 0-1, how confident we are in the score
  sarcasmDetected: boolean
  boostersFound: string[]
  dampenersFound: string[]
}

/**
 * Analyze sentiment of a text with tech-domain awareness.
 *
 * 1. Base score from wink-sentiment (general English)
 * 2. Apply tech-specific boosters and dampeners
 * 3. Detect sarcasm to reduce confidence
 * 4. Clamp to [0, 1]
 */
export function analyzeTechSentiment(text: string): TechSentimentResult {
  if (!text || text.trim().length === 0) {
    return { score: 0.5, confidence: 0, sarcasmDetected: false, boostersFound: [], dampenersFound: [] }
  }

  // Base sentiment from wink-sentiment (0-1 scale)
  let score = analyzeSentiment(text)
  const boostersFound: string[] = []
  const dampenersFound: string[] = []

  // Apply tech boosters
  for (const { pattern, boost } of TECH_BOOSTERS) {
    if (pattern.test(text)) {
      score += boost
      boostersFound.push(pattern.source)
    }
  }

  // Apply tech dampeners
  for (const { pattern, dampen } of TECH_DAMPENERS) {
    if (pattern.test(text)) {
      score -= dampen
      dampenersFound.push(pattern.source)
    }
  }

  // Clamp to [0, 1]
  score = Math.max(0, Math.min(1, score))

  // Sarcasm detection
  const sarcasmDetected = SARCASM_PATTERNS.some((p) => p.test(text))

  // Confidence: reduce by 50% if sarcasm detected
  let confidence = 0.8
  if (sarcasmDetected) confidence *= 0.5
  // Short texts are less reliable
  if (text.length < 20) confidence *= 0.6
  // More modifiers found = more confident in the adjustment
  if (boostersFound.length + dampenersFound.length > 0) confidence = Math.min(1, confidence + 0.1)

  return {
    score: Math.round(score * 1000) / 1000,
    confidence: Math.round(confidence * 100) / 100,
    sarcasmDetected,
    boostersFound,
    dampenersFound,
  }
}

/**
 * Analyze sentiment across multiple texts with tech-domain awareness.
 * Returns an aggregated score, weighted by confidence.
 */
export function averageTechSentiment(texts: string[]): {
  score: number
  confidence: number
  sarcasmRate: number
} {
  if (texts.length === 0) return { score: 0.5, confidence: 0, sarcasmRate: 0 }

  const results = texts
    .filter((t) => typeof t === 'string' && t.trim().length > 0)
    .map((t) => analyzeTechSentiment(t))

  if (results.length === 0) return { score: 0.5, confidence: 0, sarcasmRate: 0 }

  // Confidence-weighted average
  const totalWeight = results.reduce((sum, r) => sum + r.confidence, 0)
  const weightedScore =
    totalWeight > 0
      ? results.reduce((sum, r) => sum + r.score * r.confidence, 0) / totalWeight
      : 0.5

  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length
  const sarcasmRate = results.filter((r) => r.sarcasmDetected).length / results.length

  return {
    score: Math.round(weightedScore * 1000) / 1000,
    confidence: Math.round(avgConfidence * 100) / 100,
    sarcasmRate: Math.round(sarcasmRate * 100) / 100,
  }
}
