// Quiz Types - Shared across all quiz features

export type QuizType =
  | 'learn-next'
  | 'stack-health'
  | 'salary'
  | 'future-proof'
  | 'decision'
  | 'roadmap'
  | 'hype-check'

export type QuestionType =
  | 'single-select'
  | 'multi-select'
  | 'tech-select'
  | 'slider'
  | 'text'

export interface QuizOption {
  value: string
  label: string
  description?: string
  icon?: string
}

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  description?: string
  options?: QuizOption[]
  validation?: (value: unknown) => boolean
  required: boolean
  min?: number
  max?: number
  placeholder?: string
}

export interface QuizAnswer {
  questionId: string
  value: string | string[] | number
}

export interface QuizRecommendation {
  primary: {
    action: string
    technology?: string
    reasoning: string[]
    score?: number
    timeline?: string
  }
  secondary?: {
    action: string
    technology?: string
    reasoning: string[]
  }
  warnings?: string[]
  nextSteps: string[]
  relatedLinks: Array<{
    label: string
    href: string
  }>
}

export interface QuizResult {
  quizType: QuizType
  answers: QuizAnswer[]
  recommendation: QuizRecommendation
  completedAt: number
  version: string
}

// Quiz metadata for hub page
export interface QuizMetadata {
  id: QuizType
  title: string
  description: string
  icon: string
  duration: string
  questionCount: number
  gradient: string
  href: string
  priority: number
  enabled: boolean
  comingSoon?: boolean
}

// Storage types
export type QuizResultsMap = Partial<Record<QuizType, QuizResult>>
