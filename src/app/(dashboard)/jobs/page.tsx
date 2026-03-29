import type { Metadata } from 'next'
import { withCanonicalMetadata } from '@/lib/seo'
import { JobsPageClient } from './JobsPageClient'

export const metadata: Metadata = withCanonicalMetadata('/jobs', {
  title: 'Jobs Intelligence',
  description:
    'Track live hiring demand by technology, role, company, location, remote share, and search-versus-hiring momentum.',
})

export default function JobsPage() {
  return <JobsPageClient />
}
