// src/lib/quiz/roadmap-templates.ts
// Role templates for career roadmaps

import type { RoleTemplate } from './roadmap-engine'

/**
 * Frontend Developer Template
 * React → TypeScript → Next.js path (most popular)
 */
export const frontendTemplate: RoleTemplate = {
  id: 'frontend-developer',
  version: 1,
  role: 'Frontend Developer',
  description: 'Build beautiful, interactive web applications',
  totalNodes: 18,
  minimumStartingPoint: undefined,  // No restriction, suitable for all levels
  estimatedMonths: {
    beginner: 6,      // 6 months for absolute beginners
    intermediate: 4,  // 4 months if you know HTML/CSS/JS
    advanced: 2,      // 2 months for experienced devs pivoting
  },
  phases: [
    {
      number: 1,
      name: '🏗️ Foundations',
      description: 'The building blocks — boring but essential',
      milestone: 'You can build static websites',
      nodes: [
        {
          id: 'html',
          technologySlug: 'html',
          name: 'HTML',
          category: 'foundation',
          difficulty: 'beginner',
          estimatedHours: 15,
          dependencies: [],
          optional: false,
          milestone: 'Can structure any webpage',
          projectIdea: 'Build your portfolio site structure',
          honestNote: "Not glamorous, but every single webpage uses it.",
          fallbackScores: {
            jobsScore: 70,
            momentum: 2,
            jobCount: 5000,
          }
        },
        {
          id: 'css',
          technologySlug: 'css',
          name: 'CSS',
          category: 'foundation',
          difficulty: 'beginner',
          estimatedHours: 25,
          dependencies: ['html'],
          optional: false,
          milestone: 'Can style any webpage beautifully',
          projectIdea: 'Make your portfolio site beautiful',
          honestNote: "CSS is deeper than people think. Flexbox + Grid = 90% of layouts.",
          fallbackScores: {
            jobsScore: 72,
            momentum: 3,
            jobCount: 4800,
          }
        },
        {
          id: 'javascript',
          technologySlug: 'javascript',
          name: 'JavaScript',
          category: 'foundation',
          difficulty: 'beginner',
          estimatedHours: 60,
          dependencies: ['html', 'css'],
          optional: false,
          milestone: 'Can add interactivity to any webpage',
          projectIdea: 'Build a to-do app with vanilla JS',
          honestNote: "The most important language in web dev. Master this BEFORE frameworks.",
          fallbackScores: {
            jobsScore: 88,
            momentum: 5,
            jobCount: 8500,
          }
        }
      ]
    },
    {
      number: 2,
      name: '⚡ Core Skills',
      description: 'The skills every frontend dev needs',
      milestone: 'You can build modern web apps',
      jobsUnlocked: '~800 junior frontend jobs',
      nodes: [
        {
          id: 'typescript',
          technologySlug: 'typescript',
          name: 'TypeScript',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 25,
          dependencies: ['javascript'],
          optional: false,
          priorityBoost: { 'get-first-job': 20, 'build-product': 5, 'future-proof': 25, 'level-up': 15, 'switch-specialty': 10 },
          honestNote: "78% of React jobs require TypeScript. Learn it before React, not after.",
          fallbackScores: {
            jobsScore: 82,
            momentum: 12,
            jobCount: 6200,
          }
        },
        {
          id: 'react',
          technologySlug: 'react',
          name: 'React',
          category: 'framework',
          difficulty: 'intermediate',
          estimatedHours: 50,
          dependencies: ['javascript', 'typescript'],
          optional: false,
          priorityBoost: { 'get-first-job': 30, 'build-product': 20, 'future-proof': 15, 'level-up': 25, 'switch-specialty': 20 },
          honestNote: "Still the #1 framework by jobs. Learn hooks deeply, skip class components.",
          projectIdea: "Build a dashboard with live data",
          fallbackScores: {
            jobsScore: 90,
            momentum: 8,
            jobCount: 9500,
          }
        },
        {
          id: 'git',
          technologySlug: 'git',
          name: 'Git & GitHub',
          category: 'tool',
          difficulty: 'beginner',
          estimatedHours: 10,
          dependencies: [],
          optional: false,
          honestNote: "You'll use this every single day. Learn it early.",
          fallbackScores: {
            jobsScore: 75,
            momentum: 3,
            jobCount: 7000,
          }
        },
        {
          id: 'tailwindcss',
          technologySlug: 'tailwindcss',
          name: 'Tailwind CSS',
          category: 'tool',
          difficulty: 'beginner',
          estimatedHours: 10,
          dependencies: ['css'],
          optional: true,
          priorityBoost: { 'get-first-job': 15, 'build-product': 25, 'future-proof': 10, 'level-up': 12, 'switch-specialty': 8 },
          honestNote: "Love it or hate it, 45% of new projects use it. Fast for building UIs.",
          fallbackScores: {
            jobsScore: 68,
            momentum: 15,
            jobCount: 3200,
          }
        }
      ]
    },
    {
      number: 3,
      name: '🚀 Production-Ready',
      description: 'What separates juniors from mids',
      milestone: 'You can build and deploy production apps',
      jobsUnlocked: '~2,400 mid-level frontend jobs',
      nodes: [
        {
          id: 'nextjs',
          technologySlug: 'next-js',
          name: 'Next.js',
          category: 'framework',
          difficulty: 'intermediate',
          estimatedHours: 35,
          dependencies: ['react', 'typescript'],
          optional: false,
          priorityBoost: { 'get-first-job': 25, 'build-product': 30, 'future-proof': 20, 'level-up': 28, 'switch-specialty': 15 },
          honestNote: "The React framework everyone uses. SSR, routing, API routes — it does it all.",
          projectIdea: "Build a full-stack blog with auth",
          fallbackScores: {
            jobsScore: 78,
            momentum: 18,
            jobCount: 4200,
          }
        },
        {
          id: 'testing',
          name: 'Testing (Jest + RTL)',
          category: 'tool',
          difficulty: 'intermediate',
          estimatedHours: 20,
          dependencies: ['react'],
          optional: false,
          priorityBoost: { 'get-first-job': 20, 'build-product': 5, 'future-proof': 10, 'level-up': 22, 'switch-specialty': 12 },
          honestNote: "No one loves writing tests. But 60% of job interviews ask about it.",
          fallbackScores: {
            jobsScore: 65,
            momentum: 5,
            jobCount: 1200,
          }
        },
        {
          id: 'state-management',
          name: 'State Management (Zustand/Redux)',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 15,
          dependencies: ['react'],
          optional: false,
          honestNote: "Zustand is simpler and gaining fast. Redux is still in 40% of codebases.",
          fallbackScores: {
            jobsScore: 60,
            momentum: 8,
            jobCount: 2800,
          }
        }
      ]
    },
    {
      number: 4,
      name: '🎯 Specialization',
      description: 'Pick your edge — what makes you stand out',
      milestone: 'You have a specialization that sets you apart',
      jobsUnlocked: '~3,800 mid-to-senior frontend jobs',
      nodes: [
        {
          id: 'performance',
          name: 'Web Performance',
          category: 'specialization',
          difficulty: 'advanced',
          estimatedHours: 20,
          dependencies: ['nextjs'],
          optional: true,
          honestNote: "High-value skill. Companies pay premium for devs who can make things fast.",
          fallbackScores: {
            jobsScore: 55,
            momentum: 8,
            jobCount: 800,
          }
        },
        {
          id: 'a11y',
          name: 'Accessibility (a11y)',
          category: 'specialization',
          difficulty: 'intermediate',
          estimatedHours: 15,
          dependencies: ['html', 'react'],
          optional: true,
          honestNote: "Legally required in many countries. Very few devs know this well.",
          fallbackScores: {
            jobsScore: 52,
            momentum: 6,
            jobCount: 600,
          }
        },
        {
          id: 'graphql',
          technologySlug: 'graphql',
          name: 'GraphQL',
          category: 'specialization',
          difficulty: 'intermediate',
          estimatedHours: 20,
          dependencies: ['react'],
          optional: true,
          honestNote: "Hot in startups, less common in enterprise. Learn REST first.",
          fallbackScores: {
            jobsScore: 48,
            momentum: 4,
            jobCount: 1500,
          }
        },
        {
          id: 'animation',
          name: 'Animation (Framer Motion)',
          category: 'specialization',
          difficulty: 'intermediate',
          estimatedHours: 15,
          dependencies: ['react'],
          optional: true,
          honestNote: "Makes your portfolio POP. Great for standing out in interviews.",
          fallbackScores: {
            jobsScore: 45,
            momentum: 10,
            jobCount: 400,
          }
        }
      ]
    }
  ],
  milestones: [
    {
      afterPhase: 1,
      title: '🎉 Web Foundations Complete!',
      description: 'You can build static websites from scratch',
      celebration: 'confetti',
      jobImpact: 'You could freelance building basic websites'
    },
    {
      afterPhase: 2,
      title: '🔥 Modern Developer!',
      description: 'You can build interactive React applications',
      celebration: 'fireworks',
      jobImpact: 'You qualify for ~800 junior frontend positions'
    },
    {
      afterPhase: 3,
      title: '🚀 Production-Ready!',
      description: 'You can build and deploy real-world applications',
      celebration: 'rocket',
      jobImpact: 'You qualify for ~2,400 mid-level positions'
    },
    {
      afterPhase: 4,
      title: '⭐ Specialized Expert!',
      description: 'You have skills that make you stand out',
      celebration: 'star',
      jobImpact: 'You qualify for ~3,800 positions including senior roles'
    }
  ]
}

