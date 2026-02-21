import type { Metadata } from 'next'
import { TechnologiesPageClient } from '@/components/technologies/TechnologiesPageClient'

export const metadata: Metadata = {
  title: 'Technology Explorer',
  description:
    '100+ technologies scored daily from GitHub, Stack Overflow, job postings, and community signal. See what\'s rising, what\'s falling, and what\'s worth learning next.',
}

export default function TechnologiesPage() {
  return <TechnologiesPageClient />
}
