import { Metadata } from 'next'
import { DigestPageClient } from '@/components/digest/DigestPageClient'

export const metadata: Metadata = {
  title: 'Weekly Digest | DevTrends',
  description: 'Weekly intelligence report on technology trends, job market signals, and emerging technologies'
}

export default function DigestPage() {
  return <DigestPageClient />
}
