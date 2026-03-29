import type { Metadata } from 'next'
import { withCanonicalMetadata } from '@/lib/seo'
import { TechnologiesPageClient } from '@/components/technologies/TechnologiesPageClient'
import {
  getCachedTechnologiesResponse,
  getCachedTechnologyStatsResponse,
} from '@/lib/server/technology-data'

export const metadata: Metadata = withCanonicalMetadata('/technologies', {
  title: 'Technology Explorer',
  description:
    '100+ technologies scored daily from GitHub, Stack Overflow, job postings, and community signal. See what\'s rising, what\'s falling, and what\'s worth learning next.',
})

export default async function TechnologiesPage() {
  let initialTechnologies = null
  let initialStats = null

  try {
    ;[initialTechnologies, initialStats] = await Promise.all([
      getCachedTechnologiesResponse(),
      getCachedTechnologyStatsResponse(),
    ])
  } catch {
    initialTechnologies = null
    initialStats = null
  }

  return (
    <TechnologiesPageClient
      initialTechnologies={initialTechnologies}
      initialStats={initialStats}
    />
  )
}
