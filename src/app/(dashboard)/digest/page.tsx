import { Metadata } from 'next'
import { DigestPageClient } from '@/components/digest/DigestPageClient'
import { PersonalizedDigest } from '@/components/digest/PersonalizedDigest'
import { withCanonicalMetadata } from '@/lib/seo'

export const metadata: Metadata = withCanonicalMetadata('/digest', {
  title: 'Weekly Digest',
  description:
    'What moved in tech this week: rising technologies, notable drops, job market shifts, and what to watch next.',
})

export default function DigestPage() {
  return (
    <>
      <div className="container mx-auto max-w-4xl px-4 pt-8">
        <PersonalizedDigest />
      </div>
      <DigestPageClient />
    </>
  )
}