/**
 * Backend Developer Template
 * Node.js path (MVP) - Python path optional for Phase 5
 */
export const backendTemplate: RoleTemplate = {
  id: 'backend-developer',
  version: 1,
  role: 'Backend Developer',
  description: 'Build APIs, databases, and server logic',
  totalNodes: 16,
  minimumStartingPoint: undefined,
  estimatedMonths: {
    beginner: 7,      // 7 months for absolute beginners
    intermediate: 5,  // 5 months if you know one language
    advanced: 3,      // 3 months for experienced devs
  },
  phases: [
    {
      number: 1,
      name: '🏗️ Foundations',
      description: 'Start with one language and master it deeply',
      milestone: 'You can write server-side code',
      nodes: [
        {
          id: 'javascript-backend',
          technologySlug: 'javascript',
          name: 'JavaScript Fundamentals',
          category: 'foundation',
          difficulty: 'beginner',
          estimatedHours: 50,
          dependencies: [],
          optional: false,
          skipIf: ['javascript', 'typescript', 'nodejs'],
          honestNote: "JavaScript everywhere. Great for full-stack potential.",
          fallbackScores: {
            jobsScore: 88,
            momentum: 5,
            jobCount: 8500,
          }
        },
        {
          id: 'nodejs',
          technologySlug: 'nodejs',
          name: 'Node.js',
          category: 'core',
          difficulty: 'beginner',
          estimatedHours: 40,
          dependencies: ['javascript-backend'],
          optional: false,
          projectIdea: "Build a REST API with Express",
          honestNote: "The most popular backend for JavaScript. Event-driven and fast.",
          fallbackScores: {
            jobsScore: 85,
            momentum: 6,
            jobCount: 7200,
          }
        },
        {
          id: 'git-backend',
          technologySlug: 'git',
          name: 'Git & GitHub',
          category: 'tool',
          difficulty: 'beginner',
          estimatedHours: 10,
          dependencies: [],
          optional: false,
          skipIf: ['git'],
          honestNote: "Essential for collaboration. Learn it from day 1.",
          fallbackScores: {
            jobsScore: 75,
            momentum: 3,
            jobCount: 7000,
          }
        }
      ]
    },
    {
      number: 2,
      name: '⚡ Core Skills',
      description: 'Databases and APIs are the core of backend work',
      milestone: 'You can build complete backend systems',
      jobsUnlocked: '~1,200 junior backend jobs',
      nodes: [
        {
          id: 'typescript-backend',
          technologySlug: 'typescript',
          name: 'TypeScript',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 25,
          dependencies: ['nodejs'],
          optional: false,
          skipIf: ['typescript'],
          priorityBoost: { 'get-first-job': 25, 'build-product': 10, 'future-proof': 30, 'level-up': 20, 'switch-specialty': 15 },
          honestNote: "Type safety prevents bugs. Essential for production Node.js.",
          fallbackScores: {
            jobsScore: 82,
            momentum: 12,
            jobCount: 6200,
          }
        },
        {
          id: 'postgresql',
          technologySlug: 'postgresql',
          name: 'PostgreSQL',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 35,
          dependencies: [],
          optional: false,
          projectIdea: "Design a database schema for a blog platform",
          honestNote: "The #1 production database. Learn SQL deeply.",
          fallbackScores: {
            jobsScore: 80,
            momentum: 7,
            jobCount: 5800,
          }
        },
        {
          id: 'rest-apis',
          name: 'REST API Design',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 30,
          dependencies: ['nodejs'],
          optional: false,
          honestNote: "The standard for web APIs. Master this before GraphQL.",
          fallbackScores: {
            jobsScore: 78,
            momentum: 4,
            jobCount: 6500,
          }
        },
        {
          id: 'authentication',
          name: 'Authentication & Authorization',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 25,
          dependencies: ['rest-apis'],
          optional: false,
          honestNote: "JWT, OAuth, sessions — every backend needs this.",
          fallbackScores: {
            jobsScore: 70,
            momentum: 5,
            jobCount: 4200,
          }
        }
      ]
    },
    {
      number: 3,
      name: '🚀 Production-Ready',
      description: 'DevOps basics make you 10x more valuable',
      milestone: 'You can deploy and maintain production systems',
      jobsUnlocked: '~2,800 mid-level backend jobs',
      nodes: [
        {
          id: 'docker',
          technologySlug: 'docker',
          name: 'Docker',
          category: 'tool',
          difficulty: 'intermediate',
          estimatedHours: 20,
          dependencies: [],
          optional: false,
          priorityBoost: { 'get-first-job': 20, 'build-product': 15, 'future-proof': 25, 'level-up': 25, 'switch-specialty': 20 },
          honestNote: "Containerization is standard in modern backend development.",
          fallbackScores: {
            jobsScore: 76,
            momentum: 10,
            jobCount: 4500,
          }
        },
        {
          id: 'testing-backend',
          name: 'Testing (Jest + Supertest)',
          category: 'tool',
          difficulty: 'intermediate',
          estimatedHours: 20,
          dependencies: ['nodejs'],
          optional: false,
          skipIf: ['testing'],
          honestNote: "Backend testing is critical. Test your APIs thoroughly.",
          fallbackScores: {
            jobsScore: 65,
            momentum: 5,
            jobCount: 1200,
          }
        },
        {
          id: 'aws-basics',
          technologySlug: 'aws',
          name: 'AWS Basics',
          category: 'tool',
          difficulty: 'intermediate',
          estimatedHours: 30,
          dependencies: ['docker'],
          optional: false,
          priorityBoost: { 'get-first-job': 30, 'build-product': 10, 'future-proof': 20, 'level-up': 28, 'switch-specialty': 15 },
          honestNote: "65% of backend jobs mention AWS. Learn the basics early.",
          fallbackScores: {
            jobsScore: 82,
            momentum: 8,
            jobCount: 5200,
          }
        }
      ]
    },
    {
      number: 4,
      name: '🎯 Specialization',
      description: 'Choose your backend superpower',
      milestone: 'You have deep expertise in a backend specialty',
      jobsUnlocked: '~4,200 mid-to-senior backend jobs',
      nodes: [
        {
          id: 'microservices',
          name: 'Microservices Architecture',
          category: 'specialization',
          difficulty: 'advanced',
          estimatedHours: 30,
          dependencies: ['docker', 'rest-apis'],
          optional: true,
          honestNote: "Enterprise standard. Overkill for most startups.",
          fallbackScores: {
            jobsScore: 68,
            momentum: 9,
            jobCount: 2400,
          }
        },
        {
          id: 'graphql-backend',
          technologySlug: 'graphql',
          name: 'GraphQL',
          category: 'specialization',
          difficulty: 'intermediate',
          estimatedHours: 25,
          dependencies: ['rest-apis'],
          optional: true,
          skipIf: ['graphql'],
          honestNote: "Popular in startups. Not as common as REST yet.",
          fallbackScores: {
            jobsScore: 58,
            momentum: 7,
            jobCount: 1800,
          }
        },
        {
          id: 'redis',
          technologySlug: 'redis',
          name: 'Redis & Caching',
          category: 'specialization',
          difficulty: 'intermediate',
          estimatedHours: 15,
          dependencies: ['postgresql'],
          optional: true,
          honestNote: "Performance multiplier. Learn after mastering SQL.",
          fallbackScores: {
            jobsScore: 62,
            momentum: 6,
            jobCount: 2100,
          }
        },
        {
          id: 'event-driven',
          name: 'Event-Driven Architecture',
          category: 'specialization',
          difficulty: 'advanced',
          estimatedHours: 25,
          dependencies: ['nodejs'],
          optional: true,
          honestNote: "Message queues, pub/sub. Critical for scalable systems.",
          fallbackScores: {
            jobsScore: 64,
            momentum: 8,
            jobCount: 1600,
          }
        }
      ]
    }
  ],
  milestones: [
    {
      afterPhase: 1,
      title: '🎉 Backend Foundations Complete!',
      description: 'You can write server-side code and build basic APIs',
      celebration: 'confetti',
      jobImpact: 'You have the fundamentals for backend development'
    },
    {
      afterPhase: 2,
      title: '🔥 Full Backend Developer!',
      description: 'You can build complete backend systems with databases',
      celebration: 'fireworks',
      jobImpact: 'You qualify for ~1,200 junior backend positions'
    },
    {
      afterPhase: 3,
      title: '🚀 Production-Ready!',
      description: 'You can deploy and maintain production systems',
      celebration: 'rocket',
      jobImpact: 'You qualify for ~2,800 mid-level positions'
    },
    {
      afterPhase: 4,
      title: '⭐ Backend Expert!',
      description: 'You have specialized backend skills',
      celebration: 'star',
      jobImpact: 'You qualify for ~4,200 positions including senior roles'
    }
  ]
}

