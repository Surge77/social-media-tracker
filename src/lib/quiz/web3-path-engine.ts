// Web3 Path Quiz Engine — 5-question blockchain career advisor

import type { QuizAnswer, QuizQuestion, QuizRecommendation } from './types'

// ─── Questions ────────────────────────────────────────────────────────────────

export const WEB3_PATH_QUESTIONS: QuizQuestion[] = [
  {
    id: 'goal',
    type: 'single-select',
    question: 'What do you want to build in Web3?',
    description: 'This shapes which chain and language will serve you best.',
    required: true,
    options: [
      { value: 'defi',      label: 'DeFi protocol',            description: 'Lending, DEXes, yield strategies' },
      { value: 'nft-game',  label: 'NFT / Gaming',             description: 'Digital collectibles, on-chain games' },
      { value: 'infra',     label: 'Infrastructure / L2',      description: 'Bridges, rollups, dev tooling' },
      { value: 'dapp',      label: 'General dApp',             description: 'Web3 product or consumer app' },
    ],
  },
  {
    id: 'background',
    type: 'single-select',
    question: "What's your current programming background?",
    required: true,
    options: [
      { value: 'beginner',   label: 'Beginner',                description: 'Learning to code' },
      { value: 'web-dev',    label: 'JS / Python developer',   description: 'Comfortable with scripting languages' },
      { value: 'systems',    label: 'Systems developer',       description: 'Know C, C++, or Rust' },
      { value: 'solidity',   label: 'Already know Solidity',   description: 'Have shipped at least one smart contract' },
    ],
  },
  {
    id: 'ecosystem',
    type: 'single-select',
    question: 'Which ecosystem resonates with you?',
    description: "Your first chain matters — it shapes your mental model.",
    required: true,
    options: [
      { value: 'evm',       label: 'Ethereum / EVMs',         description: 'Largest ecosystem, most DeFi, most jobs' },
      { value: 'solana',    label: 'Solana',                  description: 'High throughput, growing NFT & DeFi scene' },
      { value: 'zk',        label: 'ZK / StarkNet',           description: 'Cutting-edge privacy and scaling research' },
      { value: 'no-pref',   label: 'No preference',           description: 'Help me decide based on my goals' },
    ],
  },
  {
    id: 'priority',
    type: 'single-select',
    question: 'What matters most to you right now?',
    required: true,
    options: [
      { value: 'jobs',      label: 'Getting hired',           description: 'Land a Web3 engineering role' },
      { value: 'startup',   label: 'Building a product',      description: 'Ship a protocol or dApp' },
      { value: 'research',  label: 'Cutting-edge research',   description: 'ZK proofs, formal verification, novel primitives' },
      { value: 'learn',     label: 'Understanding blockchain', description: 'Learn the fundamentals deeply' },
    ],
  },
  {
    id: 'timeline',
    type: 'single-select',
    question: 'How long are you willing to invest before shipping?',
    required: true,
    options: [
      { value: '1mo',  label: '< 1 month',   description: 'Fast prototyper, move quick' },
      { value: '3mo',  label: '1–3 months',  description: 'Willing to go deep' },
      { value: '6mo',  label: '3–6 months',  description: 'Building real production skills' },
      { value: 'open', label: 'No rush',      description: 'Long-term mastery' },
    ],
  },
]

// ─── Chain Profiles ───────────────────────────────────────────────────────────

interface ChainProfile {
  id:          string
  name:        string
  language:    string
  tooling:     string
  strengths:   string[]
  jobMarket:   'high' | 'medium' | 'low'
  difficulty:  'beginner' | 'intermediate' | 'advanced'
  techSlugs:   string[]  // links to /technologies pages
  roadmap:     string[]  // learning steps
}

