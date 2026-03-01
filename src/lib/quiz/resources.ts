/**
 * Curated learning resources for top technologies.
 * Single source of truth — no live API calls needed.
 */

/** Type of YouTube video — used for intelligent selection based on context */
export type YouTubeVideoType = 'intro' | 'crash-course' | 'full-tutorial' | 'project-based' | 'comparison'

export interface YouTubeVideoEntry {
  videoId: string
  title: string
  channel: string
  durationMinutes: number
  type: YouTubeVideoType
}

export interface TechResources {
  /** Primary (quick) video — kept for backwards compatibility */
  youtube?: {
    videoId: string
    title: string
    channel: string
    durationMinutes: number
  }
  /** Multiple curated videos of varying depth and style */
  youtubeVideos?: YouTubeVideoEntry[]
  docsUrl?: string
  /** A concrete weekend project idea — shown in the Project card instead of CLI code */
  projectIdea?: string
  /** Rough time estimate — e.g. "~1 weekend", "~4 hours", "~2-3 hours" */
  projectDuration?: string
  companions: Array<{
    slug: string
    coOccurrencePercent: number
  }>
  primaryLearnResource?: string
}

export const TECH_RESOURCES: Record<string, TechResources> = {
  react: {
    youtube: { videoId: 'SqcY0GlETPk', title: 'React in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'SqcY0GlETPk', title: 'React in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'LDB4uaJ87e0', title: 'React Crash Course', channel: 'Traversy Media', durationMinutes: 68, type: 'crash-course' },
      { videoId: 'C_rrNAyqg3o', title: 'Learn React JS – Full Beginner\'s Tutorial', channel: 'freeCodeCamp', durationMinutes: 120, type: 'full-tutorial' },
    ],
    docsUrl: 'https://react.dev/learn',
    projectIdea: 'Build a real-time kanban board with drag-and-drop columns',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 89 },
      { slug: 'tailwind-css', coOccurrencePercent: 72 },
      { slug: 'nextjs', coOccurrencePercent: 68 },
    ],
    primaryLearnResource: 'react.dev/learn',
  },
  typescript: {
    youtube: { videoId: 'zQnBQ4tB3ZA', title: 'TypeScript in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'zQnBQ4tB3ZA', title: 'TypeScript in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: '30LWjhZzg50', title: 'Learn TypeScript – Full Tutorial', channel: 'freeCodeCamp', durationMinutes: 185, type: 'crash-course' },
      { videoId: 'BwuLxPH8IDs', title: 'TypeScript Course for Beginners', channel: 'Academind', durationMinutes: 195, type: 'full-tutorial' },
    ],
    docsUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    projectIdea: 'Migrate a plain JS project to TypeScript with strict mode — then see what breaks',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'react', coOccurrencePercent: 85 },
      { slug: 'nodejs', coOccurrencePercent: 78 },
      { slug: 'prisma', coOccurrencePercent: 64 },
    ],
    primaryLearnResource: 'TypeScript Handbook',
  },
  nextjs: {
    youtube: { videoId: '__mSgDEOyv8', title: 'Next.js in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: '__mSgDEOyv8', title: 'Next.js in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'wm5gMKuwSYk', title: 'Next.js Full Course – Build & Deploy a Full Stack App', channel: 'JavaScript Mastery', durationMinutes: 300, type: 'full-tutorial' },
      { videoId: 'I1V9YWqRIeI', title: 'Next.js Full Course 2024', channel: 'JavaScript Mastery', durationMinutes: 300, type: 'crash-course' },
    ],
    docsUrl: 'https://nextjs.org/docs/getting-started/installation',
    projectIdea: 'Build a personal blog with MDX articles, dark mode, and OG image generation',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'react', coOccurrencePercent: 98 },
      { slug: 'typescript', coOccurrencePercent: 87 },
      { slug: 'tailwind-css', coOccurrencePercent: 76 },
    ],
    primaryLearnResource: 'nextjs.org/docs',
  },
  vue: {
    youtube: { videoId: 'nhBVL41-_Cw', title: 'Vue in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'nhBVL41-_Cw', title: 'Vue in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'VeNfHj6MhgA', title: 'Vue.js Crash Course', channel: 'Traversy Media', durationMinutes: 68, type: 'crash-course' },
      { videoId: 'e-E0UB-YDRk', title: 'Vue.js Full Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 174, type: 'full-tutorial' },
    ],
    docsUrl: 'https://vuejs.org/guide/quick-start.html',
    projectIdea: 'Build a notes app with local storage persistence and tag filtering',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 71 },
      { slug: 'vite', coOccurrencePercent: 88 },
      { slug: 'nuxt', coOccurrencePercent: 55 },
    ],
    primaryLearnResource: 'vuejs.org/guide',
  },
  angular: {
    youtube: { videoId: 'Ata9cSC2WpM', title: 'Angular in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'Ata9cSC2WpM', title: 'Angular in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: '3dHNOWTI7H8', title: 'Angular Crash Course', channel: 'Traversy Media', durationMinutes: 122, type: 'crash-course' },
      { videoId: 'k5E2AVpwsko', title: 'Angular Tutorial for Beginners', channel: 'Programming with Mosh', durationMinutes: 120, type: 'full-tutorial' },
    ],
    docsUrl: 'https://angular.dev/tutorials/learn-angular',
    projectIdea: 'Build an employee directory with live search, filters, and a detail modal',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 99 },
      { slug: 'rxjs', coOccurrencePercent: 82 },
      { slug: 'nodejs', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: 'angular.dev/tutorials',
  },
  svelte: {
    youtube: { videoId: 'rv3Yq-B8qp4', title: 'Svelte in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'rv3Yq-B8qp4', title: 'Svelte in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'jO_BVyzdx0s', title: 'Svelte Crash Course', channel: 'Traversy Media', durationMinutes: 76, type: 'crash-course' },
      { videoId: 'ujbE0mzX-CU', title: 'Svelte Tutorial for Beginners', channel: 'Net Ninja', durationMinutes: 85, type: 'full-tutorial' },
    ],
    docsUrl: 'https://learn.svelte.dev',
    projectIdea: 'Build a pomodoro timer with smooth animations and session history',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 68 },
      { slug: 'vite', coOccurrencePercent: 79 },
      { slug: 'tailwind-css', coOccurrencePercent: 61 },
    ],
    primaryLearnResource: 'learn.svelte.dev',
  },
  nodejs: {
    youtube: { videoId: 'ENrzD9HAZK4', title: 'Node.js in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'ENrzD9HAZK4', title: 'Node.js in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'fBNz5xF-Kx4', title: 'Node.js Crash Course', channel: 'Traversy Media', durationMinutes: 88, type: 'crash-course' },
      { videoId: 'Oe421EPjeBE', title: 'Node.js and Express.js – Full Course', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
    projectIdea: 'Build a REST API with file uploads, rate limiting, and webhook support',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'express', coOccurrencePercent: 74 },
      { slug: 'typescript', coOccurrencePercent: 69 },
      { slug: 'postgresql', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: 'nodejs.org/en/learn',
  },
  express: {
    youtube: { videoId: 'SccSCuHhOw0', title: 'Express.js in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'SccSCuHhOw0', title: 'Express.js in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'CnH3kAXSrmU', title: 'Express Crash Course', channel: 'Traversy Media', durationMinutes: 55, type: 'crash-course' },
      { videoId: 'Oe421EPjeBE', title: 'Node.js and Express.js – Full Course', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://expressjs.com/en/starter/hello-world.html',
    projectIdea: 'Build a URL shortener with click analytics and custom aliases',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'nodejs', coOccurrencePercent: 97 },
      { slug: 'mongodb', coOccurrencePercent: 62 },
      { slug: 'typescript', coOccurrencePercent: 57 },
    ],
    primaryLearnResource: 'expressjs.com/starter',
  },
  fastapi: {
    youtube: { videoId: 'iWS9ogMPOI0', title: 'FastAPI in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'iWS9ogMPOI0', title: 'FastAPI in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'SORiTsvnU7I', title: 'FastAPI Crash Course', channel: 'Traversy Media', durationMinutes: 98, type: 'crash-course' },
      { videoId: 'Py93N0wUfmk', title: 'FastAPI for Beginners Full Course', channel: 'freeCodeCamp', durationMinutes: 186, type: 'full-tutorial' },
    ],
    docsUrl: 'https://fastapi.tiangolo.com/tutorial/',
    projectIdea: 'Build a sentiment analysis API with Redis caching and auto-generated Swagger docs',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'python', coOccurrencePercent: 99 },
      { slug: 'postgresql', coOccurrencePercent: 64 },
      { slug: 'docker', coOccurrencePercent: 71 },
    ],
    primaryLearnResource: 'fastapi.tiangolo.com/tutorial',
  },
  django: {
    youtube: { videoId: 'rHux0gMZ3Eg', title: 'Django in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'rHux0gMZ3Eg', title: 'Django in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'PtQiiknWUcI', title: 'Python Django 7 Hour Course', channel: 'Dennis Ivy', durationMinutes: 420, type: 'full-tutorial' },
      { videoId: 'F5mRW0jo-U4', title: 'Python Django Web Framework – Full Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 220, type: 'crash-course' },
    ],
    docsUrl: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/',
    projectIdea: 'Build a job board with user authentication, posting, and search',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'python', coOccurrencePercent: 99 },
      { slug: 'postgresql', coOccurrencePercent: 76 },
      { slug: 'docker', coOccurrencePercent: 63 },
    ],
    primaryLearnResource: 'Django official tutorial',
  },
  postgresql: {
    youtube: { videoId: 'n2Fluyr3lbc', title: 'SQL in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'n2Fluyr3lbc', title: 'SQL in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'SpfIwlAYaKk', title: 'PostgreSQL Tutorial for Beginners', channel: 'Amigoscode', durationMinutes: 135, type: 'crash-course' },
      { videoId: '85pG_pDkITY', title: 'PostgreSQL Tutorial Full Course 2022', channel: 'Derek Banas', durationMinutes: 210, type: 'full-tutorial' },
    ],
    docsUrl: 'https://www.postgresql.org/docs/current/tutorial-start.html',
    projectIdea: 'Design a social network schema and implement full-text search across posts',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'prisma', coOccurrencePercent: 68 },
      { slug: 'docker', coOccurrencePercent: 72 },
      { slug: 'nodejs', coOccurrencePercent: 61 },
    ],
    primaryLearnResource: 'PostgreSQL tutorial',
  },
  mongodb: {
    youtube: { videoId: '-bt_y4Loofg', title: 'MongoDB in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: '-bt_y4Loofg', title: 'MongoDB in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: '-56x56UppqQ', title: 'MongoDB Crash Course', channel: 'Traversy Media', durationMinutes: 37, type: 'crash-course' },
      { videoId: 'ofme2o29ngU', title: 'MongoDB Crash Course', channel: 'Web Dev Simplified', durationMinutes: 30, type: 'crash-course' },
    ],
    docsUrl: 'https://www.mongodb.com/docs/manual/tutorial/getting-started/',
    projectIdea: 'Build a product catalog with faceted search and dynamic aggregation pipelines',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'nodejs', coOccurrencePercent: 79 },
      { slug: 'express', coOccurrencePercent: 71 },
      { slug: 'typescript', coOccurrencePercent: 52 },
    ],
    primaryLearnResource: 'MongoDB Getting Started',
  },
  redis: {
    youtube: { videoId: 'G1rOthIU-uo', title: 'Redis in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'G1rOthIU-uo', title: 'Redis in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'jgpVtp1NTXw', title: 'Redis Crash Course', channel: 'Web Dev Simplified', durationMinutes: 23, type: 'crash-course' },
      { videoId: 'XH_aN9PkNcI', title: 'Redis Full Course', channel: 'freeCodeCamp', durationMinutes: 60, type: 'full-tutorial' },
    ],
    docsUrl: 'https://redis.io/learn/howtos/quick-start',
    projectIdea: 'Add a sliding-window rate limiter and session cache to an existing API',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'nodejs', coOccurrencePercent: 73 },
      { slug: 'postgresql', coOccurrencePercent: 62 },
      { slug: 'docker', coOccurrencePercent: 81 },
    ],
    primaryLearnResource: 'Redis Quick Start',
  },
  docker: {
    youtube: { videoId: 'Gjnup-PuquQ', title: 'Docker in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'Gjnup-PuquQ', title: 'Docker in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'pTFZFxd4hOI', title: 'Docker Tutorial for Beginners', channel: 'Programming with Mosh', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'fqMOX6JJhGo', title: 'Docker Tutorial Full Course', channel: 'freeCodeCamp', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.docker.com/get-started/',
    projectIdea: 'Containerize a full-stack app with Docker Compose — app, DB, and reverse proxy',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'kubernetes', coOccurrencePercent: 68 },
      { slug: 'postgresql', coOccurrencePercent: 71 },
      { slug: 'nodejs', coOccurrencePercent: 74 },
    ],
    primaryLearnResource: 'Docker Get Started guide',
  },
  kubernetes: {
    youtube: { videoId: 'PziYflu8cB8', title: 'Kubernetes in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'PziYflu8cB8', title: 'Kubernetes in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 's_o8dwzRlu4', title: 'Kubernetes Crash Course for Absolute Beginners', channel: 'TechWorld with Nana', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'X48VuDVv0do', title: 'Kubernetes Tutorial for Beginners [Full Course]', channel: 'TechWorld with Nana', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    projectIdea: 'Deploy a Node.js app with rolling updates, autoscaling, and a readiness probe',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'docker', coOccurrencePercent: 96 },
      { slug: 'terraform', coOccurrencePercent: 64 },
      { slug: 'aws', coOccurrencePercent: 71 },
    ],
    primaryLearnResource: 'Kubernetes Basics tutorial',
  },
  rust: {
    youtube: { videoId: '5C_HPTJg1lc', title: 'Rust in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: '5C_HPTJg1lc', title: 'Rust in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'lzKeecy4OmQ', title: 'Rust 101 Crash Course (6 Hours + Exercises)', channel: 'Zero To Mastery', durationMinutes: 360, type: 'crash-course' },
      { videoId: 'BpPEoZW5IiY', title: 'Learn Rust Programming – Complete Course', channel: 'freeCodeCamp', durationMinutes: 840, type: 'full-tutorial' },
    ],
    docsUrl: 'https://doc.rust-lang.org/book/',
    projectIdea: 'Build a command-line file encryption tool with progress bars and error handling',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'wasm', coOccurrencePercent: 58 },
      { slug: 'linux', coOccurrencePercent: 67 },
      { slug: 'typescript', coOccurrencePercent: 41 },
    ],
    primaryLearnResource: 'The Rust Book',
  },
  go: {
    youtube: { videoId: '446E-r0A76I', title: 'Golang in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: '446E-r0A76I', title: 'Golang in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'un6ZyFkL872', title: 'Go / Golang Crash Course', channel: 'Traversy Media', durationMinutes: 79, type: 'crash-course' },
      { videoId: 'YS4e4q8iBco', title: 'Learn Go Programming – Golang Tutorial for Beginners', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://go.dev/doc/tutorial/getting-started',
    projectIdea: 'Build a concurrent web scraper using goroutines and channels',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'docker', coOccurrencePercent: 79 },
      { slug: 'kubernetes', coOccurrencePercent: 65 },
      { slug: 'postgresql', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: 'go.dev/doc/tutorial',
  },
  python: {
    youtube: { videoId: 'x7X9w_GIm1s', title: 'Python in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'x7X9w_GIm1s', title: 'Python in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'kqtD5dpn9C8', title: 'Python for Beginners in 1 Hour', channel: 'Programming with Mosh', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'rfscVS0vtbw', title: 'Learn Python – Full Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 280, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.python.org/3/tutorial/',
    projectIdea: 'Build a live data dashboard pulling from a public API using Pandas and Plotly',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'fastapi', coOccurrencePercent: 67 },
      { slug: 'pytorch', coOccurrencePercent: 54 },
      { slug: 'django', coOccurrencePercent: 49 },
    ],
    primaryLearnResource: 'Python official tutorial',
  },
  java: {
    youtube: { videoId: 'l9AzO1FMgM8', title: 'Java in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'l9AzO1FMgM8', title: 'Java in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'eIrMbAQSU34', title: 'Java Full Course for Beginners', channel: 'Programming with Mosh', durationMinutes: 150, type: 'crash-course' },
      { videoId: 'GoXwIVyNvX0', title: 'Intro to Java Programming – Full Course for Absolute Beginners', channel: 'freeCodeCamp', durationMinutes: 540, type: 'full-tutorial' },
    ],
    docsUrl: 'https://dev.java/learn/',
    projectIdea: 'Build a Spring Boot REST API with JWT authentication and role-based access',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'spring', coOccurrencePercent: 78 },
      { slug: 'postgresql', coOccurrencePercent: 64 },
      { slug: 'docker', coOccurrencePercent: 61 },
    ],
    primaryLearnResource: 'dev.java/learn',
  },
  tailwindcss: {
    youtube: { videoId: 'mr15Xzb1Ook', title: 'Tailwind in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'mr15Xzb1Ook', title: 'Tailwind in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'dFgzHOX84xQ', title: 'Tailwind CSS Crash Course', channel: 'Traversy Media', durationMinutes: 30, type: 'crash-course' },
      { videoId: 'ft30zcMlFao', title: 'Tailwind CSS Full Course', channel: 'Net Ninja', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://tailwindcss.com/docs/installation',
    projectIdea: 'Redesign a plain HTML site into a polished landing page with a dark mode toggle',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'react', coOccurrencePercent: 81 },
      { slug: 'nextjs', coOccurrencePercent: 74 },
      { slug: 'typescript', coOccurrencePercent: 68 },
    ],
    primaryLearnResource: 'tailwindcss.com/docs',
  },
  prisma: {
    youtube: { videoId: 'rLRIB6AF2Dg', title: 'Prisma in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'rLRIB6AF2Dg', title: 'Prisma in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'RebA5J-rlwg', title: 'Prisma Crash Course', channel: 'Web Dev Simplified', durationMinutes: 68, type: 'crash-course' },
      { videoId: 'CYH04BJd27A', title: 'Prisma & PostgreSQL – Full Tutorial', channel: 'Academind', durationMinutes: 190, type: 'full-tutorial' },
    ],
    docsUrl: 'https://www.prisma.io/docs/getting-started/quickstart',
    projectIdea: 'Build a multi-tenant SaaS schema with Prisma Migrate and row-level isolation',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 91 },
      { slug: 'postgresql', coOccurrencePercent: 78 },
      { slug: 'nextjs', coOccurrencePercent: 67 },
    ],
    primaryLearnResource: 'Prisma Quickstart',
  },
  graphql: {
    youtube: { videoId: 'eIQh02xuVw4', title: 'GraphQL in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'eIQh02xuVw4', title: 'GraphQL in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'ed8SHL5larA', title: 'GraphQL Crash Course', channel: 'Traversy Media', durationMinutes: 48, type: 'crash-course' },
      { videoId: 'bUD6ERPmJr0', title: 'Learn GraphQL In 40 Minutes', channel: 'Web Dev Simplified', durationMinutes: 40, type: 'full-tutorial' },
    ],
    docsUrl: 'https://graphql.org/learn/',
    projectIdea: 'Build a GitHub repo explorer using the GitHub GraphQL API with pagination and caching',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 74 },
      { slug: 'react', coOccurrencePercent: 68 },
      { slug: 'nodejs', coOccurrencePercent: 71 },
    ],
    primaryLearnResource: 'graphql.org/learn',
  },
  solidity: {
    youtube: { videoId: 'kdvVwGrV7ec', title: 'Solidity in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'kdvVwGrV7ec', title: 'Solidity in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'EhPeHeoKF88', title: 'Solidity Tutorial for Beginners', channel: 'Dapp University', durationMinutes: 126, type: 'crash-course' },
      { videoId: 'M576WGiDBdQ', title: 'Solidity, Blockchain & Smart Contracts Full Course', channel: 'freeCodeCamp', durationMinutes: 1380, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html',
    projectIdea: 'Deploy an NFT contract with minting, transfer, and royalty logic on the Sepolia testnet',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'hardhat', coOccurrencePercent: 83 },
      { slug: 'ethers-js', coOccurrencePercent: 71 },
      { slug: 'typescript', coOccurrencePercent: 67 },
    ],
    primaryLearnResource: 'Solidity Docs intro',
  },
  hardhat: {
    youtube: { videoId: 'gyMwXuJrbJQ', title: 'Hardhat Tutorial', channel: 'Patrick Collins', durationMinutes: 6 },
    youtubeVideos: [
      { videoId: 'gyMwXuJrbJQ', title: 'Hardhat Tutorial', channel: 'Patrick Collins', durationMinutes: 6, type: 'intro' },
      { videoId: 'p53-2KlrJ6Y', title: 'Hardhat & Ethers.js Crash Course', channel: 'Patrick Collins', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'nBzrpGMnbrE', title: 'Smart Contract Development with Hardhat', channel: 'freeCodeCamp', durationMinutes: 300, type: 'full-tutorial' },
    ],
    docsUrl: 'https://hardhat.org/tutorial',
    projectIdea: 'Write a token vesting contract and achieve 100% test coverage with Hardhat',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'solidity', coOccurrencePercent: 94 },
      { slug: 'typescript', coOccurrencePercent: 72 },
      { slug: 'ethers-js', coOccurrencePercent: 81 },
    ],
    primaryLearnResource: 'hardhat.org/tutorial',
  },
  'react-native': {
    youtube: { videoId: '6oFuwhIibo4', title: 'React Native in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: '6oFuwhIibo4', title: 'React Native in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: '0-S5HgmC9yA', title: 'React Native Crash Course', channel: 'Traversy Media', durationMinutes: 75, type: 'crash-course' },
      { videoId: 'obH0Po_Dy18', title: 'React Native Full Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://reactnative.dev/docs/getting-started',
    projectIdea: 'Build a habit tracker app with streaks, push notifications, and local storage',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'react', coOccurrencePercent: 97 },
      { slug: 'typescript', coOccurrencePercent: 76 },
      { slug: 'expo', coOccurrencePercent: 83 },
    ],
    primaryLearnResource: 'reactnative.dev/docs',
  },
  flutter: {
    youtube: { videoId: 'lHhRav3nkiw', title: 'Flutter in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'lHhRav3nkiw', title: 'Flutter in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: '1gDhl4leEzA', title: 'Flutter Tutorial for Beginners', channel: 'Net Ninja', durationMinutes: 90, type: 'crash-course' },
      { videoId: 'VFDbZk2xhO4', title: 'Flutter & Dart Full Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 360, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.flutter.dev/get-started/codelab',
    projectIdea: 'Build a cryptocurrency price tracker with live charts and portfolio tracking',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'dart', coOccurrencePercent: 99 },
      { slug: 'firebase', coOccurrencePercent: 64 },
      { slug: 'supabase', coOccurrencePercent: 41 },
    ],
    primaryLearnResource: 'Flutter first codelab',
  },
  aws: {
    youtube: { videoId: 'a9__D53WsUs', title: 'AWS in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'a9__D53WsUs', title: 'AWS in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: '3hLmDS179YE', title: 'AWS Tutorial for Beginners', channel: 'freeCodeCamp', durationMinutes: 135, type: 'crash-course' },
      { videoId: 'zA8guDqfv40', title: 'AWS Full Course – Learn Amazon Web Services', channel: 'freeCodeCamp', durationMinutes: 600, type: 'full-tutorial' },
    ],
    docsUrl: 'https://aws.amazon.com/getting-started/hands-on/',
    projectIdea: 'Build a serverless image resizing pipeline with Lambda, S3, and API Gateway',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'docker', coOccurrencePercent: 74 },
      { slug: 'terraform', coOccurrencePercent: 68 },
      { slug: 'kubernetes', coOccurrencePercent: 59 },
    ],
    primaryLearnResource: 'AWS Hands-on Tutorials',
  },
  gcp: {
    youtube: { videoId: '4D3X6Xl5c_Y', title: 'Google Cloud in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: '4D3X6Xl5c_Y', title: 'Google Cloud in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'IeMCS-Hnw98', title: 'Google Cloud Platform Tutorial for Beginners', channel: 'freeCodeCamp', durationMinutes: 180, type: 'crash-course' },
      { videoId: 'jpno8FSqpc8', title: 'Google Cloud Associate Cloud Engineer Course', channel: 'freeCodeCamp', durationMinutes: 600, type: 'full-tutorial' },
    ],
    docsUrl: 'https://cloud.google.com/docs/get-started',
    projectIdea: 'Deploy an API to Cloud Run with CI/CD from GitHub and secret management',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'docker', coOccurrencePercent: 71 },
      { slug: 'kubernetes', coOccurrencePercent: 76 },
      { slug: 'terraform', coOccurrencePercent: 62 },
    ],
    primaryLearnResource: 'Google Cloud Get Started',
  },
  supabase: {
    youtube: { videoId: 'zBZgdTb-dns', title: 'Supabase in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'zBZgdTb-dns', title: 'Supabase in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'dU7GwCOgvNY', title: 'Supabase Crash Course', channel: 'Net Ninja', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'ydz7Dj5QRHQ', title: 'Supabase Full Course – Build a Full Stack App', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://supabase.com/docs/guides/getting-started/quickstarts/nextjs',
    projectIdea: 'Build a real-time collaborative whiteboard with auth, live cursors, and RLS',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'nextjs', coOccurrencePercent: 72 },
      { slug: 'react', coOccurrencePercent: 68 },
      { slug: 'typescript', coOccurrencePercent: 81 },
    ],
    primaryLearnResource: 'Supabase Next.js Quickstart',
  },
  firebase: {
    youtube: { videoId: 'vAoB4VbhRzM', title: 'Firebase in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'vAoB4VbhRzM', title: 'Firebase in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: '9kRgVxULbag', title: 'Firebase Tutorial for Beginners', channel: 'Net Ninja', durationMinutes: 90, type: 'crash-course' },
      { videoId: 'fgdpvwEWJ9M', title: 'Firebase – Back to the Basics', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://firebase.google.com/docs/web/setup',
    projectIdea: 'Build a group chat app with real-time Firestore sync, auth, and file sharing',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'react', coOccurrencePercent: 71 },
      { slug: 'flutter', coOccurrencePercent: 64 },
      { slug: 'typescript', coOccurrencePercent: 66 },
    ],
    primaryLearnResource: 'Firebase Web Setup',
  },
  git: {
    youtube: { videoId: 'hwP7WQkmECE', title: 'Git in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'hwP7WQkmECE', title: 'Git in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'RGOj5yH7evk', title: 'Git and GitHub for Beginners – Crash Course', channel: 'Traversy Media', durationMinutes: 40, type: 'crash-course' },
      { videoId: 'apGV9Kg7ics', title: 'Git and GitHub for Beginners', channel: 'freeCodeCamp', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control',
    projectIdea: 'Set up a monorepo with pre-commit hooks, conventional commits, and automated changelog',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'github', coOccurrencePercent: 93 },
      { slug: 'linux', coOccurrencePercent: 71 },
      { slug: 'docker', coOccurrencePercent: 52 },
    ],
    primaryLearnResource: 'Git Book (free)',
  },
  linux: {
    youtube: { videoId: 'rrB13utjYV4', title: 'Linux in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'rrB13utjYV4', title: 'Linux in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'n9uCgUzfeRQ', title: 'Introduction to Linux', channel: 'freeCodeCamp', durationMinutes: 180, type: 'crash-course' },
      { videoId: 'ROjZy1WbCIA', title: 'Linux for Beginners Full Course', channel: 'freeCodeCamp', durationMinutes: 600, type: 'full-tutorial' },
    ],
    docsUrl: 'https://linuxcommand.org/lc3_learning_the_shell.php',
    projectIdea: 'Write a Bash script that monitors disk usage and CPU, sends alerts, and auto-logs to a file',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'docker', coOccurrencePercent: 79 },
      { slug: 'git', coOccurrencePercent: 74 },
      { slug: 'bash', coOccurrencePercent: 82 },
    ],
    primaryLearnResource: 'Linux Command (free)',
  },
  terraform: {
    youtube: { videoId: 'tomUWcQ0P3k', title: 'Terraform in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'tomUWcQ0P3k', title: 'Terraform in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'SLB_c_ayRMo', title: 'Terraform Course for Absolute Beginners', channel: 'freeCodeCamp', durationMinutes: 120, type: 'crash-course' },
      { videoId: 'iRaai1IBlB0', title: 'HashiCorp Terraform Associate Certification Course', channel: 'freeCodeCamp', durationMinutes: 600, type: 'full-tutorial' },
    ],
    docsUrl: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started',
    projectIdea: 'Provision a VPC, EC2 cluster, and RDS database on AWS using reusable Terraform modules',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'aws', coOccurrencePercent: 72 },
      { slug: 'kubernetes', coOccurrencePercent: 68 },
      { slug: 'ansible', coOccurrencePercent: 57 },
    ],
    primaryLearnResource: 'Terraform AWS Tutorial',
  },
  ansible: {
    youtube: { videoId: '1id6ERvfozo', title: 'Ansible in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: '1id6ERvfozo', title: 'Ansible in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'xRMPrJyAa-8', title: 'Ansible Crash Course', channel: 'TechWorld with Nana', durationMinutes: 60, type: 'crash-course' },
      { videoId: '3RiVKs8GHYQ', title: 'Ansible Full Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.ansible.com/ansible/latest/getting_started/',
    projectIdea: 'Automate a full web server setup (NGINX, app, SSL cert) with an Ansible playbook',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'terraform', coOccurrencePercent: 64 },
      { slug: 'linux', coOccurrencePercent: 81 },
      { slug: 'docker', coOccurrencePercent: 67 },
    ],
    primaryLearnResource: 'Ansible Getting Started',
  },
  pytorch: {
    youtube: { videoId: 'ORMx45xqWkA', title: 'PyTorch in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'ORMx45xqWkA', title: 'PyTorch in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'IC0_FRiX-sw', title: 'PyTorch Crash Course – Getting Started with Deep Learning', channel: 'Aladdin Persson', durationMinutes: 50, type: 'crash-course' },
      { videoId: 'V_xro1QLnLg', title: 'PyTorch for Deep Learning & Machine Learning – Full Course', channel: 'freeCodeCamp', durationMinutes: 1440, type: 'full-tutorial' },
    ],
    docsUrl: 'https://pytorch.org/tutorials/beginner/basics/intro.html',
    projectIdea: 'Train a CNN from scratch to classify handwritten digits — then visualize what it learned',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'python', coOccurrencePercent: 99 },
      { slug: 'numpy', coOccurrencePercent: 91 },
      { slug: 'jupyter', coOccurrencePercent: 78 },
    ],
    primaryLearnResource: 'PyTorch Learn the Basics',
  },
  tensorflow: {
    youtube: { videoId: 'i8NETqtGHms', title: 'TensorFlow in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'i8NETqtGHms', title: 'TensorFlow in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'tPYj3fFJGjk', title: 'TensorFlow Crash Course', channel: 'Traversy Media', durationMinutes: 45, type: 'crash-course' },
      { videoId: 'tFHeUSJAYbE', title: 'TensorFlow 2.0 Complete Course', channel: 'freeCodeCamp', durationMinutes: 600, type: 'full-tutorial' },
    ],
    docsUrl: 'https://www.tensorflow.org/tutorials/quickstart/beginner',
    projectIdea: 'Fine-tune a pre-trained image classifier on a custom photo dataset in 100 lines',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'python', coOccurrencePercent: 99 },
      { slug: 'keras', coOccurrencePercent: 84 },
      { slug: 'numpy', coOccurrencePercent: 89 },
    ],
    primaryLearnResource: 'TensorFlow Beginner Quickstart',
  },
  langchain: {
    youtube: { videoId: 'aywZrzNaKjs', title: 'LangChain in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'aywZrzNaKjs', title: 'LangChain in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'nAmC7SoVLd8', title: 'LangChain Crash Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'mrjq4JNNRPA', title: 'LangChain for LLM Application Development', channel: 'freeCodeCamp', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://python.langchain.com/docs/get_started/quickstart',
    projectIdea: 'Build a RAG chatbot that answers questions over your own PDF documents',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'python', coOccurrencePercent: 88 },
      { slug: 'openai-api', coOccurrencePercent: 79 },
      { slug: 'fastapi', coOccurrencePercent: 56 },
    ],
    primaryLearnResource: 'LangChain Quickstart',
  },
  'openai-api': {
    youtube: { videoId: 'uRQH2CFvedY', title: 'OpenAI API in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'uRQH2CFvedY', title: 'OpenAI API in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'iO1mwxPNP5A', title: 'OpenAI API Crash Course', channel: 'Traversy Media', durationMinutes: 55, type: 'crash-course' },
      { videoId: '5sLYAQS9sWQ', title: 'OpenAI API for Beginners – Full Course', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://platform.openai.com/docs/quickstart',
    projectIdea: 'Build an AI code reviewer that posts structured feedback as GitHub PR comments',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 71 },
      { slug: 'langchain', coOccurrencePercent: 64 },
      { slug: 'nodejs', coOccurrencePercent: 68 },
    ],
    primaryLearnResource: 'OpenAI API Quickstart',
  },
  vite: {
    youtube: { videoId: 'KCrXgy8qtjM', title: 'Vite in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'KCrXgy8qtjM', title: 'Vite in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'DkGV5F9JsHY', title: 'Vite Crash Course', channel: 'Traversy Media', durationMinutes: 45, type: 'crash-course' },
      { videoId: 'GfIEIOCXjTY', title: 'Vite Full Course – Setting up a Vite App', channel: 'Academind', durationMinutes: 120, type: 'full-tutorial' },
    ],
    docsUrl: 'https://vitejs.dev/guide/',
    projectIdea: 'Migrate a Create React App project to Vite — benchmark the build and HMR speed difference',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'react', coOccurrencePercent: 79 },
      { slug: 'typescript', coOccurrencePercent: 82 },
      { slug: 'tailwind-css', coOccurrencePercent: 67 },
    ],
    primaryLearnResource: 'vitejs.dev/guide',
  },
  webpack: {
    youtube: { videoId: 'MpGLUVbqoYQ', title: 'Webpack in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'MpGLUVbqoYQ', title: 'Webpack in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'IZGNcSuwBZs', title: 'Webpack Crash Course', channel: 'Traversy Media', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'X1nxTjVDYdQ', title: 'Webpack 5 Full Project Setup', channel: 'Academind', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://webpack.js.org/guides/getting-started/',
    projectIdea: 'Build a custom Webpack config with code splitting, tree-shaking, and bundle analysis',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'react', coOccurrencePercent: 68 },
      { slug: 'typescript', coOccurrencePercent: 71 },
      { slug: 'nodejs', coOccurrencePercent: 62 },
    ],
    primaryLearnResource: 'Webpack Getting Started',
  },
  jest: {
    youtube: { videoId: 'ajiAl5UNzBU', title: 'Jest in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'ajiAl5UNzBU', title: 'Jest in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: '7r4xVDI2vug', title: 'Jest Crash Course – Unit Testing in JavaScript', channel: 'Traversy Media', durationMinutes: 50, type: 'crash-course' },
      { videoId: 'IPiUDhwnZxA', title: 'JavaScript Unit Testing – The Practical Guide', channel: 'Academind', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://jestjs.io/docs/getting-started',
    projectIdea: 'Achieve 100% test coverage on a utility library — then add snapshot tests',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 74 },
      { slug: 'react', coOccurrencePercent: 68 },
      { slug: 'nodejs', coOccurrencePercent: 71 },
    ],
    primaryLearnResource: 'Jest Getting Started',
  },
  vitest: {
    youtube: { videoId: 'snCLQmINqCU', title: 'Vitest Crash Course', channel: 'Matt Pocock', durationMinutes: 12 },
    youtubeVideos: [
      { videoId: 'snCLQmINqCU', title: 'Vitest Crash Course', channel: 'Matt Pocock', durationMinutes: 12, type: 'intro' },
      { videoId: 'FDEf3iWEgFI', title: 'Vitest – The Better Alternative to Jest', channel: 'Traversy Media', durationMinutes: 35, type: 'crash-course' },
      { videoId: 'OFmztpbez9I', title: 'Testing with Vitest – Full Tutorial', channel: 'Academind', durationMinutes: 120, type: 'full-tutorial' },
    ],
    docsUrl: 'https://vitest.dev/guide/',
    projectIdea: 'Set up TDD for a React component library with Vitest, coverage reports, and CI',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'vite', coOccurrencePercent: 88 },
      { slug: 'typescript', coOccurrencePercent: 79 },
      { slug: 'react', coOccurrencePercent: 64 },
    ],
    primaryLearnResource: 'vitest.dev/guide',
  },
  astro: {
    youtube: { videoId: 'dsTXcSeAZq8', title: 'Astro in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'dsTXcSeAZq8', title: 'Astro in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'e-R4WEprqss', title: 'Astro Crash Course', channel: 'Kevin Powell', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'YMS2gzMMRSU', title: 'Astro Full Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.astro.build/en/tutorial/0-introduction/',
    projectIdea: 'Build a technical docs site with Astro, MDX, and a built-in search index',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 69 },
      { slug: 'tailwind-css', coOccurrencePercent: 72 },
      { slug: 'react', coOccurrencePercent: 54 },
    ],
    primaryLearnResource: 'Astro Build Tutorial',
  },
  remix: {
    youtube: { videoId: 'bfmI-kaKzNA', title: 'Remix in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'bfmI-kaKzNA', title: 'Remix in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'd_BhzHVV4aQ', title: 'Remix Crash Course', channel: 'Traversy Media', durationMinutes: 55, type: 'crash-course' },
      { videoId: 'TWBpP6DQZUE', title: 'Remix Full Stack Tutorial', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://remix.run/docs/en/main/start/tutorial',
    projectIdea: 'Build a full-stack form with optimistic UI, server-side validation, and error boundaries',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'react', coOccurrencePercent: 96 },
      { slug: 'typescript', coOccurrencePercent: 78 },
      { slug: 'tailwind-css', coOccurrencePercent: 63 },
    ],
    primaryLearnResource: 'Remix Tutorial',
  },
  nuxt: {
    youtube: { videoId: 'dCxSsr5xuL8', title: 'Nuxt in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'dCxSsr5xuL8', title: 'Nuxt in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'wIAM0-MEdEg', title: 'Nuxt 3 Crash Course', channel: 'Net Ninja', durationMinutes: 60, type: 'crash-course' },
      { videoId: '7FFaObecCiU', title: 'Nuxt Full Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://nuxt.com/docs/getting-started/introduction',
    projectIdea: 'Build a server-rendered e-commerce product page with SEO meta, SSR, and ISR',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'vue', coOccurrencePercent: 98 },
      { slug: 'typescript', coOccurrencePercent: 74 },
      { slug: 'tailwind-css', coOccurrencePercent: 61 },
    ],
    primaryLearnResource: 'nuxt.com/docs',
  },
  wagmi: {
    youtube: { videoId: 'v7eFSeTq4mI', title: 'wagmi Tutorial', channel: 'EatTheBlocks', durationMinutes: 10 },
    youtubeVideos: [
      { videoId: 'v7eFSeTq4mI', title: 'wagmi Tutorial', channel: 'EatTheBlocks', durationMinutes: 10, type: 'intro' },
      { videoId: 'ACyvxIlNZ5A', title: 'wagmi & RainbowKit Crash Course', channel: 'Moralis Web3', durationMinutes: 45, type: 'crash-course' },
      { videoId: 'kfGRs2KpOWA', title: 'Build a Full-Stack DApp with wagmi', channel: 'freeCodeCamp', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://wagmi.sh/react/getting-started',
    projectIdea: 'Build a DeFi portfolio tracker showing live token balances and transaction history',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'react', coOccurrencePercent: 91 },
      { slug: 'typescript', coOccurrencePercent: 83 },
      { slug: 'ethers-js', coOccurrencePercent: 69 },
    ],
    primaryLearnResource: 'wagmi.sh/react/getting-started',
  },
  chainlink: {
    youtube: { videoId: 'tIUHQ7sDoaU', title: 'Chainlink in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'tIUHQ7sDoaU', title: 'Chainlink in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'f0eJwX7CYW4', title: 'Chainlink Tutorial for Beginners', channel: 'Patrick Collins', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'M576WGiDBdQ', title: 'Blockchain Full Course – Solidity & Chainlink', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.chain.link/getting-started/conceptual-overview',
    projectIdea: 'Write a smart contract that fetches live price feeds on-chain using Chainlink Data Feeds',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'solidity', coOccurrencePercent: 88 },
      { slug: 'hardhat', coOccurrencePercent: 74 },
      { slug: 'typescript', coOccurrencePercent: 59 },
    ],
    primaryLearnResource: 'Chainlink conceptual overview',
  },
  kotlin: {
    youtube: { videoId: 'xT8oP0wy-A0', title: 'Kotlin in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'xT8oP0wy-A0', title: 'Kotlin in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'F9UC9DY-vIU', title: 'Kotlin Crash Course', channel: 'Traversy Media', durationMinutes: 65, type: 'crash-course' },
      { videoId: 'EExSSotojVI', title: 'Kotlin for Beginners – Full Course', channel: 'freeCodeCamp', durationMinutes: 360, type: 'full-tutorial' },
    ],
    docsUrl: 'https://kotlinlang.org/docs/getting-started.html',
    projectIdea: 'Build an Android app with Jetpack Compose — a habit tracker with local Room DB',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'java', coOccurrencePercent: 72 },
      { slug: 'android', coOccurrencePercent: 91 },
      { slug: 'spring', coOccurrencePercent: 48 },
    ],
    primaryLearnResource: 'kotlinlang.org/docs',
  },
  swift: {
    youtube: { videoId: 'nAchMctX4YA', title: 'Swift in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'nAchMctX4YA', title: 'Swift in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'Ulp8KvJsiKU', title: 'Swift 5 for Beginners – 2024', channel: 'Sean Allen', durationMinutes: 120, type: 'crash-course' },
      { videoId: '8Xg7E9shq0U', title: 'Swift Programming Tutorial for Beginners', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.swift.org/swift-book/documentation/the-swift-programming-language/',
    projectIdea: 'Build an iOS expense tracker with SwiftUI, Core Data, and iCloud sync',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'swiftui', coOccurrencePercent: 88 },
      { slug: 'xcode', coOccurrencePercent: 97 },
      { slug: 'firebase', coOccurrencePercent: 54 },
    ],
    primaryLearnResource: 'Swift Book (free)',
  },
  php: {
    youtube: { videoId: 'a7_WFUlFS94', title: 'PHP in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'a7_WFUlFS94', title: 'PHP in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'BUCiSSyIGGU', title: 'PHP for Absolute Beginners', channel: 'Traversy Media', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'OK_JCtrrv-c', title: 'PHP Tutorial for Beginners – Full Course', channel: 'freeCodeCamp', durationMinutes: 360, type: 'full-tutorial' },
    ],
    docsUrl: 'https://www.php.net/manual/en/getting-started.php',
    projectIdea: 'Build a blog CMS with Laravel — auth, CRUD posts, image uploads, and RSS feed',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'mysql', coOccurrencePercent: 79 },
      { slug: 'docker', coOccurrencePercent: 61 },
      { slug: 'javascript', coOccurrencePercent: 54 },
    ],
    primaryLearnResource: 'PHP Getting Started',
  },
  ruby: {
    youtube: { videoId: 'jXkMZX8hKSM', title: 'Ruby in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'jXkMZX8hKSM', title: 'Ruby in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 't_ispmWmdjY', title: 'Ruby Programming Language – Full Course', channel: 'Traversy Media', durationMinutes: 90, type: 'crash-course' },
      { videoId: '2aXNBkM9AK0', title: 'Learn Ruby on Rails – Full Course', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://www.ruby-lang.org/en/documentation/quickstart/',
    projectIdea: 'Build a link-in-bio page builder with Rails, Active Storage, and Turbo streams',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'rails', coOccurrencePercent: 84 },
      { slug: 'postgresql', coOccurrencePercent: 71 },
      { slug: 'docker', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: 'Ruby Quickstart',
  },
  scala: {
    youtube: { videoId: 'fVLVbPdThZo', title: 'Scala in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'fVLVbPdThZo', title: 'Scala in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'DzFt0YkZo8M', title: 'Scala for Beginners', channel: 'Rock the JVM', durationMinutes: 90, type: 'crash-course' },
      { videoId: 'nqRXdVFr85Y', title: 'Scala & Functional Programming – Full Course', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.scala-lang.org/getting-started/',
    projectIdea: 'Build a streaming data pipeline with Akka Streams that processes and aggregates events',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'java', coOccurrencePercent: 74 },
      { slug: 'spark', coOccurrencePercent: 68 },
      { slug: 'kafka', coOccurrencePercent: 54 },
    ],
    primaryLearnResource: 'Scala Getting Started',
  },
  elixir: {
    youtube: { videoId: 'R7t7zca8SyM', title: 'Elixir in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'R7t7zca8SyM', title: 'Elixir in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'pBNOavToRKY', title: 'Elixir & Phoenix for Beginners', channel: 'Traversy Media', durationMinutes: 75, type: 'crash-course' },
      { videoId: 'ycC1SDVHCEM', title: 'Elixir Programming Language – Full Course', channel: 'freeCodeCamp', durationMinutes: 360, type: 'full-tutorial' },
    ],
    docsUrl: 'https://elixir-lang.org/getting-started/introduction.html',
    projectIdea: 'Build a real-time Phoenix LiveView chat with presence indicators and no JavaScript',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'phoenix', coOccurrencePercent: 88 },
      { slug: 'postgresql', coOccurrencePercent: 72 },
      { slug: 'docker', coOccurrencePercent: 59 },
    ],
    primaryLearnResource: 'Elixir Getting Started',
  },
  dart: {
    youtube: { videoId: '5xlVn_OU4yU', title: 'Dart in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: '5xlVn_OU4yU', title: 'Dart in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'Ej_Pcr4uC2Q', title: 'Dart Programming Tutorial – Full Course', channel: 'Traversy Media', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'Fqcsow81np4', title: 'Dart Programming Language Tutorial', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://dart.dev/language',
    projectIdea: 'Build a to-do app in Flutter+Dart with offline-first storage and sync',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'flutter', coOccurrencePercent: 99 },
      { slug: 'firebase', coOccurrencePercent: 62 },
      { slug: 'supabase', coOccurrencePercent: 41 },
    ],
    primaryLearnResource: 'dart.dev/language',
  },
  solana: {
    youtube: { videoId: 'sX3HFzJVLYw', title: 'Solana in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'sX3HFzJVLYw', title: 'Solana in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'amAq-WHAFs8', title: 'Solana Tutorial for Beginners', channel: 'QuickNode', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'qDRkXD2UvPU', title: 'Solana Blockchain Developer Bootcamp', channel: 'freeCodeCamp', durationMinutes: 600, type: 'full-tutorial' },
    ],
    docsUrl: 'https://solana.com/docs/intro/quick-start',
    projectIdea: 'Write and deploy a Solana program with Anchor that lets users vote on proposals',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'rust', coOccurrencePercent: 78 },
      { slug: 'typescript', coOccurrencePercent: 71 },
      { slug: 'react', coOccurrencePercent: 64 },
    ],
    primaryLearnResource: 'Solana Quick Start',
  },
  vercel: {
    youtube: { videoId: 'ZKKE5NQZA1o', title: 'Vercel in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'ZKKE5NQZA1o', title: 'Vercel in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'FfK4JDnDVoA', title: 'Vercel Crash Course – Deploy Your Apps', channel: 'Traversy Media', durationMinutes: 35, type: 'crash-course' },
      { videoId: 'ACGjZTmGpCg', title: 'Next.js & Vercel – Full Deployment Guide', channel: 'freeCodeCamp', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://vercel.com/docs/getting-started-with-vercel',
    projectIdea: 'Deploy a Next.js app with preview deployments, edge functions, and analytics',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'nextjs', coOccurrencePercent: 89 },
      { slug: 'react', coOccurrencePercent: 74 },
      { slug: 'typescript', coOccurrencePercent: 68 },
    ],
    primaryLearnResource: 'Vercel Getting Started',
  },
  mysql: {
    youtube: { videoId: 'Cz3WcZLRaWc', title: 'MySQL in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'Cz3WcZLRaWc', title: 'MySQL in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'ER8oKOfaehc', title: 'MySQL Crash Course', channel: 'Traversy Media', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'HXV3zeQKqGY', title: 'MySQL Tutorial for Beginners – Full Course', channel: 'freeCodeCamp', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://dev.mysql.com/doc/mysql-getting-started/en/',
    projectIdea: 'Design an e-commerce database with optimized indexes and analyze slow queries',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'php', coOccurrencePercent: 74 },
      { slug: 'docker', coOccurrencePercent: 68 },
      { slug: 'nodejs', coOccurrencePercent: 59 },
    ],
    primaryLearnResource: 'MySQL Getting Started',
  },
  javascript: {
    youtube: { videoId: 'DHjqpvDnNGE', title: 'JavaScript in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'DHjqpvDnNGE', title: 'JavaScript in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'hdI2bqOjy3c', title: 'JavaScript Crash Course', channel: 'Traversy Media', durationMinutes: 100, type: 'crash-course' },
      { videoId: 'PkZNo7MFNFg', title: 'Learn JavaScript - Full Course', channel: 'freeCodeCamp', durationMinutes: 200, type: 'full-tutorial' },
    ],
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    projectIdea: 'Build a browser-based typing speed test that tracks WPM, accuracy, and a personal leaderboard',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 78 },
      { slug: 'react', coOccurrencePercent: 71 },
      { slug: 'nodejs', coOccurrencePercent: 64 },
    ],
    primaryLearnResource: 'MDN JavaScript Guide',
  },
  nestjs: {
    youtube: { videoId: '0M8AYU_hPas', title: 'NestJS in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: '0M8AYU_hPas', title: 'NestJS in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'GHTA143_b-s', title: 'NestJS Crash Course', channel: 'Traversy Media', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'z8e4fHI4N_E', title: 'NestJS Full Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 360, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.nestjs.com/first-steps',
    projectIdea: 'Build a REST API with JWT auth, role-based guards, and Swagger docs auto-generated',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 98 },
      { slug: 'postgresql', coOccurrencePercent: 72 },
      { slug: 'docker', coOccurrencePercent: 65 },
    ],
    primaryLearnResource: 'NestJS First Steps',
  },
  flask: {
    youtube: { videoId: 'x_V8Lu5JKV', title: 'Flask in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'x_V8Lu5JKV', title: 'Flask in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'Z1RJmh_OqeA', title: 'Flask Crash Course', channel: 'Traversy Media', durationMinutes: 47, type: 'crash-course' },
      { videoId: 'PppslomR3zY', title: 'Flask Full Course – Python Web App Tutorial', channel: 'freeCodeCamp', durationMinutes: 360, type: 'full-tutorial' },
    ],
    docsUrl: 'https://flask.palletsprojects.com/en/stable/quickstart/',
    projectIdea: 'Build a URL shortener with click analytics, expiry dates, and a dashboard',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'python', coOccurrencePercent: 99 },
      { slug: 'postgresql', coOccurrencePercent: 61 },
      { slug: 'docker', coOccurrencePercent: 54 },
    ],
    primaryLearnResource: 'Flask Quickstart',
  },
  fastify: {
    youtube: { videoId: 'Lk-uVEVGxOA', title: 'Fastify Crash Course', channel: 'Traversy Media', durationMinutes: 48 },
    youtubeVideos: [
      { videoId: 'Lk-uVEVGxOA', title: 'Fastify Crash Course', channel: 'Traversy Media', durationMinutes: 48, type: 'intro' },
      { videoId: 'Lk-uVEVGxOA', title: 'Fastify Crash Course', channel: 'Traversy Media', durationMinutes: 48, type: 'crash-course' },
      { videoId: 'VYfKlRaKLQc', title: 'Fastify Full Course – Build a REST API', channel: 'Academind', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://fastify.dev/docs/latest/Reference/Getting-Started/',
    projectIdea: 'Build a high-performance REST API and benchmark it against Express for the same endpoints',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'nodejs', coOccurrencePercent: 97 },
      { slug: 'typescript', coOccurrencePercent: 74 },
      { slug: 'postgresql', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: 'Fastify Getting Started',
  },
  'spring-boot': {
    youtube: { videoId: 'Nv2DERaMx-4', title: 'Spring Boot in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'Nv2DERaMx-4', title: 'Spring Boot in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: '9SGDpanrc8U', title: 'Spring Boot Tutorial for Beginners', channel: 'Amigoscode', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'vtPkZShggkY', title: 'Spring Boot Full Course', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://spring.io/quickstart',
    projectIdea: 'Build a RESTful inventory API with Spring Data JPA, validation, and H2 in-memory DB',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'java', coOccurrencePercent: 99 },
      { slug: 'postgresql', coOccurrencePercent: 68 },
      { slug: 'docker', coOccurrencePercent: 72 },
    ],
    primaryLearnResource: 'Spring Boot Quickstart',
  },
  htmx: {
    youtube: { videoId: 'r-GSGH2RxJs', title: 'HTMX in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'r-GSGH2RxJs', title: 'HTMX in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: '0UvEgAIc-2I', title: 'HTMX Crash Course', channel: 'Traversy Media', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'WuiHR9UrwNk', title: 'HTMX – Build Modern Interfaces without JavaScript', channel: 'freeCodeCamp', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://htmx.org/docs/',
    projectIdea: 'Convert a multi-page form into a smooth single-page flow using HTMX without writing JS',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'django', coOccurrencePercent: 64 },
      { slug: 'flask', coOccurrencePercent: 58 },
      { slug: 'tailwindcss', coOccurrencePercent: 72 },
    ],
    primaryLearnResource: 'HTMX Docs',
  },
  hono: {
    youtube: { videoId: 'cchqb4-mrRw', title: 'Hono Crash Course', channel: 'The Net Ninja', durationMinutes: 34 },
    youtubeVideos: [
      { videoId: 'cchqb4-mrRw', title: 'Hono Crash Course', channel: 'The Net Ninja', durationMinutes: 34, type: 'intro' },
      { videoId: 'YGNlq5gfznc', title: 'Hono.js – The Web Framework for the Edge', channel: 'Traversy Media', durationMinutes: 45, type: 'crash-course' },
      { videoId: 'nWGbC4v5_58', title: 'Build an API with Hono.js on Cloudflare Workers', channel: 'freeCodeCamp', durationMinutes: 120, type: 'full-tutorial' },
    ],
    docsUrl: 'https://hono.dev/docs/getting-started/basic',
    projectIdea: 'Deploy a global edge API on Cloudflare Workers that returns latency from 5 regions',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 91 },
      { slug: 'cloudflare-workers', coOccurrencePercent: 78 },
      { slug: 'bun', coOccurrencePercent: 52 },
    ],
    primaryLearnResource: 'Hono Getting Started',
  },
  rails: {
    youtube: { videoId: 'OaDhY_y8WIA', title: 'Ruby on Rails in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'OaDhY_y8WIA', title: 'Ruby on Rails in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'B3Fbujmgo60', title: 'Ruby on Rails Crash Course', channel: 'Traversy Media', durationMinutes: 75, type: 'crash-course' },
      { videoId: '2aXNBkM9AK0', title: 'Ruby on Rails Full Course', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://guides.rubyonrails.org/getting_started.html',
    projectIdea: 'Build a Hacker News clone with posts, comments, upvotes, and user auth — in one day',
    projectDuration: '~1 day',
    companions: [
      { slug: 'ruby', coOccurrencePercent: 99 },
      { slug: 'postgresql', coOccurrencePercent: 71 },
      { slug: 'docker', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: 'Rails Getting Started',
  },
  laravel: {
    youtube: { videoId: 'MFh0Fd7BsjE', title: 'Laravel in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'MFh0Fd7BsjE', title: 'Laravel in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'ZYBv7Aq8M0A', title: 'Laravel PHP Framework Tutorial', channel: 'Traversy Media', durationMinutes: 75, type: 'crash-course' },
      { videoId: 'rM3NDIF-KRXM', title: 'Laravel From Scratch – Full Course', channel: 'freeCodeCamp', durationMinutes: 360, type: 'full-tutorial' },
    ],
    docsUrl: 'https://laravel.com/docs/installation',
    projectIdea: 'Build a multi-user blog with Eloquent ORM, file uploads to S3, and email verification',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'php', coOccurrencePercent: 99 },
      { slug: 'mysql', coOccurrencePercent: 74 },
      { slug: 'docker', coOccurrencePercent: 61 },
    ],
    primaryLearnResource: 'Laravel Docs',
  },
  dotnet: {
    youtube: { videoId: 'eIQh02xuVw4', title: '.NET 8 Minimal API Tutorial', channel: 'Nick Chapsas', durationMinutes: 32 },
    youtubeVideos: [
      { videoId: 'eIQh02xuVw4', title: '.NET 8 Minimal API Tutorial', channel: 'Nick Chapsas', durationMinutes: 32, type: 'intro' },
      { videoId: '0x_C_M6A3H0', title: '.NET / C# Tutorial for Beginners', channel: 'IAmTimCorey', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'eVEFBvIMH8U', title: 'C# and .NET Full Course', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://dotnet.microsoft.com/en-us/learn/dotnet/hello-world-tutorial/intro',
    projectIdea: 'Build a minimal API with EF Core, JWT auth, and deploy it as a Docker container',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'csharp', coOccurrencePercent: 99 },
      { slug: 'docker', coOccurrencePercent: 67 },
      { slug: 'postgresql', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: '.NET Hello World',
  },
  csharp: {
    youtube: { videoId: 'ravLFzIguCM', title: 'C# in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'ravLFzIguCM', title: 'C# in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'GhQdlIFylQ8', title: 'C# Tutorial for Beginners', channel: 'Programming with Mosh', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'M5ugY7ftzDk', title: 'C# Programming – Full Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/',
    projectIdea: 'Build a CLI tool that parses and transforms JSON/CSV data using LINQ and async streams',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'dotnet', coOccurrencePercent: 99 },
      { slug: 'docker', coOccurrencePercent: 61 },
      { slug: 'postgresql', coOccurrencePercent: 52 },
    ],
    primaryLearnResource: 'C# Tour',
  },
  sqlite: {
    youtube: { videoId: 'IBgWKTaG_Bs', title: 'SQLite in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'IBgWKTaG_Bs', title: 'SQLite in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'Ahwoks_dawU', title: 'SQLite Tutorial for Beginners', channel: 'DB Browser for SQLite', durationMinutes: 45, type: 'crash-course' },
      { videoId: 'GMJF5OuUtnM', title: 'SQLite Databases with Python – Full Course', channel: 'freeCodeCamp', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://www.sqlite.org/quickstart.html',
    projectIdea: 'Build a local-first personal finance tracker that works fully offline with zero dependencies',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'python', coOccurrencePercent: 71 },
      { slug: 'nodejs', coOccurrencePercent: 64 },
      { slug: 'rust', coOccurrencePercent: 48 },
    ],
    primaryLearnResource: 'SQLite Quickstart',
  },
  bootstrap: {
    youtube: { videoId: 'O_9u1P5YjVc', title: 'Bootstrap 5 Crash Course', channel: 'Traversy Media', durationMinutes: 32 },
    youtubeVideos: [
      { videoId: 'O_9u1P5YjVc', title: 'Bootstrap 5 Crash Course', channel: 'Traversy Media', durationMinutes: 32, type: 'intro' },
      { videoId: '4sosXZsdy-s', title: 'Bootstrap 5 Tutorial', channel: 'Net Ninja', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'QAgrHLtG1Yk', title: 'Bootstrap 5 Complete Course', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://getbootstrap.com/docs/5.3/getting-started/introduction/',
    projectIdea: 'Build a responsive admin dashboard with sidebar nav, data tables, and charts',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'javascript', coOccurrencePercent: 81 },
      { slug: 'php', coOccurrencePercent: 67 },
      { slug: 'jquery', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: 'Bootstrap Docs',
  },
  solidjs: {
    youtube: { videoId: 'hw3Bx5vxKl0', title: 'SolidJS in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'hw3Bx5vxKl0', title: 'SolidJS in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'qB9z-GMTkAo', title: 'SolidJS Crash Course', channel: 'leerob', durationMinutes: 30, type: 'crash-course' },
      { videoId: 'O4sgwuMQns0', title: 'SolidJS Tutorial – Reactivity from Scratch', channel: 'freeCodeCamp', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://www.solidjs.com/tutorial/introduction_basics',
    projectIdea: 'Build a reactive to-do app and measure the DOM update difference vs React DevTools',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 79 },
      { slug: 'vite', coOccurrencePercent: 82 },
      { slug: 'tailwindcss', coOccurrencePercent: 61 },
    ],
    primaryLearnResource: 'SolidJS Tutorial',
  },
  qwik: {
    youtube: { videoId: 'x2eF3YLiNhY', title: 'Qwik in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'x2eF3YLiNhY', title: 'Qwik in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'f0eJwX7CYW4', title: 'Qwik Crash Course – Resumability & Instant Load', channel: 'Jack Herrington', durationMinutes: 45, type: 'crash-course' },
      { videoId: 'k8f-zmLdFHo', title: 'Qwik City Full Tutorial', channel: 'freeCodeCamp', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://qwik.dev/docs/getting-started/',
    projectIdea: 'Build a content site with Qwik City and measure Time to Interactive against a Next.js baseline',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'typescript', coOccurrencePercent: 88 },
      { slug: 'tailwindcss', coOccurrencePercent: 67 },
      { slug: 'nodejs', coOccurrencePercent: 54 },
    ],
    primaryLearnResource: 'Qwik Getting Started',
  },
  expo: {
    youtube: { videoId: 'vFW_TxKLyrE', title: 'React Native & Expo Crash Course', channel: 'Traversy Media', durationMinutes: 30 },
    youtubeVideos: [
      { videoId: 'vFW_TxKLyrE', title: 'React Native & Expo Crash Course', channel: 'Traversy Media', durationMinutes: 30, type: 'intro' },
      { videoId: 'vFW_TxKLyrE', title: 'React Native & Expo Crash Course', channel: 'Traversy Media', durationMinutes: 30, type: 'crash-course' },
      { videoId: 'obH0Po_Dy18', title: 'React Native & Expo Full Course', channel: 'freeCodeCamp', durationMinutes: 480, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.expo.dev/get-started/create-a-project/',
    projectIdea: 'Build a camera app that captures photos, adds metadata, and uploads to Supabase Storage',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'react-native', coOccurrencePercent: 97 },
      { slug: 'typescript', coOccurrencePercent: 81 },
      { slug: 'supabase', coOccurrencePercent: 58 },
    ],
    primaryLearnResource: 'Expo Get Started',
  },
  tauri: {
    youtube: { videoId: 'wRkzG8MiQ_w', title: 'Tauri in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'wRkzG8MiQ_w', title: 'Tauri in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'QwOlFLHLfaM', title: 'Tauri Crash Course – Desktop Apps with Web Tech', channel: 'Traversy Media', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'BbZCeG2BSRM', title: 'Build Desktop Apps with Tauri & React', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://tauri.app/start/',
    projectIdea: 'Build a desktop Markdown editor with file system access, syntax highlighting, and live preview',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'rust', coOccurrencePercent: 82 },
      { slug: 'react', coOccurrencePercent: 69 },
      { slug: 'typescript', coOccurrencePercent: 74 },
    ],
    primaryLearnResource: 'Tauri Getting Started',
  },
  'cloudflare-workers': {
    youtube: { videoId: 'H7Qe96fqg1M', title: 'Cloudflare Workers in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'H7Qe96fqg1M', title: 'Cloudflare Workers in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'nN2k1CflTfA', title: 'Cloudflare Workers Crash Course', channel: 'Traversy Media', durationMinutes: 45, type: 'crash-course' },
      { videoId: 'H7Qe96fqg1M', title: 'Deploy to the Edge with Cloudflare Workers', channel: 'freeCodeCamp', durationMinutes: 180, type: 'full-tutorial' },
    ],
    docsUrl: 'https://developers.cloudflare.com/workers/get-started/guide/',
    projectIdea: 'Deploy a global rate-limiter edge function and measure sub-10ms response times worldwide',
    projectDuration: '~3 hours',
    companions: [
      { slug: 'hono', coOccurrencePercent: 74 },
      { slug: 'typescript', coOccurrencePercent: 86 },
      { slug: 'workers-kv', coOccurrencePercent: 62 },
    ],
    primaryLearnResource: 'Workers Get Started',
  },
  'github-actions': {
    youtube: { videoId: 'R8_veQiYBjI', title: 'GitHub Actions in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'R8_veQiYBjI', title: 'GitHub Actions in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'mFFXuXjVgkU', title: 'GitHub Actions CI/CD Pipeline Tutorial', channel: 'TechWorld with Nana', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'TLB5MY-5nkU', title: 'GitHub Actions Full Course', channel: 'freeCodeCamp', durationMinutes: 240, type: 'full-tutorial' },
    ],
    docsUrl: 'https://docs.github.com/en/actions/writing-workflows/quickstart',
    projectIdea: 'Set up a CI/CD pipeline that runs tests, builds Docker, and deploys to a cloud provider on merge',
    projectDuration: '~4 hours',
    companions: [
      { slug: 'docker', coOccurrencePercent: 78 },
      { slug: 'kubernetes', coOccurrencePercent: 61 },
      { slug: 'terraform', coOccurrencePercent: 54 },
    ],
    primaryLearnResource: 'GitHub Actions Quickstart',
  },
  swiftui: {
    youtube: { videoId: 'b1oC7sLIgpI', title: 'SwiftUI in 100 Seconds', channel: 'Fireship', durationMinutes: 2 },
    youtubeVideos: [
      { videoId: 'b1oC7sLIgpI', title: 'SwiftUI in 100 Seconds', channel: 'Fireship', durationMinutes: 2, type: 'intro' },
      { videoId: 'F2ojC7l8bCU', title: 'SwiftUI Fundamentals', channel: 'Paul Hudson', durationMinutes: 60, type: 'crash-course' },
      { videoId: 'VTVSPvLBqrA', title: 'SwiftUI Full Course for Beginners', channel: 'freeCodeCamp', durationMinutes: 360, type: 'full-tutorial' },
    ],
    docsUrl: 'https://developer.apple.com/tutorials/swiftui',
    projectIdea: 'Build an iOS expense tracker with charts, local persistence via SwiftData, and widgets',
    projectDuration: '~1 weekend',
    companions: [
      { slug: 'swift', coOccurrencePercent: 99 },
      { slug: 'xcode', coOccurrencePercent: 97 },
      { slug: 'supabase', coOccurrencePercent: 38 },
    ],
    primaryLearnResource: 'SwiftUI Tutorials',
  },
}

export function getTechResources(slug: string): TechResources | null {
  return TECH_RESOURCES[slug] ?? null
}

/**
 * Get all curated videos for a technology.
 * Prefers the youtubeVideos array; falls back to wrapping the legacy single youtube field.
 */
export function getTechVideos(slug: string): YouTubeVideoEntry[] {
  const res = TECH_RESOURCES[slug]
  if (!res) return []

  // Use the curated multi-video array if available
  if (res.youtubeVideos && res.youtubeVideos.length > 0) {
    return res.youtubeVideos
  }

  // Backwards-compatible: wrap the single youtube field
  if (res.youtube) {
    return [{
      videoId: res.youtube.videoId,
      title: res.youtube.title,
      channel: res.youtube.channel,
      durationMinutes: res.youtube.durationMinutes,
      type: 'intro' as const,
    }]
  }

  return []
}
