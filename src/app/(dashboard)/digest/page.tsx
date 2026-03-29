import { Metadata } from 'next'
import { DigestPageClient } from '@/components/digest/DigestPageClient'
import { withCanonicalMetadata } from '@/lib/seo'

export const metadata: Metadata = withCanonicalMetadata('/digest', {
  title: 'Weekly Digest',
  description:
    'What moved in tech this week: rising technologies, notable drops, job market shifts, and what to watch next.',
})

export default function DigestPage() {
  return <DigestPageClient />
}