/**
 * Full-Stack Developer Template
 * Combines frontend + backend (longest roadmap)
 */
export const fullstackTemplate: RoleTemplate = {
  id: 'fullstack-developer',
  version: 1,
  role: 'Full-Stack Developer',
  description: 'Build complete web applications from frontend to backend',
  totalNodes: 22,
  minimumStartingPoint: undefined,
  estimatedMonths: {
    beginner: 10,     // 10 months for absolute beginners
    intermediate: 7,  // 7 months if you know one stack
    advanced: 4,      // 4 months for experienced devs
  },
  phases: [
    {
      number: 1,
      name: '🏗️ Frontend Foundations',
      description: 'Master frontend first, then add backend',
      milestone: 'You can build interactive frontends',
      nodes: [
        {
          id: 'html-fullstack',
          technologySlug: 'html',
          name: 'HTML',
          category: 'foundation',
          difficulty: 'beginner',
          estimatedHours: 15,
          dependencies: [],
          optional: false,
          skipIf: ['html'],
          honestNote: "Foundation for all web apps. Learn it well.",
          fallbackScores: { jobsScore: 70, momentum: 2, jobCount: 5000 }
        },
        {
          id: 'css-fullstack',
          technologySlug: 'css',
          name: 'CSS',
          category: 'foundation',
          difficulty: 'beginner',
          estimatedHours: 25,
          dependencies: ['html-fullstack'],
          optional: false,
          skipIf: ['css'],
          honestNote: "Flexbox and Grid are essential. Master them.",
          fallbackScores: { jobsScore: 72, momentum: 3, jobCount: 4800 }
        },
        {
          id: 'javascript-fullstack',
          technologySlug: 'javascript',
          name: 'JavaScript',
          category: 'foundation',
          difficulty: 'beginner',
          estimatedHours: 60,
          dependencies: ['html-fullstack', 'css-fullstack'],
          optional: false,
          skipIf: ['javascript'],
          honestNote: "The language of the web. Essential for both frontend and backend.",
          fallbackScores: { jobsScore: 88, momentum: 5, jobCount: 8500 }
        },
        {
          id: 'react-fullstack',
          technologySlug: 'react',
          name: 'React',
          category: 'framework',
          difficulty: 'intermediate',
          estimatedHours: 50,
          dependencies: ['javascript-fullstack'],
          optional: false,
          skipIf: ['react'],
          priorityBoost: { 'get-first-job': 30, 'build-product': 25, 'future-proof': 20, 'level-up': 25, 'switch-specialty': 20 },
          honestNote: "Learn React before backend. You'll need a frontend for your APIs.",
          fallbackScores: { jobsScore: 90, momentum: 8, jobCount: 9500 }
        }
      ]
    },
    {
      number: 2,
      name: '⚡ Full-Stack Core',
      description: 'The magic: connecting frontend to backend',
      milestone: 'You can build complete applications',
      jobsUnlocked: '~1,500 full-stack junior jobs',
      nodes: [
        {
          id: 'typescript-fullstack',
          technologySlug: 'typescript',
          name: 'TypeScript',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 30,
          dependencies: ['javascript-fullstack'],
          optional: false,
          skipIf: ['typescript'],
          priorityBoost: { 'get-first-job': 25, 'build-product': 15, 'future-proof': 30, 'level-up': 22, 'switch-specialty': 18 },
          honestNote: "Type safety across your entire stack. Non-negotiable in 2026.",
          fallbackScores: { jobsScore: 82, momentum: 12, jobCount: 6200 }
        },
        {
          id: 'nextjs-fullstack',
          technologySlug: 'next-js',
          name: 'Next.js',
          category: 'framework',
          difficulty: 'intermediate',
          estimatedHours: 45,
          dependencies: ['react-fullstack', 'typescript-fullstack'],
          optional: false,
          skipIf: ['nextjs', 'next-js'],
          priorityBoost: { 'get-first-job': 28, 'build-product': 35, 'future-proof': 25, 'level-up': 30, 'switch-specialty': 20 },
          projectIdea: "Build a full-stack app with API routes",
          honestNote: "Full-stack framework. Handles frontend, API routes, and deployment.",
          fallbackScores: { jobsScore: 78, momentum: 18, jobCount: 4200 }
        },
        {
          id: 'postgresql-fullstack',
          technologySlug: 'postgresql',
          name: 'PostgreSQL',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 35,
          dependencies: [],
          optional: false,
          skipIf: ['postgresql', 'postgres'],
          honestNote: "Industry-standard database. Pairs well with any backend.",
          fallbackScores: { jobsScore: 80, momentum: 7, jobCount: 5800 }
        },
        {
          id: 'git-fullstack',
          technologySlug: 'git',
          name: 'Git & GitHub',
          category: 'tool',
          difficulty: 'beginner',
          estimatedHours: 10,
          dependencies: [],
          optional: false,
          skipIf: ['git'],
          honestNote: "Version control is mandatory. Learn it early.",
          fallbackScores: { jobsScore: 75, momentum: 3, jobCount: 7000 }
        }
      ]
    },
    {
      number: 3,
      name: '🚀 Production-Ready',
      description: 'Deployment and DevOps are where full-stack devs shine',
      milestone: 'You can deploy and maintain full-stack apps',
      jobsUnlocked: '~3,200 mid-level full-stack jobs',
      nodes: [
        {
          id: 'apis-fullstack',
          name: 'REST API Design',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 25,
          dependencies: ['nextjs-fullstack'],
          optional: false,
          honestNote: "Connect your frontend to your backend. Master this.",
          fallbackScores: { jobsScore: 78, momentum: 4, jobCount: 6500 }
        },
        {
          id: 'auth-fullstack',
          name: 'Authentication & Authorization',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 30,
          dependencies: ['apis-fullstack'],
          optional: false,
          projectIdea: "Build a SaaS app with login and user management",
          honestNote: "Every real app needs auth. JWT, sessions, OAuth.",
          fallbackScores: { jobsScore: 70, momentum: 5, jobCount: 4200 }
        },
        {
          id: 'docker-fullstack',
          technologySlug: 'docker',
          name: 'Docker',
          category: 'tool',
          difficulty: 'intermediate',
          estimatedHours: 20,
          dependencies: [],
          optional: false,
          skipIf: ['docker'],
          priorityBoost: { 'get-first-job': 20, 'build-product': 20, 'future-proof': 25, 'level-up': 25, 'switch-specialty': 15 },
          honestNote: "Deploy anywhere. Essential for modern full-stack development.",
          fallbackScores: { jobsScore: 76, momentum: 10, jobCount: 4500 }
        },
        {
          id: 'testing-fullstack',
          name: 'Testing (Full-Stack)',
          category: 'tool',
          difficulty: 'intermediate',
          estimatedHours: 25,
          dependencies: ['nextjs-fullstack'],
          optional: false,
          skipIf: ['testing'],
          honestNote: "Test frontend, backend, and integration. Critical skill.",
          fallbackScores: { jobsScore: 65, momentum: 5, jobCount: 1200 }
        }
      ]
    },
    {
      number: 4,
      name: '🎯 Full-Stack Excellence',
      description: 'Your edge is understanding the ENTIRE product',
      milestone: 'You are a complete full-stack engineer',
      jobsUnlocked: '~5,000+ full-stack positions',
      nodes: [
        {
          id: 'cloud-fullstack',
          technologySlug: 'aws',
          name: 'Cloud Deployment (AWS/Vercel)',
          category: 'specialization',
          difficulty: 'intermediate',
          estimatedHours: 30,
          dependencies: ['docker-fullstack'],
          optional: true,
          skipIf: ['aws'],
          priorityBoost: { 'get-first-job': 25, 'build-product': 30, 'future-proof': 22, 'level-up': 28, 'switch-specialty': 18 },
          honestNote: "Deploy to the cloud. Vercel for Next.js, AWS for everything.",
          fallbackScores: { jobsScore: 82, momentum: 8, jobCount: 5200 }
        },
        {
          id: 'state-management-fullstack',
          name: 'Advanced State Management',
          category: 'specialization',
          difficulty: 'intermediate',
          estimatedHours: 20,
          dependencies: ['react-fullstack'],
          optional: true,
          skipIf: ['state-management'],
          honestNote: "Zustand, Redux, or React Query. Pick one and master it.",
          fallbackScores: { jobsScore: 60, momentum: 8, jobCount: 2800 }
        },
        {
          id: 'performance-fullstack',
          name: 'Full-Stack Performance',
          category: 'specialization',
          difficulty: 'advanced',
          estimatedHours: 25,
          dependencies: ['nextjs-fullstack'],
          optional: true,
          honestNote: "Optimize both frontend and backend. High-value skill.",
          fallbackScores: { jobsScore: 58, momentum: 9, jobCount: 1200 }
        },
        {
          id: 'realtime',
          name: 'Real-Time Features (WebSockets)',
          category: 'specialization',
          difficulty: 'advanced',
          estimatedHours: 25,
          dependencies: ['apis-fullstack'],
          optional: true,
          honestNote: "Chat, notifications, live updates. Makes apps feel magical.",
          fallbackScores: { jobsScore: 62, momentum: 11, jobCount: 1800 }
        }
      ]
    }
  ],
  milestones: [
    {
      afterPhase: 1,
      title: '🎉 Frontend Complete!',
      description: 'You can build beautiful, interactive user interfaces',
      celebration: 'confetti',
      jobImpact: 'You have frontend skills for full-stack work'
    },
    {
      afterPhase: 2,
      title: '🔥 Full-Stack Developer!',
      description: 'You can build complete applications end-to-end',
      celebration: 'fireworks',
      jobImpact: 'You qualify for ~1,500 full-stack positions'
    },
    {
      afterPhase: 3,
      title: '🚀 Production-Ready!',
      description: 'You can deploy and maintain real-world full-stack apps',
      celebration: 'rocket',
      jobImpact: 'You qualify for ~3,200 mid-level positions'
    },
    {
      afterPhase: 4,
      title: '⭐ Full-Stack Expert!',
      description: 'You understand the entire product from UI to database to cloud',
      celebration: 'star',
      jobImpact: 'You qualify for ~5,000+ positions including senior full-stack roles'
    }
  ]
}

