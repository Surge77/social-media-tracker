import type { AIProvider } from '@/lib/ai/provider'
import type { JobsOverviewResponse } from '@/types'

export interface JobsAISummary {
  headline: string
  summary: string
  bullets: string[]
}

function buildOverviewPrompt(data: JobsOverviewResponse): string {
  const topHiring = data.hiringNow.slice(0, 5)
    .map((entry) => `${entry.name}: ${entry.activeJobs} active jobs, ${entry.remoteShare}% remote`)
    .join('\n')
  const topRoles = data.risingRoles.slice(0, 5)
    .map((entry) => `${entry.roleLabel} + ${entry.technologyName}: ${entry.activeJobs} active, ${entry.growth7d >= 0 ? '+' : ''}${entry.growth7d.toFixed(1)} growth`)
    .join('\n')
  const topCompanies = data.companyRadar.slice(0, 5)
    .map((entry) => `${entry.companyName}: ${entry.activeJobs} jobs, top stacks ${entry.topTechnologies.map((technology) => technology.name).join(', ')}`)
    .join('\n')
  const topSearchGap = data.searchVsHiring.slice(0, 5)
    .map((entry) => `${entry.technologyName}: search ${entry.searchVelocity.toFixed(1)}, hiring ${entry.jobsVelocity.toFixed(1)}, quadrant ${entry.quadrant}`)
    .join('\n')

  return `You are summarizing a developer jobs intelligence dashboard.

Return strict JSON with:
- headline: short sentence (max 12 words)
- summary: 2-3 concise sentences grounded in the data
- bullets: array of exactly 3 short bullet strings

Do not invent facts.
Do not use markdown.

PULSE
- totalActiveJobs: ${data.pulse.totalActiveJobs}
- totalRemoteJobs: ${data.pulse.totalRemoteJobs}
- remoteShare: ${data.pulse.remoteShare}%
- trackedCompanies: ${data.pulse.trackedCompanies}
- trackedLocations: ${data.pulse.trackedLocations}

HIRING NOW
${topHiring || 'No data'}

RISING ROLES
${topRoles || 'No data'}

COMPANY RADAR
${topCompanies || 'No data'}

SEARCH VS HIRING
${topSearchGap || 'No data'}`
}

export async function generateJobsSummary(
  data: JobsOverviewResponse,
  provider: AIProvider
): Promise<JobsAISummary> {
  const prompt = buildOverviewPrompt(data)
  return provider.generateJSON<JobsAISummary>(prompt, undefined, {
    temperature: 0.2,
    maxTokens: 500,
  })
}

export function fallbackJobsSummary(data: JobsOverviewResponse): JobsAISummary {
  const topHiring = data.hiringNow[0]
  const topRole = data.risingRoles[0]
  const topGap = data.searchVsHiring[0]

  return {
    headline: topHiring
      ? `${topHiring.name} leads the hiring board`
      : 'Jobs intelligence is live',
    summary: topHiring
      ? `${topHiring.name} currently shows the strongest active demand in the tracked market. ${topRole ? `${topRole.roleLabel} roles tied to ${topRole.technologyName} are among the fastest movers.` : ''} ${topGap ? `${topGap.technologyName} currently sits in the ${topGap.quadrant} bucket.` : ''}`.trim()
      : 'The jobs dashboard is using live hiring and market signals. Richer summaries will improve as listing-level data and search-trend signals refresh.',
    bullets: [
      topHiring
        ? `${topHiring.name}: ${topHiring.activeJobs.toLocaleString()} active jobs`
        : `${data.pulse.totalActiveJobs.toLocaleString()} active jobs tracked`,
      topRole
        ? `${topRole.roleLabel} + ${topRole.technologyName}: ${topRole.growth7d >= 0 ? '+' : ''}${topRole.growth7d.toFixed(1)} growth`
        : `${data.pulse.totalRemoteJobs.toLocaleString()} remote jobs tracked`,
      topGap
        ? `${topGap.technologyName}: ${topGap.quadrant}`
        : `${data.pulse.technologiesWithDemand} technologies show hiring demand`,
    ],
  }
}
