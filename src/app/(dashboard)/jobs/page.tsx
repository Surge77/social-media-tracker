import type { Metadata } from 'next'
import { JobsPageClient } from './JobsPageClient'

export const metadata: Metadata = {
  title: 'Jobs Intelligence',
  description:
    'Track live hiring demand by technology, role, company, location, remote share, and search-versus-hiring momentum.',
}

export default function JobsPage() {
  return <JobsPageClient />
}