/**
 * Mobile Developer Template
 * React Native path (most versatile)
 */
export const mobileTemplate: RoleTemplate = {
  id: 'mobile-developer',
  version: 1,
  role: 'Mobile Developer',
  description: 'Build iOS and Android apps with React Native',
  totalNodes: 14,
  minimumStartingPoint: undefined,
  estimatedMonths: {
    beginner: 7,
    intermediate: 5,
    advanced: 3,
  },
  phases: [
    {
      number: 1,
      name: '🏗️ Mobile Foundations',
      description: 'JavaScript and React basics for mobile',
      milestone: 'You can build basic mobile UIs',
      nodes: [
        { id: 'javascript-mobile', technologySlug: 'javascript', name: 'JavaScript', category: 'foundation', difficulty: 'beginner', estimatedHours: 50, dependencies: [], optional: false, skipIf: ['javascript'], honestNote: "Essential for React Native.", fallbackScores: { jobsScore: 88, momentum: 5, jobCount: 8500 } },
        { id: 'react-mobile', technologySlug: 'react', name: 'React', category: 'framework', difficulty: 'intermediate', estimatedHours: 40, dependencies: ['javascript-mobile'], optional: false, skipIf: ['react'], honestNote: "React Native is built on React. Learn this first.", fallbackScores: { jobsScore: 90, momentum: 8, jobCount: 9500 } },
        { id: 'react-native', technologySlug: 'react-native', name: 'React Native', category: 'framework', difficulty: 'intermediate', estimatedHours: 50, dependencies: ['react-mobile'], optional: false, honestNote: "Write once, run on iOS and Android.", fallbackScores: { jobsScore: 75, momentum: 6, jobCount: 4200 } },
      ]
    },
    {
      number: 2,
      name: '⚡ Mobile Core',
      description: 'Navigation, state, and native APIs',
      milestone: 'You can build functional mobile apps',
      jobsUnlocked: '~1,000 mobile developer jobs',
      nodes: [
        { id: 'navigation', name: 'Navigation (React Navigation)', category: 'core', difficulty: 'intermediate', estimatedHours: 15, dependencies: ['react-native'], optional: false, honestNote: "Every app needs navigation.", fallbackScores: { jobsScore: 70, momentum: 5, jobCount: 3500 } },
        { id: 'state-mobile', name: 'State Management', category: 'core', difficulty: 'intermediate', estimatedHours: 20, dependencies: ['react-native'], optional: false, honestNote: "Redux or Zustand for mobile apps.", fallbackScores: { jobsScore: 65, momentum: 7, jobCount: 2800 } },
        { id: 'apis-mobile', name: 'API Integration', category: 'core', difficulty: 'intermediate', estimatedHours: 20, dependencies: ['react-native'], optional: false, honestNote: "Connect to backends with fetch or axios.", fallbackScores: { jobsScore: 75, momentum: 4, jobCount: 5000 } },
      ]
    },
    {
      number: 3,
      name: '🚀 Production Mobile',
      description: 'Deployment and platform features',
      milestone: 'You can deploy to App Store and Play Store',
      jobsUnlocked: '~2,200 mid-level mobile jobs',
      nodes: [
        { id: 'native-modules', name: 'Native Modules', category: 'advanced', difficulty: 'advanced', estimatedHours: 25, dependencies: ['react-native'], optional: false, honestNote: "Bridge to native iOS and Android code.", fallbackScores: { jobsScore: 68, momentum: 6, jobCount: 2100 } },
        { id: 'push-notifications', name: 'Push Notifications', category: 'tool', difficulty: 'intermediate', estimatedHours: 15, dependencies: ['react-native'], optional: false, honestNote: "Engage users with notifications.", fallbackScores: { jobsScore: 62, momentum: 5, jobCount: 1800 } },
        { id: 'app-deployment', name: 'App Store Deployment', category: 'tool', difficulty: 'intermediate', estimatedHours: 20, dependencies: ['react-native'], optional: false, honestNote: "Get your app in stores.", fallbackScores: { jobsScore: 60, momentum: 4, jobCount: 2500 } },
      ]
    },
    {
      number: 4,
      name: '🎯 Mobile Excellence',
      description: 'Performance and platform mastery',
      milestone: 'You build production-quality mobile apps',
      jobsUnlocked: '~3,500 mobile positions',
      nodes: [
        { id: 'performance-mobile', name: 'Mobile Performance', category: 'specialization', difficulty: 'advanced', estimatedHours: 20, dependencies: ['react-native'], optional: true, honestNote: "60fps or users notice.", fallbackScores: { jobsScore: 58, momentum: 7, jobCount: 1200 } },
        { id: 'offline-first', name: 'Offline-First Apps', category: 'specialization', difficulty: 'advanced', estimatedHours: 25, dependencies: ['apis-mobile'], optional: true, honestNote: "Critical for real-world mobile apps.", fallbackScores: { jobsScore: 55, momentum: 6, jobCount: 1000 } },
      ]
    }
  ],
  milestones: [
    { afterPhase: 1, title: '🎉 Mobile Foundations Complete!', description: 'You can build basic mobile UIs', celebration: 'confetti', jobImpact: 'You have mobile development basics' },
    { afterPhase: 2, title: '🔥 Mobile Developer!', description: 'You can build functional mobile apps', celebration: 'fireworks', jobImpact: 'You qualify for ~1,000 mobile positions' },
    { afterPhase: 3, title: '🚀 Production-Ready!', description: 'You can deploy apps to stores', celebration: 'rocket', jobImpact: 'You qualify for ~2,200 mobile positions' },
    { afterPhase: 4, title: '⭐ Mobile Expert!', description: 'You build production-quality apps', celebration: 'star', jobImpact: 'You qualify for ~3,500 mobile positions' }
  ]
}