export const CHAIN_PROFILES: Record<string, ChainProfile> = {
  ethereum: {
    id:        'ethereum',
    name:      'Ethereum (EVM)',
    language:  'Solidity',
    tooling:   'Foundry or Hardhat',
    strengths: [
      'Largest DeFi ecosystem by TVL',
      'Most Web3 job postings by a wide margin',
      'Battle-tested tooling (Foundry, Hardhat, wagmi)',
      'Massive developer community and auditing firms',
    ],
    jobMarket:  'high',
    difficulty: 'intermediate',
    techSlugs:  ['solidity', 'hardhat', 'foundry', 'wagmi'],
    roadmap: [
      'Complete CryptoZombies or Cyfrin Updraft (Week 1–2)',
      'Build a simple ERC-20 token with Hardhat (Week 3)',
      'Study OpenZeppelin contracts and security patterns (Week 4–5)',
      'Deploy to Sepolia testnet + write tests with Foundry (Week 6)',
      'Audit a small protocol on Code4rena to build portfolio',
    ],
  },
  solana: {
    id:        'solana',
    name:      'Solana',
    language:  'Rust (Anchor framework)',
    tooling:   'Anchor CLI, Solana CLI',
    strengths: [
      'Sub-second finality, near-zero fees',
      'Growing NFT and consumer app ecosystem',
      'Rust skills transfer to other systems work',
      'Strong VC investment and startup activity',
    ],
    jobMarket:  'medium',
    difficulty: 'advanced',
    techSlugs:  ['rust', 'anchor-framework'],
    roadmap: [
      'Learn Rust fundamentals via The Rust Book (Week 1–3)',
      'Complete Solana Developer Bootcamp by Rareskills (Week 4–5)',
      'Build a simple counter program with Anchor (Week 6)',
      'Deploy a token with Metaplex (Week 7–8)',
      'Build and ship a Solana NFT collection as portfolio piece',
    ],
  },
  starknet: {
    id:        'starknet',
    name:      'StarkNet (Cairo)',
    language:  'Cairo',
    tooling:   'Scarb, Starkli',
    strengths: [
      'Zero-knowledge proofs for maximum scalability',
      'Native account abstraction',
      'Ethereum-level security with L2 throughput',
      'Frontier research environment',
    ],
    jobMarket:  'low',
    difficulty: 'advanced',
    techSlugs:  ['cairo'],
    roadmap: [
      'Understand ZK fundamentals (zk-SNARK vs zk-STARK overview)',
      'Complete "The Cairo Book" — official language guide',
      'Write your first Cairo contract with Scarb',
      'Deploy on StarkNet testnet using Starkli',
      'Contribute to an open-source Cairo project for visibility',
    ],
  },
  polkadot: {
    id:        'polkadot',
    name:      'Polkadot (Substrate / ink!)',
    language:  'Rust + ink!',
    tooling:   'Substrate, cargo-contract',
    strengths: [
      'Cross-chain interoperability built-in',
      'Custom blockchain with Substrate',
      'Strong enterprise and government adoption in Asia/EU',
      'Rust skills transfer broadly',
    ],
    jobMarket:  'medium',
    difficulty: 'advanced',
    techSlugs:  ['rust', 'ink-lang'],
    roadmap: [
      'Learn Rust fundamentals (Week 1–3)',
      'Complete the Substrate Developer Hub tutorials',
      'Write a simple ink! smart contract',
      'Build a custom Substrate pallet',
      'Contribute to a Polkadot parachain project',
    ],
  },
}

// ─── Engine ───────────────────────────────────────────────────────────────────

interface Web3PathContext {
  goal:       string
  background: string
  ecosystem:  string
  priority:   string
  timeline:   string
}

function parseAnswers(answers: QuizAnswer[]): Web3PathContext {
  const get = (id: string) => (answers.find(a => a.questionId === id)?.value as string) ?? ''
  return {
    goal:       get('goal'),
    background: get('background'),
    ecosystem:  get('ecosystem'),
    priority:   get('priority'),
    timeline:   get('timeline'),
  }
}

/**
 * Score each chain profile against the user's context.
 * Higher = better match. Returns sorted (best first).
 */
