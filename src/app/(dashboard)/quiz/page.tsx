import type { Metadata } from 'next'
import { QuizHubClient } from '@/components/quiz/QuizHubClient'

export const metadata: Metadata = {
  title: 'Career Quizzes | DevTrends',
  description:
    'Make informed career decisions in 30 seconds with personalized technology recommendations.',
}

export default function QuizHubPage() {
  return <QuizHubClient />
}