/**
 * DevOps / Cloud Engineer Template
 */
export const devopsTemplate: RoleTemplate = {
  id: 'devops-engineer',
  version: 1,
  role: 'DevOps / Cloud Engineer',
  description: 'Build infrastructure, CI/CD, and cloud systems',
  totalNodes: 16,
  minimumStartingPoint: 'basics',
  estimatedMonths: {
    beginner: 10,
    intermediate: 7,
    advanced: 4,
  },
  phases: [
    {
      number: 1,
      name: '🏗️ Linux & Scripting',
      description: 'Foundation for DevOps',
      milestone: 'You can navigate and script in Linux',
      nodes: [
        { id: 'linux', name: 'Linux Fundamentals', category: 'foundation', difficulty: 'beginner', estimatedHours: 40, dependencies: [], optional: false, honestNote: "All servers run Linux. Master this.", fallbackScores: { jobsScore: 78, momentum: 4, jobCount: 6500 } },
        { id: 'bash', name: 'Bash Scripting', category: 'foundation', difficulty: 'beginner', estimatedHours: 25, dependencies: ['linux'], optional: false, honestNote: "Automate everything with scripts.", fallbackScores: { jobsScore: 72, momentum: 3, jobCount: 5200 } },
        { id: 'git-devops', technologySlug: 'git', name: 'Git', category: 'tool', difficulty: 'beginner', estimatedHours: 15, dependencies: [], optional: false, skipIf: ['git'], honestNote: "Version control for infrastructure code.", fallbackScores: { jobsScore: 75, momentum: 3, jobCount: 7000 } },
      ]
    },
    {
      number: 2,
      name: '⚡ Containers & Orchestration',
      description: 'Modern deployment',
      milestone: 'You can containerize and deploy applications',
      jobsUnlocked: '~1,500 DevOps jobs',
      nodes: [
        { id: 'docker-devops', technologySlug: 'docker', name: 'Docker', category: 'core', difficulty: 'intermediate', estimatedHours: 30, dependencies: ['linux'], optional: false, skipIf: ['docker'], priorityBoost: { 'get-first-job': 30, 'build-product': 20, 'future-proof': 25, 'level-up': 28, 'switch-specialty': 20 }, honestNote: "Containers are everywhere.", fallbackScores: { jobsScore: 82, momentum: 10, jobCount: 5200 } },
        { id: 'kubernetes', technologySlug: 'kubernetes', name: 'Kubernetes', category: 'core', difficulty: 'advanced', estimatedHours: 50, dependencies: ['docker-devops'], optional: false, priorityBoost: { 'get-first-job': 35, 'build-product': 15, 'future-proof': 30, 'level-up': 30, 'switch-specialty': 25 }, honestNote: "The standard for container orchestration.", fallbackScores: { jobsScore: 80, momentum: 12, jobCount: 4800 } },
        { id: 'ci-cd', name: 'CI/CD (GitHub Actions)', category: 'core', difficulty: 'intermediate', estimatedHours: 25, dependencies: ['git-devops'], optional: false, honestNote: "Automate builds and deployments.", fallbackScores: { jobsScore: 76, momentum: 8, jobCount: 4200 } },
      ]
    },
    {
      number: 3,
      name: '🚀 Cloud & IaC',
      description: 'Cloud platforms and automation',
      milestone: 'You can manage cloud infrastructure',
      jobsUnlocked: '~3,200 mid-level DevOps jobs',
      nodes: [
        { id: 'aws-devops', technologySlug: 'aws', name: 'AWS', category: 'core', difficulty: 'intermediate', estimatedHours: 45, dependencies: [], optional: false, skipIf: ['aws'], priorityBoost: { 'get-first-job': 35, 'build-product': 20, 'future-proof': 25, 'level-up': 32, 'switch-specialty': 25 }, honestNote: "70% of cloud jobs are AWS.", fallbackScores: { jobsScore: 85, momentum: 8, jobCount: 6200 } },
        { id: 'terraform-devops', technologySlug: 'terraform', name: 'Terraform', category: 'core', difficulty: 'intermediate', estimatedHours: 30, dependencies: ['aws-devops'], optional: false, priorityBoost: { 'get-first-job': 30, 'build-product': 15, 'future-proof': 28, 'level-up': 28, 'switch-specialty': 22 }, honestNote: "Infrastructure as Code standard.", fallbackScores: { jobsScore: 78, momentum: 11, jobCount: 3800 } },
        { id: 'monitoring', name: 'Monitoring (Prometheus/Grafana)', category: 'core', difficulty: 'intermediate', estimatedHours: 25, dependencies: ['kubernetes'], optional: false, honestNote: "Can't manage what you can't measure.", fallbackScores: { jobsScore: 72, momentum: 7, jobCount: 2800 } },
      ]
    },
    {
      number: 4,
      name: '🎯 DevOps Mastery',
      description: 'Security and advanced topics',
      milestone: 'You are a complete DevOps engineer',
      jobsUnlocked: '~5,000+ DevOps positions',
      nodes: [
        { id: 'security-devops', name: 'Security & Compliance', category: 'specialization', difficulty: 'advanced', estimatedHours: 30, dependencies: ['aws-devops'], optional: true, honestNote: "DevSecOps is critical.", fallbackScores: { jobsScore: 75, momentum: 9, jobCount: 2500 } },
        { id: 'observability', name: 'Observability', category: 'specialization', difficulty: 'advanced', estimatedHours: 25, dependencies: ['monitoring'], optional: true, honestNote: "Logs, metrics, traces - the full picture.", fallbackScores: { jobsScore: 70, momentum: 10, jobCount: 2000 } },
      ]
    }
  ],
  milestones: [
    { afterPhase: 1, title: '🎉 Linux Mastery!', description: 'You can work in Linux environments', celebration: 'confetti', jobImpact: 'You have DevOps foundations' },
    { afterPhase: 2, title: '🔥 Container Expert!', description: 'You can containerize and orchestrate apps', celebration: 'fireworks', jobImpact: 'You qualify for ~1,500 DevOps positions' },
    { afterPhase: 3, title: '🚀 Cloud Engineer!', description: 'You manage cloud infrastructure', celebration: 'rocket', jobImpact: 'You qualify for ~3,200 DevOps positions' },
    { afterPhase: 4, title: '⭐ DevOps Master!', description: 'Complete DevOps expertise', celebration: 'star', jobImpact: 'You qualify for ~5,000+ senior DevOps roles' }
  ]
}