export function selectPath(answers: QuizAnswer[]): { chain: ChainProfile; score: number }[] {
  const ctx = parseAnswers(answers)
  const chains = Object.values(CHAIN_PROFILES)

  const scored = chains.map((chain) => {
    let score = 0

    // Ecosystem preference
    if (ctx.ecosystem === 'evm'    && chain.id === 'ethereum')  score += 30
    if (ctx.ecosystem === 'solana' && chain.id === 'solana')    score += 30
    if (ctx.ecosystem === 'zk'     && chain.id === 'starknet')  score += 30
    if (ctx.ecosystem === 'no-pref') {
      // Boost ethereum slightly as default safest bet
      if (chain.id === 'ethereum') score += 10
    }

    // Goal alignment
    if (ctx.goal === 'defi') {
      if (chain.id === 'ethereum') score += 20
      if (chain.id === 'solana')   score += 10
    }
    if (ctx.goal === 'nft-game') {
      if (chain.id === 'solana')   score += 20
      if (chain.id === 'ethereum') score += 10
    }
    if (ctx.goal === 'infra') {
      if (chain.id === 'starknet')  score += 20
      if (chain.id === 'polkadot')  score += 15
    }
    if (ctx.goal === 'dapp') {
      if (chain.id === 'ethereum') score += 15
      if (chain.id === 'solana')   score += 10
    }

    // Background compatibility
    if (ctx.background === 'beginner' || ctx.background === 'web-dev') {
      if (chain.difficulty === 'intermediate') score += 15  // Solidity: best onramp
      if (chain.difficulty === 'advanced')     score -= 10  // Rust chains harder
    }
    if (ctx.background === 'systems') {
      if (chain.language.startsWith('Rust')) score += 20
    }
    if (ctx.background === 'solidity') {
      if (chain.id === 'ethereum') score += 15
      if (chain.id === 'starknet') score += 5  // ZK next step after Solidity
    }

    // Priority alignment
    if (ctx.priority === 'jobs') {
      if (chain.jobMarket === 'high')   score += 25
      if (chain.jobMarket === 'medium') score += 10
      if (chain.jobMarket === 'low')    score -= 10
    }
    if (ctx.priority === 'research') {
      if (chain.id === 'starknet')  score += 20
      if (chain.id === 'polkadot')  score += 10
    }
    if (ctx.priority === 'startup') {
      if (chain.id === 'solana')   score += 15  // faster iteration
      if (chain.id === 'ethereum') score += 10
    }
    if (ctx.priority === 'learn') {
      if (chain.id === 'ethereum') score += 10  // most learning resources
    }

    // Timeline: advanced chains take longer
    if (ctx.timeline === '1mo') {
      if (chain.difficulty === 'intermediate') score += 10
      if (chain.difficulty === 'advanced')     score -= 15
    }

    return { chain, score }
  })

  return scored.sort((a, b) => b.score - a.score)
}

/**
 * Build a full QuizRecommendation from quiz answers.
 */
