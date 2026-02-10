import type { Metadata } from 'next'
import { TechnologiesPageClient } from '@/components/technologies/TechnologiesPageClient'

export const metadata: Metadata = {
  title: 'Technology Explorer',
  description:
    'Track 100+ technologies across GitHub activity, community buzz, job market demand, and ecosystem health. Find rising stars and make data-driven career decisions.',
}

export default function TechnologiesPage() {
  return <TechnologiesPageClient />
}
