// src/lib/quiz/roadmap-questions.ts
// Quiz questions for Career Roadmap feature

import type { QuizQuestion } from './types'

export const roadmapQuestions: QuizQuestion[] = [
  // Q1: Starting Point (determines skip nodes)
  {
    id: 'starting-point',
    question: "Where are you right now?",
    description: "Be honest — this shapes your entire roadmap",
    type: 'single-select',
    required: true,
    options: [
      {
        value: 'absolute-beginner',
        label: '🌱 Complete Beginner',
        description: "Never written a line of code"
      },
      {
        value: 'basics',
        label: '📝 Know the Basics',
        description: "HTML, CSS, maybe some JS"
      },
      {
        value: 'one-language',
        label: '💻 Comfortable with One Language',
        description: "Can build small projects"
      },
      {
        value: 'junior',
        label: '🔧 Working Developer',
        description: "Have a job or serious projects"
      },
      {
        value: 'mid-level',
        label: '⚡ Mid-Level Developer',
        description: "2-4 years of professional experience"
      },
      {
        value: 'senior-pivoting',
        label: '🎯 Senior Developer (Pivoting)',
        description: "Experienced, switching specialties"
      }
    ]
  },

  // Q2: Current Skills (uses custom GroupedTechSelect component)
  {
    id: 'current-skills',
    question: "What do you already know?",
    description: "Select everything you're comfortable with (we'll skip these)",
    type: 'tech-select',
    required: true,
    // This type will be handled by GroupedTechSelect component
  },

  // Q3: Target Role (selects role template)
  {
    id: 'target-role',
    question: "Where do you want to end up?",
    description: "Pick the role that excites you most",
    type: 'single-select',
    required: true,
    options: [
      {
        value: 'frontend-developer',
        label: '🎨 Frontend Developer',
        description: 'Build beautiful, interactive web apps'
      },
      {
        value: 'backend-developer',
        label: '⚙️ Backend Developer',
        description: 'Build APIs, databases, server logic'
      },
      {
        value: 'fullstack-developer',
        label: '🔄 Full-Stack Developer',
        description: 'Do it all — frontend + backend'
      },
      {
        value: 'mobile-developer',
        label: '📱 Mobile Developer',
        description: 'Build iOS/Android apps',
      },
      {
        value: 'devops-engineer',
        label: '☁️ DevOps / Cloud Engineer',
        description: 'Infrastructure, CI/CD, cloud',
      },
      {
        value: 'data-engineer',
        label: '📊 Data Engineer / Scientist',
        description: 'Data pipelines, ML, analytics',
      },
      {
        value: 'ai-ml-engineer',
        label: '🤖 AI/ML Engineer',
        description: 'Machine learning, LLMs, AI products',
      },
      {
        value: 'blockchain-developer',
        label: '⛓️ Blockchain Developer',
        description: 'Smart contracts, Web3, DeFi'
      }
    ]
  },

  // Q4: Time & Urgency
  {
    id: 'time-commitment',
    question: "How much time can you invest?",
    description: "This determines your timeline and phase lengths",
    type: 'single-select',
    required: true,
    options: [
      {
        value: '5hrs',
        label: '⏰ 5 hrs/week',
        description: 'Casual — steady progress'
      },
      {
        value: '10hrs',
        label: '📚 10 hrs/week',
        description: 'Serious — 1-2 hrs/day'
      },
      {
        value: '20hrs',
        label: '🔥 20 hrs/week',
        description: 'Intensive — part-time dedication'
      },
      {
        value: 'fulltime',
        label: '🚀 Full-time (40+ hrs)',
        description: 'Bootcamp mode — all in'
      }
    ]
  },

  // Q5: Primary Motivation (shapes prioritization)
  {
    id: 'motivation',
    question: "What's driving you?",
    description: "This changes which technologies we prioritize",
    type: 'single-select',
    required: true,
    options: [
      {
        value: 'get-first-job',
        label: '💼 Land my first dev job',
        description: 'Fastest path to employment'
      },
      {
        value: 'level-up',
        label: '📈 Level up at current job',
        description: 'Get promoted or raise'
      },
      {
        value: 'switch-specialty',
        label: '🔀 Switch specialties',
        description: 'Move from frontend to backend, etc.'
      },
      {
        value: 'build-product',
        label: '🚀 Build my own product',
        description: 'Full-stack for side projects / startups'
      },
      {
        value: 'future-proof',
        label: '🛡️ Future-proof my career',
        description: 'Stay relevant for the next 5 years'
      }
    ]
  },

  // Q6: Learning Style (shapes resource suggestions)
  {
    id: 'learning-style',
    question: "How do you learn best?",
    description: "We'll tailor resource recommendations to your style",
    type: 'single-select',
    required: true,
    options: [
      {
        value: 'build-projects',
        label: '🛠️ Build real projects',
        description: "Learn by doing"
      },
      {
        value: 'structured-courses',
        label: '📖 Follow structured courses',
        description: "Step-by-step guidance"
      },
      {
        value: 'read-docs',
        label: '📄 Read documentation',
        description: "Self-directed deep dives"
      },
      {
        value: 'video-tutorials',
        label: '🎥 Watch video tutorials',
        description: "Visual learning"
      }
    ]
  }
]

/**
 * Get question by ID
 */
export function getRoadmapQuestion(id: string): QuizQuestion | undefined {
  return roadmapQuestions.find(q => q.id === id)
}

/**
 * Get all roadmap questions
 */
export function getAllRoadmapQuestions(): QuizQuestion[] {
  return roadmapQuestions
}

/**
 * Validate roadmap quiz answers
 */
export function validateRoadmapAnswers(answers: Record<string, string | string[]>): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check required questions
  const requiredQuestions = ['starting-point', 'current-skills', 'target-role', 'time-commitment', 'motivation']

  requiredQuestions.forEach(qId => {
    if (!answers[qId] || (Array.isArray(answers[qId]) && answers[qId].length === 0)) {
      const question = getRoadmapQuestion(qId)
      errors.push(`${question?.question ?? qId} is required`)
    }
  })

  // Validate current-skills is an array
  if (answers['current-skills'] && !Array.isArray(answers['current-skills'])) {
    errors.push('Current skills must be an array')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
