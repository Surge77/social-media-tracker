import type { Metadata } from 'next'
import { QuizHubClient } from '@/components/quiz/QuizHubClient'
import { withCanonicalMetadata } from '@/lib/seo'

export const metadata: Metadata = withCanonicalMetadata('/quiz', {
  title: 'Career Quizzes',
  description:
    'Answer a few questions and get a technology recommendation backed by real market data. Takes under a minute.',
})

export default function QuizHubPage() {
  return <QuizHubClient />
}
