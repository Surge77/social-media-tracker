import { TrendingReposClient } from '@/components/repos/TrendingReposClient'
import { withCanonicalMetadata } from '@/lib/seo'

export const metadata = withCanonicalMetadata('/repos', {
  title: 'Trending Repos',
  description: 'Open-source repositories gaining momentum on GitHub.',
})

export default function ReposPage() {
  return <TrendingReposClient />
}
