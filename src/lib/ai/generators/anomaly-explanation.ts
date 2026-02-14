/**
 * Anomaly Explanation Generator
 *
 * Generates human-readable explanations for detected anomalies using AI.
 */

import type { AIProvider } from '@/lib/ai/provider'
import type { AnomalyType, AnomalySeverity } from '@/lib/detection/anomaly'

export interface AnomalyContext {
  technologyName: string
  anomalyType: AnomalyType
  severity: AnomalySeverity
  metric: string
  expectedValue: number
  actualValue: number
  deviationSigma: number
  recentNews: string[] // HN top stories, Reddit posts from last 48h
  recentCommits: number | null
  recentReleases: string[] // from GitHub if available
}

export interface AnomalyExplanation {
  explanation: string // "GitHub stars spiked 340% (8.2σ above average). Likely related to SvelteKit 3.0 announcement..."
  confidence: 'high' | 'medium' | 'low'
  relatedEvents: string[] // ["SvelteKit 3.0 release", "ViteConf 2026"]
}

/**
 * Generate AI explanation for an anomaly
 */
export async function generateAnomalyExplanation(
  context: AnomalyContext,
  provider: AIProvider
): Promise<AnomalyExplanation> {
  const prompt = buildAnomalyPrompt(context)

  const response = await provider.generateText(prompt, {
    maxTokens: 250,
    temperature: 0.3,
    systemPrompt: ANOMALY_SYSTEM_PROMPT
  })

  // Parse the structured response
  try {
    const parsed = JSON.parse(response)
    return {
      explanation: parsed.explanation || response.substring(0, 500),
      confidence: parsed.confidence || 'medium',
      relatedEvents: parsed.relatedEvents || []
    }
  } catch {
    // If not JSON, return raw text as explanation
    return {
      explanation: response.substring(0, 500),
      confidence: 'low',
      relatedEvents: []
    }
  }
}

/**
 * Build the anomaly explanation prompt
 */
function buildAnomalyPrompt(context: AnomalyContext): string {
  const {
    technologyName,
    anomalyType,
    severity,
    metric,
    expectedValue,
    actualValue,
    deviationSigma,
    recentNews,
    recentCommits,
    recentReleases
  } = context

  const percentChange = expectedValue > 0
    ? ((actualValue - expectedValue) / expectedValue * 100).toFixed(1)
    : 'N/A'

  let prompt = `Analyze this anomaly for ${technologyName}:\n\n`
  prompt += `Anomaly Type: ${anomalyType}\n`
  prompt += `Severity: ${severity}\n`
  prompt += `Metric: ${metric}\n`
  prompt += `Expected Value: ${expectedValue.toFixed(2)}\n`
  prompt += `Actual Value: ${actualValue.toFixed(2)}\n`
  prompt += `Change: ${percentChange}%\n`
  prompt += `Statistical Deviation: ${deviationSigma.toFixed(2)}σ\n\n`

  if (recentNews.length > 0) {
    prompt += `Recent News:\n`
    recentNews.slice(0, 5).forEach((headline, i) => {
      prompt += `${i + 1}. ${headline}\n`
    })
    prompt += `\n`
  }

  if (recentReleases && recentReleases.length > 0) {
    prompt += `Recent Releases:\n`
    recentReleases.forEach(release => {
      prompt += `- ${release}\n`
    })
    prompt += `\n`
  }

  if (recentCommits !== null) {
    prompt += `Recent Commits (last 7 days): ${recentCommits}\n\n`
  }

  prompt += `Provide a concise 2-3 sentence explanation of this anomaly. `
  prompt += `If possible, connect it to recent events (releases, news, conferences). `
  prompt += `Respond in JSON format:\n`
  prompt += `{\n`
  prompt += `  "explanation": "2-3 sentence explanation",\n`
  prompt += `  "confidence": "high" | "medium" | "low",\n`
  prompt += `  "relatedEvents": ["Event 1", "Event 2"]\n`
  prompt += `}`

  return prompt
}

const ANOMALY_SYSTEM_PROMPT = `You are a technology trend analyst specializing in explaining statistical anomalies.

Your task is to analyze detected anomalies in developer technology metrics and provide clear, concise explanations.

Guidelines:
- Be factual and data-driven
- Connect anomalies to real events when evidence exists (releases, conferences, breaking news)
- Use percentages and sigma values to quantify the anomaly
- Keep explanations to 2-3 sentences
- Set confidence to "high" only when there's clear evidence
- Set confidence to "medium" for probable correlations
- Set confidence to "low" when no clear explanation exists
- Always respond in valid JSON format

Example output:
{
  "explanation": "GitHub stars spiked 340% (8.2σ above average). Likely related to the SvelteKit 3.0 announcement at ViteConf — currently #2 on Hacker News with 842 upvotes.",
  "confidence": "high",
  "relatedEvents": ["SvelteKit 3.0 release", "ViteConf 2026 keynote"]
}
`
