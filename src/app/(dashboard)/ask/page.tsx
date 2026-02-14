import { Metadata } from 'next'
import { AskPageClient } from '@/components/ask/AskPageClient'

export const metadata: Metadata = {
  title: 'Ask AI | DevTrends',
  description: 'Ask DevTrends AI about technology trends, career advice, and learning recommendations'
}

export default function AskPage() {
  return <AskPageClient />
}