/**
 * Data Engineer / Scientist Template
 */
export const dataEngineerTemplate: RoleTemplate = {
  id: 'data-engineer',
  version: 1,
  role: 'Data Engineer / Scientist',
  description: 'Build data pipelines, analytics, and ML systems',
  totalNodes: 15,
  minimumStartingPoint: 'basics',
  estimatedMonths: {
    beginner: 9,
    intermediate: 6,
    advanced: 4,
  },
  phases: [
    {
      number: 1,
      name: '🏗️ Python & SQL',
      description: 'Data engineering foundations',
      milestone: 'You can query and manipulate data',
      nodes: [
        { id: 'python-data', technologySlug: 'python', name: 'Python', category: 'foundation', difficulty: 'beginner', estimatedHours: 50, dependencies: [], optional: false, skipIf: ['python'], honestNote: "The language of data.", fallbackScores: { jobsScore: 90, momentum: 6, jobCount: 8200 } },
        { id: 'sql', technologySlug: 'postgresql', name: 'SQL', category: 'foundation', difficulty: 'beginner', estimatedHours: 40, dependencies: [], optional: false, honestNote: "Every data job needs SQL.", fallbackScores: { jobsScore: 88, momentum: 4, jobCount: 7500 } },
        { id: 'pandas', name: 'Pandas & NumPy', category: 'core', difficulty: 'intermediate', estimatedHours: 30, dependencies: ['python-data'], optional: false, honestNote: "Data manipulation in Python.", fallbackScores: { jobsScore: 82, momentum: 5, jobCount: 5800 } },
      ]
    },
    {
      number: 2,
      name: '⚡ Data Pipelines',
      description: 'ETL and data engineering',
      milestone: 'You can build data pipelines',
      jobsUnlocked: '~1,800 data engineer jobs',
      nodes: [
        { id: 'etl', name: 'ETL (Apache Airflow)', category: 'core', difficulty: 'intermediate', estimatedHours: 35, dependencies: ['python-data'], optional: false, honestNote: "Orchestrate data workflows.", fallbackScores: { jobsScore: 78, momentum: 8, jobCount: 4200 } },
        { id: 'spark', name: 'Apache Spark', category: 'core', difficulty: 'intermediate', estimatedHours: 40, dependencies: ['pandas'], optional: false, honestNote: "Big data processing standard.", fallbackScores: { jobsScore: 76, momentum: 6, jobCount: 3800 } },
        { id: 'data-warehouse', name: 'Data Warehousing', category: 'core', difficulty: 'intermediate', estimatedHours: 30, dependencies: ['sql'], optional: false, honestNote: "Snowflake, BigQuery, or Redshift.", fallbackScores: { jobsScore: 80, momentum: 9, jobCount: 4500 } },
      ]
    },
    {
      number: 3,
      name: '🚀 Analytics & ML',
      description: 'Turn data into insights',
      milestone: 'You can do analytics and basic ML',
      jobsUnlocked: '~3,500 data positions',
      nodes: [
        { id: 'visualization', name: 'Data Visualization', category: 'tool', difficulty: 'intermediate', estimatedHours: 25, dependencies: ['pandas'], optional: false, honestNote: "Tableau, PowerBI, or Matplotlib.", fallbackScores: { jobsScore: 75, momentum: 5, jobCount: 3200 } },
        { id: 'ml-basics', name: 'Machine Learning Basics', category: 'core', difficulty: 'intermediate', estimatedHours: 50, dependencies: ['pandas'], optional: false, honestNote: "Scikit-learn fundamentals.", fallbackScores: { jobsScore: 85, momentum: 12, jobCount: 5200 } },
        { id: 'cloud-data', technologySlug: 'aws', name: 'Cloud Data Platforms', category: 'tool', difficulty: 'intermediate', estimatedHours: 30, dependencies: ['data-warehouse'], optional: false, skipIf: ['aws'], honestNote: "AWS, GCP, or Azure for data.", fallbackScores: { jobsScore: 82, momentum: 8, jobCount: 4800 } },
      ]
    },
    {
      number: 4,
      name: '🎯 Advanced Data',
      description: 'Specialize in your area',
      milestone: 'You are a complete data professional',
      jobsUnlocked: '~5,500+ data positions',
      nodes: [
        { id: 'streaming', name: 'Real-Time Streaming', category: 'specialization', difficulty: 'advanced', estimatedHours: 35, dependencies: ['spark'], optional: true, honestNote: "Kafka for real-time data.", fallbackScores: { jobsScore: 78, momentum: 10, jobCount: 2800 } },
        { id: 'deep-learning', name: 'Deep Learning', category: 'specialization', difficulty: 'advanced', estimatedHours: 60, dependencies: ['ml-basics'], optional: true, honestNote: "PyTorch or TensorFlow for neural networks.", fallbackScores: { jobsScore: 88, momentum: 15, jobCount: 4200 } },
      ]
    }
  ],
  milestones: [
    { afterPhase: 1, title: '🎉 Data Foundations!', description: 'You can work with data', celebration: 'confetti', jobImpact: 'You have data basics' },
    { afterPhase: 2, title: '🔥 Data Engineer!', description: 'You can build data pipelines', celebration: 'fireworks', jobImpact: 'You qualify for ~1,800 data positions' },
    { afterPhase: 3, title: '🚀 Data Scientist!', description: 'You do analytics and ML', celebration: 'rocket', jobImpact: 'You qualify for ~3,500 data positions' },
    { afterPhase: 4, title: '⭐ Data Expert!', description: 'Advanced data expertise', celebration: 'star', jobImpact: 'You qualify for ~5,500+ data positions' }
  ]
}

/**
 * AI/ML Engineer Template
 */
