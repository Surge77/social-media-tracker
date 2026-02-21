import { Metadata } from 'next'
import { DigestPageClient } from '@/components/digest/DigestPageClient'

export const metadata: Metadata = {
  title: 'Weekly Digest | DevTrends',
  description: 'What moved in tech this week — rising technologies, notable drops, job market shifts, and what to watch next.'
}

export default function DigestPage() {
  return <DigestPageClient />
}
