/**
 * Stack analysis generator.
 *
 * Given a technology and a candidate list of real techs from the DB,
 * the AI selects 4–6 that are most commonly used together in production stacks
 * and explains specifically why each pairing exists.
 *
 * Candidates are pre-filtered to complementary categories so the AI
 * cannot return slugs that don't exist in our database.
 */

import type { AIProvider, GenerateOptions } from '@/lib/ai/provider'

export type PairingStrength = 'essential' | 'common' | 'optional'

export interface StackCompanion {
  slug: string
  reason: string
  pairingStrength: PairingStrength
}

export interface StackAnalysisResult {
  companions: StackCompanion[]
  stackSummary: string
}

export interface CandidateTech {
  slug: string
  name: string
  category: string
  description: string | null
}

export async function generateStackAnalysis(
  tech: { slug: string; name: string; category: string; description: string | null },
  candidates: CandidateTech[],
  provider: AIProvider
): Promise<StackAnalysisResult> {
  const prompt = buildPrompt(tech, candidates)

  const options: GenerateOptions = {
    temperature: 0.3,
    maxTokens: 1024,
  }

  return provider.generateJSON<StackAnalysisResult>(prompt, undefined, options)
}

function buildPrompt(
  tech: { slug: string; name: string; category: string; description: string | null },
  candidates: CandidateTech[]
): string {
  const candidateLines = candidates
    .map((c) => `- slug: "${c.slug}" | name: "${c.name}" | category: ${c.category}${c.description ? ` | ${c.description.slice(0, 80)}` : ''}`)
    .join('\n')

  return `You are a senior software architect. Analyze which technologies are most commonly used together with ${tech.name} in real production stacks.

TECHNOLOGY: ${tech.name}
CATEGORY: ${tech.category}
${tech.description ? `DESCRIPTION: ${tech.description}` : ''}

CANDIDATE TECHNOLOGIES (you MUST only select slugs from this exact list):
${candidateLines}

Select 4 to 6 technologies from the candidate list above that developers most frequently use alongside ${tech.name} in production. Focus on real co-occurrence patterns in job postings, GitHub repos, and engineering blogs.

For each selected technology:
- "slug": must be the exact slug from the candidate list above — no modifications
- "reason": 1–2 sentences explaining specifically WHY developers pair it with ${tech.name} in production. Be concrete (e.g. "provides the type safety that ${tech.name}'s JSX props need", not "commonly used together"). Developer audience.
- "pairingStrength": one of:
  - "essential" — almost always used together, rarely one without the other
  - "common" — used together in majority of production stacks
  - "optional" — frequently co-occurs but depends on the project type

Also return:
- "stackSummary": 1 sentence describing the overall production stack pattern these form together with ${tech.name}

Return a single JSON object:
{
  "companions": [
    { "slug": "...", "reason": "...", "pairingStrength": "essential" | "common" | "optional" }
  ],
  "stackSummary": "..."
}

Only return the JSON. No markdown, no explanation.`
}