export const aiMlTemplate: RoleTemplate = {
  id: 'ai-ml-engineer',
  version: 1,
  role: 'AI/ML Engineer',
  description: 'Build AI systems, LLMs, and ML products',
  totalNodes: 14,
  minimumStartingPoint: 'one-language',
  estimatedMonths: {
    beginner: 12,
    intermediate: 8,
    advanced: 5,
  },
  phases: [
    {
      number: 1,
      name: '🏗️ Python & Math',
      description: 'AI/ML foundations',
      milestone: 'You understand ML fundamentals',
      nodes: [
        { id: 'python-ai', technologySlug: 'python', name: 'Python', category: 'foundation', difficulty: 'beginner', estimatedHours: 40, dependencies: [], optional: false, skipIf: ['python'], honestNote: "The AI language.", fallbackScores: { jobsScore: 90, momentum: 6, jobCount: 8200 } },
        { id: 'math-ml', name: 'Math for ML', category: 'foundation', difficulty: 'intermediate', estimatedHours: 50, dependencies: [], optional: false, honestNote: "Linear algebra, calculus, probability.", fallbackScores: { jobsScore: 75, momentum: 4, jobCount: 3500 } },
        { id: 'numpy-ai', name: 'NumPy & Pandas', category: 'core', difficulty: 'beginner', estimatedHours: 25, dependencies: ['python-ai'], optional: false, honestNote: "Data manipulation for ML.", fallbackScores: { jobsScore: 82, momentum: 5, jobCount: 5800 } },
      ]
    },
    {
      number: 2,
      name: '⚡ Classical ML',
      description: 'Traditional machine learning',
      milestone: 'You can build ML models',
      jobsUnlocked: '~2,000 ML engineer jobs',
      nodes: [
        { id: 'scikit-learn', name: 'Scikit-Learn', category: 'core', difficulty: 'intermediate', estimatedHours: 45, dependencies: ['numpy-ai', 'math-ml'], optional: false, honestNote: "Classical ML algorithms.", fallbackScores: { jobsScore: 80, momentum: 7, jobCount: 4500 } },
        { id: 'ml-ops', name: 'MLOps Basics', category: 'core', difficulty: 'intermediate', estimatedHours: 30, dependencies: ['scikit-learn'], optional: false, honestNote: "Deploy and monitor ML models.", fallbackScores: { jobsScore: 78, momentum: 12, jobCount: 3200 } },
      ]
    },
    {
      number: 3,
      name: '🚀 Deep Learning & LLMs',
      description: 'Modern AI',
      milestone: 'You can build neural networks and use LLMs',
      jobsUnlocked: '~4,200 AI engineer jobs',
      nodes: [
        { id: 'pytorch', name: 'PyTorch', category: 'framework', difficulty: 'advanced', estimatedHours: 60, dependencies: ['scikit-learn'], optional: false, honestNote: "Deep learning framework of choice.", fallbackScores: { jobsScore: 88, momentum: 18, jobCount: 5500 } },
        { id: 'llms', name: 'LLMs & Transformers', category: 'core', difficulty: 'advanced', estimatedHours: 50, dependencies: ['pytorch'], optional: false, priorityBoost: { 'get-first-job': 40, 'build-product': 35, 'future-proof': 40, 'level-up': 38, 'switch-specialty': 30 }, honestNote: "GPT, BERT, and the AI revolution.", fallbackScores: { jobsScore: 92, momentum: 25, jobCount: 6200 } },
        { id: 'rag', name: 'RAG & Vector DBs', category: 'core', difficulty: 'advanced', estimatedHours: 30, dependencies: ['llms'], optional: false, priorityBoost: { 'get-first-job': 35, 'build-product': 40, 'future-proof': 38, 'level-up': 35, 'switch-specialty': 28 }, honestNote: "Build AI apps with retrieval.", fallbackScores: { jobsScore: 90, momentum: 30, jobCount: 4800 } },
      ]
    },
    {
      number: 4,
      name: '🎯 Production AI',
      description: 'Ship AI to production',
      milestone: 'You build production AI systems',
      jobsUnlocked: '~6,000+ AI/ML positions',
      nodes: [
        { id: 'fine-tuning', name: 'LLM Fine-Tuning', category: 'specialization', difficulty: 'advanced', estimatedHours: 40, dependencies: ['llms'], optional: true, priorityBoost: { 'get-first-job': 30, 'build-product': 35, 'future-proof': 35, 'level-up': 32, 'switch-specialty': 25 }, honestNote: "Custom models for your domain.", fallbackScores: { jobsScore: 88, momentum: 28, jobCount: 3500 } },
        { id: 'ai-safety', name: 'AI Safety & Ethics', category: 'specialization', difficulty: 'advanced', estimatedHours: 25, dependencies: ['llms'], optional: true, honestNote: "Responsible AI development.", fallbackScores: { jobsScore: 75, momentum: 20, jobCount: 2000 } },
      ]
    }
  ],
  milestones: [
    { afterPhase: 1, title: '🎉 ML Foundations!', description: 'You understand ML fundamentals', celebration: 'confetti', jobImpact: 'You have AI/ML basics' },
    { afterPhase: 2, title: '🔥 ML Engineer!', description: 'You can build ML models', celebration: 'fireworks', jobImpact: 'You qualify for ~2,000 ML positions' },
    { afterPhase: 3, title: '🚀 AI Engineer!', description: 'You build with LLMs and deep learning', celebration: 'rocket', jobImpact: 'You qualify for ~4,200 AI positions' },
    { afterPhase: 4, title: '⭐ AI Expert!', description: 'Production AI mastery', celebration: 'star', jobImpact: 'You qualify for ~6,000+ AI/ML positions' }
  ]
}

/**
 * Blockchain Developer Template
 * Web3 → Solidity → DApp path
 */
