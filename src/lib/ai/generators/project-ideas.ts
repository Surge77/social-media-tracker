/**
 * Project ideas generator.
 * Generates a weekend-sized project idea for a given technology + goal + level.
 * Pattern follows tech-insight.ts exactly.
 */

import type { AIProvider, GenerateOptions } from '@/lib/ai/provider'

export interface BuildStep {
  step: number
  title: string
  what: string
  hours: number
}

export interface ProjectIdea {
  name: string
  description: string
  buildSteps: BuildStep[]
  skills: string[]
  successCondition: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: number
}

export async function generateProjectIdea(
  slug: string,
  techName: string,
  goal: string,
  level: string,
  provider: AIProvider
): Promise<ProjectIdea> {
  const prompt = buildProjectPrompt(slug, techName, goal, level)

  const options: GenerateOptions = {
    temperature: 0.7,
    maxTokens: 1024,
  }

  return provider.generateJSON<ProjectIdea>(prompt, undefined, options)
}

function buildProjectPrompt(slug: string, techName: string, goal: string, level: string): string {
  return `Generate a weekend project idea for learning ${techName} (${slug}).

Learner goal: ${goal}
Experience level: ${level}

Return a JSON object with these exact fields:
- name: string — short project name (2-4 words, e.g. "Habit Tracker API")
- description: string — one sentence describing what the project does
- buildSteps: array of 4 objects, each with:
    - step: number (1–4)
    - title: string — short step name (e.g. "Set up the schema")
    - what: string — one sentence on what to do in this step
    - hours: number — realistic hours for this step (0.5–3)
- skills: array of 4–6 strings — specific skills the builder will practice (e.g. "JWT auth", "database indexing", "WebSocket events")
- successCondition: string — "You're done when…" sentence with a concrete, testable outcome
- difficulty: "beginner" | "intermediate" | "advanced"
- estimatedHours: number — sum of all step hours (1–8)

Make the project concrete and achievable in one weekend. Steps should flow naturally from setup → core feature → polish → done.`
}

