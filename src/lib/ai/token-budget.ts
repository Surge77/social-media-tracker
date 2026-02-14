/**
 * Token budget management for LLM prompts.
 *
 * LLM context windows are finite. A technology with 50 anomalies
 * and 30 peers could blow past limits. Every prompt must be built
 * within a budget, prioritizing the most important context.
 */

// ---- Types ----

export interface PromptSection {
  key: string
  content: string
  priority: 1 | 2 | 3  // 1 = must include, 2 = important, 3 = nice to have
}

interface TokenBudgetConfig {
  targetTokens: number
  maxTokens: number
}

// ---- Constants ----

/**
 * Approximate token counts (1 token ≈ 4 chars for English text).
 * This is a rough estimate — actual tokenization varies by model.
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Default budget: 4K tokens for context.
 * This keeps costs low while providing enough detail for quality insights.
 * Max budget: 8K tokens for when we need more detail (comparisons, digest).
 */
const DEFAULT_BUDGET: TokenBudgetConfig = {
  targetTokens: 4000,
  maxTokens: 8000,
}

const COMPARISON_BUDGET: TokenBudgetConfig = {
  targetTokens: 6000,
  maxTokens: 10000,
}

const DIGEST_BUDGET: TokenBudgetConfig = {
  targetTokens: 8000,
  maxTokens: 15000,
}

// ---- Main builder ----

/**
 * Build a prompt within a token budget by prioritizing sections.
 *
 * Strategy:
 * 1. Always include priority-1 sections (core identity, scores, momentum)
 * 2. Add priority-2 sections until budget is reached (peers, anomalies)
 * 3. Add priority-3 sections only if budget allows (extended history, signals)
 * 4. Truncate priority-2 sections if they overflow
 * 5. Silently drop priority-3 sections that don't fit
 */
export function buildPromptWithinBudget(
  sections: PromptSection[],
  config: TokenBudgetConfig = DEFAULT_BUDGET
): string {
  // Sort by priority (1 first), then by content length (shorter first within same priority)
  const sorted = [...sections].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return a.content.length - b.content.length
  })

  let usedTokens = 0
  const included: string[] = []

  for (const section of sorted) {
    const sectionTokens = estimateTokens(section.content)

    if (section.priority === 1) {
      // Must-include: add regardless of budget
      included.push(section.content)
      usedTokens += sectionTokens
    } else if (usedTokens + sectionTokens <= config.targetTokens) {
      // Fits within target budget: include
      included.push(section.content)
      usedTokens += sectionTokens
    } else if (section.priority === 2 && usedTokens < config.maxTokens) {
      // Important but doesn't fully fit: truncate to fill remaining
      const remainingChars = (config.maxTokens - usedTokens) * 4
      if (remainingChars > 100) {
        included.push(
          section.content.slice(0, remainingChars) + '\n[...truncated for length]'
        )
        usedTokens = config.maxTokens
      }
    }
    // Priority 3 that doesn't fit: silently dropped
  }

  return included.join('\n\n')
}

// ---- Pre-built budget configs ----

export const BUDGETS = {
  techInsight: DEFAULT_BUDGET,
  comparison: COMPARISON_BUDGET,
  digest: DIGEST_BUDGET,
} as const

// ---- Truncation helpers for specific data types ----

/**
 * Keep the most relevant peers: top 5 by score + top 5 by momentum.
 */
export function truncatePeers(
  peers: Array<{ name: string; score: number; momentum: number }>,
  maxPeers: number = 10
): typeof peers {
  if (peers.length <= maxPeers) return peers

  const byScore = [...peers].sort((a, b) => b.score - a.score).slice(0, 5)
  const byMomentum = [...peers]
    .sort((a, b) => Math.abs(b.momentum) - Math.abs(a.momentum))
    .slice(0, 5)

  // Deduplicate
  const unique = new Map<string, (typeof peers)[0]>()
  for (const p of [...byScore, ...byMomentum]) unique.set(p.name, p)
  return Array.from(unique.values()).slice(0, maxPeers)
}

/**
 * Keep the most important anomalies: highest severity first, then most recent.
 */
export function truncateAnomalies<T extends { severity: string; detectedAt: string }>(
  anomalies: T[],
  maxAnomalies: number = 5
): T[] {
  if (anomalies.length <= maxAnomalies) return anomalies

  const severityOrder: Record<string, number> = {
    critical: 0,
    significant: 1,
    notable: 2,
    info: 3,
  }

  return [...anomalies]
    .sort((a, b) => {
      const aSev = severityOrder[a.severity] ?? 4
      const bSev = severityOrder[b.severity] ?? 4
      if (aSev !== bSev) return aSev - bSev
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    })
    .slice(0, maxAnomalies)
}

/**
 * Keep the top headlines by score/points.
 */
export function truncateHeadlines<T extends { points: number }>(
  headlines: T[],
  maxHeadlines: number = 3
): T[] {
  if (headlines.length <= maxHeadlines) return headlines
  return [...headlines].sort((a, b) => b.points - a.points).slice(0, maxHeadlines)
}

/**
 * Truncate a score history to the most recent N entries.
 */
export function truncateHistory<T>(history: T[], maxEntries: number = 30): T[] {
  if (history.length <= maxEntries) return history
  return history.slice(-maxEntries)
}
