// src/lib/quiz/roadmap-ai.ts
// AI enhancement layer with comprehensive fallbacks

import type {
  RoadmapAIEnhancement,
  GeneratedRoadmap,
  UserContext,
} from './roadmap-engine'

/**
 * Comprehensive fallback enhancements for all roles
 */
const FALLBACK_ENHANCEMENTS: Record<string, RoadmapAIEnhancement> = {
  'frontend-developer': {
    overallSummary: "Your path to frontend development is clear — {totalWeeks} weeks of focused learning to become job-ready.",
    phaseCommentary: [
      "Master the foundations. HTML, CSS, and JavaScript are non-negotiable.",
      "React and TypeScript are your ticket to 80% of frontend jobs.",
      "Production skills separate juniors from mids. Testing and deployment matter.",
      "Pick ONE specialization to stand out. Don't try to learn everything."
    ],
    nodeReasonings: new Map([
      ['html', "Every webpage is built with HTML. Master the structure first."],
      ['css', "CSS makes things beautiful. Flexbox and Grid are essential."],
      ['javascript', "The #1 language in web dev. Learn this before any framework."],
      ['typescript', "78% of React jobs require TypeScript. Learn it early."],
      ['react', "Still the most in-demand frontend framework by a wide margin."],
      ['nextjs', "The React framework everyone uses for production apps."],
      ['testing', "60% of interviews ask about testing. Don't skip this."],
      ['state-management', "Global state is everywhere. Zustand is simple, Redux is powerful."],
      ['performance', "High-value skill. Companies pay premium for fast apps."],
      ['a11y', "Legally required in many countries. Few devs know this well."],
    ]),
    honestWarnings: [
      "Phase 2 (React) is where most people quit. Push through — it clicks after ~20 hours.",
      "Don't jump to frameworks before mastering vanilla JavaScript. You'll regret it.",
    ],
    motivationalNote: "{startingPoint} gives you a solid foundation — you're not starting from zero.",
    skipJustifications: new Map([
      ['graphql', "Only 18% of frontend jobs require GraphQL. Focus on REST APIs first."],
      ['animation', "Nice to have, but not job-critical. Add this after you land your first role."],
    ]),
  },

  'backend-developer': {
    overallSummary: "Backend development is a clear path — {totalWeeks} weeks to build APIs, databases, and server logic.",
    phaseCommentary: [
      "Start with one language (Node.js) and master it deeply.",
      "Databases and APIs are the core of backend work. Spend time here.",
      "DevOps basics (Docker, CI/CD) make you 10x more valuable.",
      "Choose ONE cloud provider and learn it well. AWS has the most jobs."
    ],
    nodeReasonings: new Map([
      ['nodejs', "JavaScript everywhere. Great for full-stack potential."],
      ['typescript-backend', "Type safety prevents bugs. Essential for production Node.js."],
      ['postgresql', "The #1 production database. Learn SQL deeply."],
      ['rest-apis', "The standard for web APIs. Master this before GraphQL."],
      ['authentication', "Every backend needs auth. JWT, OAuth, sessions."],
      ['docker', "Containerization is standard in modern backend development."],
      ['aws-basics', "65% of backend jobs mention AWS. Learn the basics early."],
    ]),
    honestWarnings: [
      "Backend has a steeper learning curve than frontend. Expect 3-6 months to feel confident.",
    ],
    motivationalNote: "Your {currentSkills} experience gives you a head start — leverage it.",
    skipJustifications: new Map([
      ['graphql-backend', "Not as common as REST yet. Learn after you're comfortable with REST."],
      ['microservices', "Enterprise standard, but overkill for most startups. Learn when needed."],
    ]),
  },

  'fullstack-developer': {
    overallSummary: "Full-stack is ambitious but achievable — {totalWeeks} weeks to master both frontend and backend.",
    phaseCommentary: [
      "Choose ONE stack (Next.js + PostgreSQL) and go deep.",
      "Master frontend first, then add backend. Don't try to learn both simultaneously.",
      "Deployment and DevOps are where full-stack devs shine.",
      "Your edge is understanding the ENTIRE product. Use it."
    ],
    nodeReasonings: new Map([
      ['react-fullstack', "Frontend standard. Master this before adding backend."],
      ['nextjs-fullstack', "Full-stack framework. Handles frontend, API routes, and deployment."],
      ['postgresql-fullstack', "Industry-standard database. Pairs well with any backend."],
      ['typescript-fullstack', "Type safety across your entire stack. Non-negotiable in 2026."],
      ['apis-fullstack', "Connect your frontend to your backend. Master this."],
      ['auth-fullstack', "Every real app needs auth. JWT, sessions, OAuth."],
      ['docker-fullstack', "Deploy anywhere. Essential for modern full-stack."],
    ]),
    honestWarnings: [
      "Full-stack is a LOT to learn. Don't spread yourself too thin — depth beats breadth.",
    ],
    motivationalNote: "Full-stack developers are in massive demand. The investment pays off.",
    skipJustifications: new Map(),
  },

  'mobile-developer': {
    overallSummary: "Mobile development is in high demand — {totalWeeks} weeks to build iOS and Android apps.",
    phaseCommentary: [
      "React Native lets you write once, run on both iOS and Android.",
      "Navigation and state management are critical for mobile apps.",
      "Learn to deploy to app stores — distribution is key.",
      "Performance matters more on mobile. 60fps or users notice."
    ],
    nodeReasonings: new Map([
      ['react-native', "Write once, deploy to iOS and Android. Most versatile mobile framework."],
      ['navigation', "Every app needs navigation. React Navigation is the standard."],
      ['apis-mobile', "Mobile apps are useless without data. Master API integration."],
    ]),
    honestWarnings: [],
    motivationalNote: "Mobile developers are in demand. Every company needs mobile apps.",
    skipJustifications: new Map(),
  },

  'devops-engineer': {
    overallSummary: "DevOps is the future — {totalWeeks} weeks to master infrastructure and automation.",
    phaseCommentary: [
      "Linux is the foundation. Every server runs Linux.",
      "Containers and orchestration are mandatory skills in 2026.",
      "Cloud platforms (especially AWS) dominate the job market.",
      "Security and observability separate juniors from seniors."
    ],
    nodeReasonings: new Map([
      ['linux', "All production servers run Linux. Non-negotiable."],
      ['docker-devops', "Containers are everywhere. Master Docker first."],
      ['kubernetes', "K8s is complex but essential for large-scale systems."],
      ['aws-devops', "70% of cloud jobs are AWS. Start here."],
      ['terraform-devops', "Infrastructure as Code is the only way to scale."],
    ]),
    honestWarnings: [
      "DevOps has a steep learning curve. Expect 6-12 months to feel confident."
    ],
    motivationalNote: "DevOps engineers are highly paid and in massive demand.",
    skipJustifications: new Map(),
  },

  'data-engineer': {
    overallSummary: "Data is the new oil — {totalWeeks} weeks to build pipelines and analytics systems.",
    phaseCommentary: [
      "Python and SQL are mandatory. Master both deeply.",
      "Data pipelines are the backbone of modern companies.",
      "Analytics and ML skills make you incredibly valuable.",
      "Real-time streaming and deep learning are the future."
    ],
    nodeReasonings: new Map([
      ['python-data', "Python is the language of data. Essential."],
      ['sql', "Every data job needs SQL. Master it."],
      ['etl', "Airflow orchestrates data workflows at scale."],
      ['ml-basics', "Basic ML knowledge opens many doors."],
    ]),
    honestWarnings: [],
    motivationalNote: "Data professionals are in huge demand and well compensated.",
    skipJustifications: new Map(),
  },

  'ai-ml-engineer': {
    overallSummary: "AI is the biggest opportunity in tech — {totalWeeks} weeks to build AI systems.",
    phaseCommentary: [
      "Math is the foundation. Don't skip linear algebra and probability.",
      "Classical ML teaches you fundamentals before deep learning.",
      "LLMs and transformers are revolutionizing AI. Master them.",
      "Production AI requires MLOps, monitoring, and responsibility."
    ],
    nodeReasonings: new Map([
      ['python-ai', "Python dominates AI/ML. Essential."],
      ['math-ml', "Math is the foundation of ML. Don't skip this."],
      ['pytorch', "PyTorch is the framework of choice for research and production."],
      ['llms', "LLMs are the AI revolution. GPT, BERT, Claude."],
      ['rag', "RAG unlocks practical AI applications. Vector DBs are key."],
    ]),
    honestWarnings: [
      "AI/ML is highly competitive. Expect a long learning curve and deep focus."
    ],
    motivationalNote: "AI engineers are among the highest-paid in tech right now.",
    skipJustifications: new Map(),
  },

  'blockchain-developer': {
    overallSummary: "Web3 is transforming the internet — {totalWeeks} weeks to become a blockchain developer.",
    phaseCommentary: [
      "Understand blockchain fundamentals before writing code. The concepts are non-negotiable.",
      "Solidity and Ethereum are the industry standard. Start here, not exotic chains.",
      "DApp development combines Web2 skills (React) with Web3 (smart contracts).",
      "Security is EVERYTHING in Web3. One bug can cost millions."
    ],
    nodeReasonings: new Map([
      ['blockchain-basics', "You can't build what you don't understand. Start with fundamentals."],
      ['cryptography', "Security is make-or-break in Web3. Weak crypto = hacks = career over."],
      ['solidity', "The #1 language for Ethereum. 80% of blockchain jobs require this."],
      ['ethereum', "The most mature smart contract platform. Learn this first."],
      ['hardhat', "Industry-standard development environment. Everyone uses this."],
      ['web3js', "Connects your frontend to the blockchain. Essential for dApps."],
      ['react-web3', "Most Web3 projects use React. Familiar frontend, Web3 backend."],
      ['defi-basics', "DeFi is where the jobs and money are. AMMs, lending, yield."],
      ['security', "Security auditors are paid 6 figures. This skill is in massive demand."],
      ['nft-standards', "Love them or hate them, NFTs are a huge market opportunity."],
    ]),
    honestWarnings: [
      "Blockchain is volatile. Projects come and go fast. Focus on fundamentals that transfer.",
      "Security is critical. One mistake can cost millions. Study exploits and audit carefully."
    ],
    motivationalNote: "Blockchain developers are in high demand with top salaries. Skills transfer across chains.",
    skipJustifications: new Map([
      ['ipfs', "Only needed for NFTs and decentralized storage. Not all dApps require this."],
      ['layer2', "L2s are growing fast but not mandatory for all jobs. Learn Ethereum first."],
      ['multichain', "Nice to have but focus on Ethereum first. Skills transfer easily."],
      ['tokenomics', "More business than technical. Learn when you're building protocols."],
    ]),
  },
}