export function computeWeb3PathRecommendation(answers: QuizAnswer[]): QuizRecommendation {
  const ctx = parseAnswers(answers)
  const ranked = selectPath(answers)
  const top = ranked[0]
  const alt = ranked[1]

  if (!top) {
    // Shouldn't happen — but safe fallback
    return {
      primary: {
        action: 'Start with Ethereum (Solidity)',
        technology: 'solidity',
        reasoning: [
          'Largest Web3 ecosystem and most job opportunities',
          'Extensive learning resources and developer community',
          'Best starting point for most Web3 career paths',
        ],
      },
      nextSteps: ['Complete CryptoZombies Solidity course', 'Build a simple ERC-20 token'],
      relatedLinks: [
        { label: 'Solidity trends →', href: '/technologies/solidity' },
        { label: 'Blockchain page →', href: '/blockchain' },
      ],
    }
  }

  const reasoning = buildReasoning(top.chain, ctx)
  const nextSteps = top.chain.roadmap.slice(0, 4)

  return {
    primary: {
      action:     `Start with ${top.chain.name} — learn ${top.chain.language}`,
      technology: top.chain.techSlugs[0],
      reasoning,
      score:      Math.min(100, top.score),
      timeline:   timelineLabel(ctx.timeline, top.chain),
    },
    secondary: alt
      ? {
          action:     `Alternative: ${alt.chain.name}`,
          technology: alt.chain.techSlugs[0],
          reasoning:  [alternativeReason(top.chain, alt.chain, ctx)],
        }
      : undefined,
    warnings:  buildWarnings(top.chain, ctx),
    nextSteps,
    relatedLinks: [
      ...top.chain.techSlugs.slice(0, 2).map((slug) => ({
        label: `${slug} trends →`,
        href:  `/technologies/${slug}`,
      })),
      { label: 'Blockchain market overview →', href: '/blockchain' },
      { label: 'Browse all tech →',            href: '/technologies' },
    ],
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildReasoning(chain: ChainProfile, ctx: Web3PathContext): string[] {
  const reasons: string[] = []

  // Reason 1: job / goal fit
  if (ctx.priority === 'jobs') {
    const jobLabel = chain.jobMarket === 'high' ? 'highest' : chain.jobMarket === 'medium' ? 'solid' : 'emerging'
    reasons.push(`${chain.name} has ${jobLabel} Web3 job demand — ${chain.language} is the most requested skill in that ecosystem`)
  } else if (ctx.goal === 'defi') {
    reasons.push(`${chain.name} commands the largest DeFi TVL, meaning more protocol opportunities and auditing work`)
  } else if (ctx.goal === 'nft-game') {
    reasons.push(`${chain.name} is the dominant chain for gaming and NFTs with a fast-growing creator economy`)
  } else {
    reasons.push(`${chain.name} matches your goal — ${chain.strengths[0].toLowerCase()}`)
  }

  // Reason 2: background fit
  if (ctx.background === 'systems') {
    if (chain.language.startsWith('Rust')) {
      reasons.push(`Your systems background is a direct advantage — Rust skills transfer immediately to ${chain.language}`)
    } else {
      reasons.push(`${chain.language} has a gentler learning curve than Rust, getting you shipping faster`)
    }
  } else if (ctx.background === 'web-dev') {
    if (chain.id === 'ethereum') {
      reasons.push(`Solidity syntax is similar to JavaScript — your web dev background means a shorter learning curve than most`)
    } else {
      reasons.push(`${chain.language} has a learning curve, but your scripting experience will accelerate the fundamentals`)
    }
  } else if (ctx.background === 'solidity') {
    reasons.push(`Your existing Solidity knowledge is directly transferable — focus on ${chain.tooling} to level up`)
  } else {
    reasons.push(`${chain.name} has strong beginner resources and the most community support for newcomers`)
  }

  // Reason 3: timeline fit
  const timeLabel = ctx.timeline === '1mo' ? 'fast' : ctx.timeline === '3mo' ? 'focused' : 'thorough'
  reasons.push(
    `At your ${timeLabel} pace, the roadmap below will get you from zero to deployed contract in a realistic timeline`
  )

  return reasons
}

function buildWarnings(chain: ChainProfile, ctx: Web3PathContext): string[] {
  const warns: string[] = []

  if (chain.difficulty === 'advanced' && ctx.background === 'beginner') {
    warns.push(`${chain.language} has a steep learning curve — consider learning basic programming fundamentals first`)
  }
  if (chain.jobMarket === 'low' && ctx.priority === 'jobs') {
    warns.push(`Job postings for ${chain.name} are limited today — pair this with Solidity skills to maximize hirability`)
  }
  if (ctx.timeline === '1mo' && chain.difficulty === 'advanced') {
    warns.push(`1 month is tight for ${chain.language} — budget 2–3 months for a solid foundation`)
  }

  return warns
}

function alternativeReason(primary: ChainProfile, alt: ChainProfile, ctx: Web3PathContext): string {
  if (alt.jobMarket === 'high' && primary.jobMarket !== 'high') {
    return `If job market size is a priority, ${alt.name} has more postings — worth considering alongside your first choice`
  }
  if (alt.id === 'ethereum') {
    return `${alt.name} is always a solid backup — most auditing firms and protocols are EVM-native`
  }
  return `${alt.name} is worth exploring after you've mastered ${primary.name}`
}

function timelineLabel(timeline: string, chain: ChainProfile): string {
  const weeksMap: Record<string, number> = { '1mo': 4, '3mo': 12, '6mo': 24, 'open': 32 }
  const weeks = weeksMap[timeline] ?? 12
  const difficultyMult = chain.difficulty === 'advanced' ? 1.5 : 1

  const adjusted = Math.round(weeks * difficultyMult)
  if (adjusted <= 4)  return `${adjusted} weeks`
  if (adjusted <= 16) return `${Math.round(adjusted / 4)} months`
  return `${Math.round(adjusted / 12)} year+`
}
