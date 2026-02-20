import { LanguageRankingsClient } from '@/components/languages/LanguageRankingsClient'

export const metadata = {
  title: 'Language Rankings | DevTrends',
  description: 'Programming languages ranked by GitHub repos, Stack Overflow activity, and job market demand',
}

export default function LanguagesPage() {
  return <LanguageRankingsClient />
}