/** Fallback templates when AI is unavailable */
export function getFallbackProjectIdea(slug: string, level: string): ProjectIdea {
  const templates: Record<string, ProjectIdea> = {
    react: {
      name: 'Task Manager UI',
      description: 'A React app to add, complete, and delete daily tasks with local storage persistence.',
      buildSteps: [
        { step: 1, title: 'Scaffold the project', what: 'Create a Vite + React + TypeScript app and set up Tailwind CSS.', hours: 0.5 },
        { step: 2, title: 'Build the task list', what: 'Add useState for tasks and render them as a list with add/delete buttons.', hours: 1 },
        { step: 3, title: 'Add completion & filters', what: 'Implement toggle-complete logic and filter tabs (All / Active / Done).', hours: 1.5 },
        { step: 4, title: 'Persist to localStorage', what: 'Sync state to localStorage with useEffect so tasks survive a refresh.', hours: 1 },
      ],
      skills: ['useState', 'useEffect', 'localStorage API', 'conditional rendering', 'list keys'],
      successCondition: "You're done when tasks persist after a page refresh and the filter tabs correctly show subsets.",
      difficulty: level === 'beginner' ? 'beginner' : 'intermediate',
      estimatedHours: 4,
    },
    typescript: {
      name: 'Type-Safe CLI Tool',
      description: 'A command-line tool with strict TypeScript types that transforms JSON files.',
      buildSteps: [
        { step: 1, title: 'Init the project', what: 'Set up tsconfig with strict mode, install tsx for running TS directly.', hours: 0.5 },
        { step: 2, title: 'Define types & schema', what: 'Create interfaces for the input config and output data using Zod.', hours: 1 },
        { step: 3, title: 'Build the transform logic', what: 'Read a JSON file, apply a typed transform, and write the result.', hours: 1 },
        { step: 4, title: 'Add CLI args + error handling', what: 'Parse command-line args with minimist and surface helpful error messages.', hours: 0.5 },
      ],
      skills: ['strict TypeScript', 'Zod validation', 'Node.js fs module', 'CLI argument parsing', 'type narrowing'],
      successCondition: "You're done when the CLI accepts a --file flag, transforms it, and TypeScript reports zero errors.",
      difficulty: 'beginner',
      estimatedHours: 3,
    },
    nodejs: {
      name: 'REST Notes API',
      description: 'A Node.js REST API for creating and reading notes with JSON file persistence.',
      buildSteps: [
        { step: 1, title: 'Set up Express + TypeScript', what: 'Init project, install express + types, configure ts-node.', hours: 0.5 },
        { step: 2, title: 'Build CRUD routes', what: 'Implement GET /notes, POST /notes, DELETE /notes/:id with in-memory store.', hours: 1 },
        { step: 3, title: 'Add file persistence', what: 'Write notes to a JSON file on disk so they survive server restarts.', hours: 1 },
        { step: 4, title: 'Add validation + error handling', what: 'Validate request bodies and return proper 400/404 status codes.', hours: 0.5 },
      ],
      skills: ['Express routing', 'REST conventions', 'Node.js fs module', 'request validation', 'HTTP status codes'],
      successCondition: "You're done when POST /notes creates a note that appears in GET /notes after a server restart.",
      difficulty: 'beginner',
      estimatedHours: 3,
    },
    postgresql: {
      name: 'Inventory Tracker DB',
      description: 'A relational inventory database with products, stock levels, and low-stock queries.',
      buildSteps: [
        { step: 1, title: 'Design the schema', what: 'Create tables for products and stock_movements with foreign keys.', hours: 0.5 },
        { step: 2, title: 'Seed and query data', what: 'Insert sample products and write SELECT queries with WHERE and ORDER BY.', hours: 0.5 },
        { step: 3, title: 'Write aggregation queries', what: 'Use GROUP BY and SUM to compute total stock per category.', hours: 1 },
        { step: 4, title: 'Add indexes + explain', what: 'Add an index on sku, run EXPLAIN ANALYZE, and compare query plans.', hours: 0.5 },
      ],
      skills: ['DDL (CREATE TABLE)', 'JOINs', 'aggregate functions', 'indexes', 'EXPLAIN ANALYZE'],
      successCondition: "You're done when you can query low-stock items and EXPLAIN shows an index scan instead of a seq scan.",
      difficulty: 'beginner',
      estimatedHours: 2,
    },
    docker: {
      name: 'Containerized API',
      description: 'Dockerize an existing web API with a multi-stage Dockerfile and docker-compose.',
      buildSteps: [
        { step: 1, title: 'Write the Dockerfile', what: 'Create a multi-stage build: builder stage compiles TS, runner stage is minimal.', hours: 1 },
        { step: 2, title: 'Add docker-compose', what: 'Define app + postgres services with environment variables and volume mounts.', hours: 1 },
        { step: 3, title: 'Configure health checks', what: 'Add a HEALTHCHECK instruction and depends_on condition in compose.', hours: 0.5 },
        { step: 4, title: 'Optimize image size', what: 'Use .dockerignore, alpine base, and compare image sizes with docker images.', hours: 0.5 },
      ],
      skills: ['multi-stage builds', 'docker-compose networking', 'volume mounts', 'environment variables', 'image optimization'],
      successCondition: "You're done when docker compose up starts cleanly and the API responds on localhost:3000.",
      difficulty: level === 'beginner' ? 'beginner' : 'intermediate',
      estimatedHours: 3,
    },
    solidity: {
      name: 'Simple Token Contract',
      description: 'An ERC-20 style token with mint, transfer, and balance tracking on a local Hardhat chain.',
      buildSteps: [
        { step: 1, title: 'Set up Hardhat project', what: 'Init a Hardhat TypeScript project and install OpenZeppelin contracts.', hours: 0.5 },
        { step: 2, title: 'Write the contract', what: 'Implement mint, transfer, and balanceOf using mapping and events.', hours: 1 },
        { step: 3, title: 'Write tests', what: 'Test mint, transfer, and insufficient-balance revert cases with ethers.js.', hours: 1.5 },
        { step: 4, title: 'Deploy to local chain', what: 'Write a deploy script and run it against hardhat node — verify on console.', hours: 1 },
      ],
      skills: ['Solidity mappings', 'events & emit', 'require guards', 'ethers.js testing', 'Hardhat deploy scripts'],
      successCondition: "You're done when all tests pass and you can call balanceOf after minting tokens on the local chain.",
      difficulty: 'intermediate',
      estimatedHours: 4,
    },
  }

  return templates[slug] ?? {
    name: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Starter Project`,
    description: `A focused weekend project that covers the core concepts of ${slug}.`,
    buildSteps: [
      { step: 1, title: 'Set up the project', what: `Initialize a new ${slug} project with the recommended tooling.`, hours: 0.5 },
      { step: 2, title: 'Build the core feature', what: 'Implement the main feature using the key APIs of the technology.', hours: 2 },
      { step: 3, title: 'Add error handling', what: 'Handle edge cases and add meaningful error messages.', hours: 1 },
      { step: 4, title: 'Write a quick test', what: 'Add at least one automated test to verify the happy path.', hours: 0.5 },
    ],
    skills: [`${slug} fundamentals`, 'project structure', 'error handling', 'testing basics'],
    successCondition: "You're done when the core feature works end-to-end and at least one test passes.",
    difficulty: level as 'beginner' | 'intermediate' | 'advanced',
    estimatedHours: 4,
  }
}
