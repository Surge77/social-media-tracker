import { LanguageRankingsClient } from '@/components/languages/LanguageRankingsClient'
import { withCanonicalMetadata } from '@/lib/seo'

export const metadata = withCanonicalMetadata('/languages', {
  title: 'Language Rankings',
  description:
    'Programming languages ranked by GitHub repos, Stack Overflow activity, and job market demand.',
})

export default function LanguagesPage() {
  return <LanguageRankingsClient />
}