/**
 * Apply fallback enhancement with actual values
 */
export function applyFallbackEnhancement(
  roleId: string,
  roadmap: GeneratedRoadmap,
  userContext: UserContext
): RoadmapAIEnhancement {
  const template = FALLBACK_ENHANCEMENTS[roleId] ?? FALLBACK_ENHANCEMENTS['frontend-developer']

  // Replace placeholders in strings
  const replacePlaceholders = (text: string): string => {
    return text
      .replace('{totalWeeks}', roadmap.totalWeeks.toString())
      .replace('{totalNodes}', roadmap.totalNodes.toString())
      .replace('{startingPoint}', formatStartingPoint(userContext.startingPoint))
      .replace('{currentSkills}', userContext.currentSkills.join(', ') || 'your background')
  }

  return {
    overallSummary: replacePlaceholders(template.overallSummary),
    phaseCommentary: template.phaseCommentary,
    nodeReasonings: template.nodeReasonings,
    honestWarnings: template.honestWarnings,
    motivationalNote: replacePlaceholders(template.motivationalNote),
    skipJustifications: template.skipJustifications,
  }
}

/**
 * Format starting point for display
 */
function formatStartingPoint(startingPoint: UserContext['startingPoint']): string {
  const map: Record<UserContext['startingPoint'], string> = {
    'absolute-beginner': 'complete beginner',
    'basics': 'the basics',
    'one-language': 'one language',
    'junior': 'junior developer',
    'mid-level': 'mid-level developer',
    'senior-pivoting': 'senior developer (pivoting)',
  }
  return map[startingPoint] ?? startingPoint
}

/**
 * Enhance roadmap with AI (future: real AI, MVP: fallbacks)
 */
export async function enhanceRoadmapWithAI(
  roadmap: GeneratedRoadmap,
  userContext: UserContext
): Promise<RoadmapAIEnhancement> {
  // MVP: Use fallbacks
  // Phase 3+: Call real AI API here
  return applyFallbackEnhancement(userContext.targetRole, roadmap, userContext)
}
