import { Metadata } from 'next'
import { AskPageClient } from '@/components/ask/AskPageClient'
import { withCanonicalMetadata } from '@/lib/seo'

export const metadata: Metadata = withCanonicalMetadata('/ask', {
  title: 'Ask AI',
  description:
    'Ask DevTrends AI about technology trends, career advice, and learning recommendations.',
})

export default function AskPage() {
  return <AskPageClient />
}
