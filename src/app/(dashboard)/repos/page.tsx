import { TrendingReposClient } from '@/components/repos/TrendingReposClient'

export const metadata = {
  title: 'Trending Repos | DevTrends',
  description: 'Open-source repositories gaining momentum on GitHub',
}

export default function ReposPage() {
  return <TrendingReposClient />
}
