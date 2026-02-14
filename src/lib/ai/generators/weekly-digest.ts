/**
 * Weekly Digest Generator
 *
 * Generates a weekly intelligence report summarizing:
 * - Biggest mover / drop
 * - Category spotlight
 * - Emerging tech
 * - Job market signal
 * - Key takeaways
 */

import type { AIProvider } from '@/lib/ai/provider'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getActivePrompt } from '@/lib/ai/prompt-manager'

export interface DigestSection {
  title: string
  narrative: string // 3-4 sentences with data citations
  technologies?: Array<{ slug: string; name: string; change: number }>
}

export interface WeeklyDigest {
  weekStart: string // ISO date of Monday
  sections: DigestSection[]
  keyTakeaways: string[]
  generatedAt: string
}

interface TechnologyWithScore {
  id: string
  slug: string
  name: string
  category: string
  composite_score: number
  momentum: number
  jobs_score: number
  first_appeared?: number | null
}

/**
 * Generate weekly digest from technology data
 */
export async function generateWeeklyDigest(
  weekStart: Date,
  technologies: TechnologyWithScore[],
  provider: AIProvider,
  supabase: SupabaseClient
): Promise<WeeklyDigest> {
  // 1. Analyze the week's data
  const analysis = analyzeWeeklyData(technologies)

  // 2. Build prompt for AI
  const prompt = buildDigestPrompt(weekStart, analysis)

  // 3. Load system prompt from database
  const systemPrompt = await getActivePrompt(supabase, 'digest-system')

  // 4. Generate digest narrative
  const response = await provider.generateText(prompt, {
    maxTokens: 1000,
    temperature: 0.4,
    systemPrompt: systemPrompt || undefined
  })

  // 5. Parse response (clean markdown code fences if present)
  try {
    let cleanedResponse = response.trim()

    // Remove markdown code fences if present
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse
        .replace(/^```json?\n?/, '')
        .replace(/\n?```$/, '')
        .trim()
    }

    const parsed = JSON.parse(cleanedResponse)

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      sections: parsed.sections || [],
      keyTakeaways: parsed.keyTakeaways || [],
      generatedAt: new Date().toISOString()
    }
  } catch (error) {
    // Fallback if AI doesn't return valid JSON
    console.error('[WeeklyDigest] Failed to parse response:', error)
    return {
      weekStart: weekStart.toISOString().split('T')[0],
      sections: [
        {
          title: 'Weekly Summary',
          narrative: response.substring(0, 500)
        }
      ],
      keyTakeaways: [],
      generatedAt: new Date().toISOString()
    }
  }
}

/**
 * Analyze weekly technology data for digest
 */
function analyzeWeeklyData(technologies: TechnologyWithScore[]) {
  // Sort by momentum change
  const sorted = [...technologies].sort((a, b) => b.momentum - a.momentum)

  // Find biggest mover
  const biggestMover = sorted[0]

  // Find biggest drop
  const biggestDrop = sorted[sorted.length - 1]

  // Find most active category (highest average momentum)
  const categoryMomentum = new Map<string, { sum: number; count: number }>()

  for (const tech of technologies) {
    const existing = categoryMomentum.get(tech.category) || { sum: 0, count: 0 }
    categoryMomentum.set(tech.category, {
      sum: existing.sum + tech.momentum,
      count: existing.count + 1
    })
  }

  let topCategory = 'frontend'
  let topCategoryMomentum = 0

  for (const [category, { sum, count }] of categoryMomentum) {
    const avg = sum / count
    if (avg > topCategoryMomentum) {
      topCategoryMomentum = avg
      topCategory = category
    }
  }

  // Find emerging tech (high momentum + recent)
  const currentYear = new Date().getFullYear()
  const emerging = technologies
    .filter(t => {
      const age = t.first_appeared ? currentYear - t.first_appeared : 999
      return age <= 3 && t.momentum > 5
    })
    .sort((a, b) => b.momentum - a.momentum)
    .slice(0, 3)

  // Job market overall trend
  const avgJobsScore = technologies.reduce((sum, t) => sum + t.jobs_score, 0) / technologies.length

  return {
    biggestMover,
    biggestDrop,
    topCategory,
    topCategoryTechs: technologies.filter(t => t.category === topCategory).slice(0, 5),
    emerging,
    avgJobsScore,
    totalTechnologies: technologies.length
  }
}

/**
 * Build prompt for weekly digest generation
 */
function buildDigestPrompt(weekStart: Date, analysis: ReturnType<typeof analyzeWeeklyData>): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const weekRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  let prompt = `Generate a weekly technology trends digest for ${weekRange}.\n\n`

  prompt += `Data Summary:\n`
  prompt += `- Total technologies tracked: ${analysis.totalTechnologies}\n`
  prompt += `- Biggest mover: ${analysis.biggestMover.name} (+${analysis.biggestMover.momentum} momentum)\n`
  prompt += `- Biggest drop: ${analysis.biggestDrop.name} (${analysis.biggestDrop.momentum} momentum)\n`
  prompt += `- Most active category: ${analysis.topCategory}\n`
  prompt += `- Average job market score: ${analysis.avgJobsScore.toFixed(1)}/100\n\n`

  if (analysis.emerging.length > 0) {
    prompt += `Emerging technologies:\n`
    for (const tech of analysis.emerging) {
      prompt += `- ${tech.name}: ${tech.momentum} momentum\n`
    }
    prompt += `\n`
  }

  prompt += `Create a digest with these sections:\n`
  prompt += `1. "Biggest Mover" - highlight ${analysis.biggestMover.name}\n`
  prompt += `2. "Biggest Drop" - explain ${analysis.biggestDrop.name}'s decline\n`
  prompt += `3. "Category Spotlight: ${analysis.topCategory}" - trends in this category\n`

  if (analysis.emerging.length > 0) {
    prompt += `4. "Emerging Tech" - highlight ${analysis.emerging[0].name}\n`
  }

  prompt += `5. "Job Market Signal" - overall hiring trends\n\n`

  prompt += `Also provide 3 key takeaways.\n\n`

  prompt += `Respond in JSON format:\n`
  prompt += `{\n`
  prompt += `  "sections": [\n`
  prompt += `    {\n`
  prompt += `      "title": "Section title",\n`
  prompt += `      "narrative": "3-4 sentence explanation with data",\n`
  prompt += `      "technologies": [{ "slug": "react", "name": "React", "change": 12.3 }]\n`
  prompt += `    }\n`
  prompt += `  ],\n`
  prompt += `  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]\n`
  prompt += `}`

  return prompt
}
