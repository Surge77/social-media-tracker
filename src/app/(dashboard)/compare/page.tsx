import type { Metadata } from 'next'
import { ComparePageClient } from '@/components/compare/ComparePageClient'

export const metadata: Metadata = {
  title: 'Compare Technologies',
  description:
    'Side-by-side comparison of technology trends, scores, and metrics. Compare up to 4 technologies across GitHub, community, jobs, and ecosystem dimensions.',
}

export default function ComparePage() {
  return <ComparePageClient />
}
