import type { Metadata } from 'next'
import { QuizHubClient } from '@/components/quiz/QuizHubClient'

export const metadata: Metadata = {
  title: 'Career Quizzes | DevTrends',
  description:
    'Answer a few questions and get a technology recommendation backed by real market data. Takes under a minute.',
}

export default function QuizHubPage() {
  return <QuizHubClient />
}