export const blockchainTemplate: RoleTemplate = {
  id: 'blockchain-developer',
  version: 1,
  role: 'Blockchain Developer',
  description: 'Build decentralized applications and smart contracts',
  totalNodes: 16,
  minimumStartingPoint: 'basics',  // Requires programming basics
  estimatedMonths: {
    beginner: 8,      // 8 months for beginners
    intermediate: 5,  // 5 months if you know JS/web dev
    advanced: 3,      // 3 months for experienced devs
  },
  phases: [
    {
      number: 1,
      name: '🔗 Blockchain Fundamentals',
      description: 'Understand how blockchain works before building',
      milestone: 'You understand blockchain technology',
      nodes: [
        {
          id: 'blockchain-basics',
          name: 'Blockchain Basics',
          category: 'foundation',
          difficulty: 'beginner',
          estimatedHours: 20,
          dependencies: [],
          optional: false,
          milestone: 'Understand blocks, chains, consensus',
          projectIdea: 'Build a simple blockchain in JavaScript',
          honestNote: "Don't skip this. You can't build on blockchain if you don't understand it.",
          fallbackScores: {
            jobsScore: 65,
            momentum: 15,
            jobCount: 1200,
          }
        },
        {
          id: 'cryptography',
          name: 'Cryptography Basics',
          category: 'foundation',
          difficulty: 'intermediate',
          estimatedHours: 15,
          dependencies: ['blockchain-basics'],
          optional: false,
          milestone: 'Understand hashing, signatures, encryption',
          projectIdea: 'Implement SHA-256 and digital signatures',
          honestNote: "Security is EVERYTHING in Web3. Weak crypto = hacks = your career over.",
          fallbackScores: {
            jobsScore: 68,
            momentum: 12,
            jobCount: 1100,
          }
        },
        {
          id: 'javascript-web3',
          technologySlug: 'javascript',
          name: 'JavaScript',
          category: 'foundation',
          difficulty: 'beginner',
          estimatedHours: 40,
          dependencies: [],
          optional: false,
          milestone: 'Can build web interfaces for dApps',
          projectIdea: 'Build a Web3 wallet interface',
          honestNote: "Most Web3 apps have web frontends. JavaScript is mandatory.",
          fallbackScores: {
            jobsScore: 88,
            momentum: 5,
            jobCount: 8500,
          }
        }
      ]
    },
    {
      number: 2,
      name: '⚡ Smart Contracts',
      description: 'Write code that runs on the blockchain',
      milestone: 'You can write and deploy smart contracts',
      jobsUnlocked: '~600 junior blockchain jobs',
      nodes: [
        {
          id: 'solidity',
          technologySlug: 'solidity',
          name: 'Solidity',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 50,
          dependencies: ['blockchain-basics', 'javascript-web3'],
          optional: false,
          milestone: 'Can write Ethereum smart contracts',
          projectIdea: 'Build an ERC-20 token contract',
          honestNote: "The #1 language for Ethereum and EVM chains. Non-negotiable for Web3.",
          priorityBoost: { 'get-first-job': 30, 'build-product': 25, 'future-proof': 20, 'level-up': 15, 'switch-specialty': 20 },
          fallbackScores: {
            jobsScore: 85,
            momentum: 18,
            jobCount: 2400,
          }
        },
        {
          id: 'hardhat',
          name: 'Hardhat / Foundry',
          category: 'tool',
          difficulty: 'intermediate',
          estimatedHours: 20,
          dependencies: ['solidity'],
          optional: false,
          milestone: 'Can test and deploy smart contracts',
          projectIdea: 'Write tests for your ERC-20 token',
          honestNote: "Hardhat is the industry standard. Foundry is gaining traction for testing.",
          fallbackScores: {
            jobsScore: 75,
            momentum: 16,
            jobCount: 1800,
          }
        },
        {
          id: 'ethereum',
          technologySlug: 'ethereum',
          name: 'Ethereum',
          category: 'core',
          difficulty: 'intermediate',
          estimatedHours: 30,
          dependencies: ['solidity', 'hardhat'],
          optional: false,
          milestone: 'Understand Ethereum architecture',
          projectIdea: 'Deploy contract to testnet',
          honestNote: "The most mature smart contract platform. Learn this before other chains.",
          fallbackScores: {
            jobsScore: 82,
            momentum: 14,
            jobCount: 2200,
          }
        },
        {
          id: 'web3js',
          name: 'Web3.js / Ethers.js',
          category: 'tool',
          difficulty: 'intermediate',
          estimatedHours: 25,
          dependencies: ['ethereum', 'javascript-web3'],
          optional: false,
          milestone: 'Can connect frontend to blockchain',
          projectIdea: 'Build a dApp frontend that interacts with your contract',
          honestNote: "Ethers.js is more popular in 2026. Both are good to know.",
          fallbackScores: {
            jobsScore: 78,
            momentum: 13,
            jobCount: 1900,
          }
        }
      ]
    },
    {
      number: 3,
      name: '🚀 DApp Development',
      description: 'Build full decentralized applications',
      milestone: 'You can build production dApps',
      jobsUnlocked: '~1,400 blockchain positions',
      nodes: [
        {
          id: 'react-web3',
          technologySlug: 'react',
          name: 'React',
          category: 'framework',
          difficulty: 'intermediate',
          estimatedHours: 35,
          dependencies: ['javascript-web3'],
          optional: false,
          milestone: 'Can build modern Web3 UIs',
          projectIdea: 'Build a DeFi dashboard',
          honestNote: "Most Web3 projects use React for frontend. Next.js is popular too.",
          fallbackScores: {
            jobsScore: 92,
            momentum: 8,
            jobCount: 9200,
          }
        },
        {
          id: 'ipfs',
          name: 'IPFS',
          category: 'tool',
          difficulty: 'intermediate',
          estimatedHours: 15,
          dependencies: [],
          optional: true,
          milestone: 'Can store files on decentralized storage',
          projectIdea: 'Build an NFT marketplace with IPFS storage',
          honestNote: "Essential for NFTs and decentralized storage. Not needed for all dApps.",
          fallbackScores: {
            jobsScore: 68,
            momentum: 11,
            jobCount: 1200,
          }
        },
        {
          id: 'nft-standards',
          name: 'NFT Standards (ERC-721, ERC-1155)',
          category: 'advanced',
          difficulty: 'intermediate',
          estimatedHours: 20,
          dependencies: ['solidity', 'ipfs'],
          optional: false,
          milestone: 'Can build NFT projects',
          projectIdea: 'Build a generative NFT collection',
          honestNote: "NFTs are controversial but the market is huge. Good career opportunity.",
          priorityBoost: { 'get-first-job': 15, 'build-product': 25, 'future-proof': 10, 'level-up': 10, 'switch-specialty': 15 },
          fallbackScores: {
            jobsScore: 72,
            momentum: 10,
            jobCount: 1600,
          }
        },
        {
          id: 'defi-basics',
          name: 'DeFi Basics',
          category: 'advanced',
          difficulty: 'advanced',
          estimatedHours: 30,
          dependencies: ['solidity', 'ethereum'],
          optional: false,
          milestone: 'Understand decentralized finance',
          projectIdea: 'Build a simple DEX or lending protocol',
          honestNote: "DeFi is where the money is. Learn AMMs, lending, yield farming.",
          priorityBoost: { 'get-first-job': 25, 'future-proof': 20, 'build-product': 20, 'level-up': 15, 'switch-specialty': 20 },
          fallbackScores: {
            jobsScore: 80,
            momentum: 17,
            jobCount: 2000,
          }
        }
      ]
    },
    {
      number: 4,
      name: '⭐ Advanced & Specialization',
      description: 'Production-ready blockchain development',
      milestone: 'You are a professional blockchain developer',
      jobsUnlocked: '~2,200+ blockchain positions',
      nodes: [
        {
          id: 'security',
          name: 'Smart Contract Security',
          category: 'advanced',
          difficulty: 'advanced',
          estimatedHours: 40,
          dependencies: ['solidity', 'defi-basics'],
          optional: false,
          milestone: 'Can audit smart contracts for vulnerabilities',
          projectIdea: 'Audit a real DeFi contract, find vulnerabilities',
          honestNote: "Security is the #1 skill. Hacks cost billions. Auditors are paid VERY well.",
          priorityBoost: { 'get-first-job': 30, 'future-proof': 25, 'level-up': 20, 'build-product': 15, 'switch-specialty': 25 },
          fallbackScores: {
            jobsScore: 88,
            momentum: 20,
            jobCount: 1500,
          }
        },
        {
          id: 'layer2',
          name: 'Layer 2 Solutions',
          category: 'advanced',
          difficulty: 'advanced',
          estimatedHours: 25,
          dependencies: ['ethereum'],
          optional: true,
          milestone: 'Understand scaling solutions',
          projectIdea: 'Deploy contracts to Arbitrum or Optimism',
          honestNote: "L2s are the future of Ethereum. Polygon, Arbitrum, Optimism are hot.",
          fallbackScores: {
            jobsScore: 76,
            momentum: 22,
            jobCount: 1300,
          }
        },
        {
          id: 'multichain',
          name: 'Multi-chain Development',
          category: 'specialization',
          difficulty: 'advanced',
          estimatedHours: 30,
          dependencies: ['ethereum', 'solidity'],
          optional: true,
          milestone: 'Can build on multiple blockchains',
          projectIdea: 'Build a cross-chain bridge or deploy to BSC, Polygon',
          honestNote: "Solana, Cardano, Polkadot all have jobs. But Ethereum skills transfer.",
          fallbackScores: {
            jobsScore: 74,
            momentum: 14,
            jobCount: 1400,
          }
        },
        {
          id: 'tokenomics',
          name: 'Tokenomics & DAOs',
          category: 'specialization',
          difficulty: 'advanced',
          estimatedHours: 20,
          dependencies: ['defi-basics'],
          optional: true,
          milestone: 'Understand token economics and governance',
          projectIdea: 'Design tokenomics for a DAO or protocol',
          honestNote: "Not purely technical, but knowing economics makes you 10x more valuable.",
          fallbackScores: {
            jobsScore: 70,
            momentum: 12,
            jobCount: 1100,
          }
        }
      ]
    }
  ],
  milestones: [
    { afterPhase: 1, title: '🎉 Blockchain Fundamentals!', description: 'You understand how blockchain works', celebration: 'confetti', jobImpact: 'You have blockchain knowledge' },
    { afterPhase: 2, title: '🔥 Smart Contract Dev!', description: 'You can write and deploy smart contracts', celebration: 'fireworks', jobImpact: 'You qualify for ~600 blockchain positions' },
    { afterPhase: 3, title: '🚀 DApp Developer!', description: 'You build full decentralized applications', celebration: 'rocket', jobImpact: 'You qualify for ~1,400 blockchain positions' },
    { afterPhase: 4, title: '⭐ Blockchain Expert!', description: 'Production-ready Web3 developer', celebration: 'star', jobImpact: 'You qualify for ~2,200+ blockchain positions' }
  ]
}

/**
 * Template registry - maps role IDs to templates
 */
export const ROLE_TEMPLATES: Record<string, RoleTemplate> = {
  'frontend-developer': frontendTemplate,
  'backend-developer': backendTemplate,
  'fullstack-developer': fullstackTemplate,
  'mobile-developer': mobileTemplate,
  'devops-engineer': devopsTemplate,
  'data-engineer': dataEngineerTemplate,
  'ai-ml-engineer': aiMlTemplate,
  'blockchain-developer': blockchainTemplate,
}

/**
 * Get template by role ID
 */
export function getTemplateByRole(roleId: string): RoleTemplate | null {
  return ROLE_TEMPLATES[roleId] ?? null
}

/**
 * Get all available templates
 */
export function getAllTemplates(): RoleTemplate[] {
  return Object.values(ROLE_TEMPLATES)
}
