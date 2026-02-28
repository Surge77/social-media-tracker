/**
 * Smart Contract Language Wars — aggregated signal
 * Sources: GitHub search (repo count), Stack Overflow (question count), jobs RSS (mention count)
 * Cached 24h — runs in cron batch or on-demand
 */

const GITHUB_API = 'https://api.github.com'
const SO_API = 'https://api.stackexchange.com/2.3'

export interface LanguageSignal {
  name: string
  vm: string
  color: string
  description: string
  github_repos: number      // active repos using this language (pushed in last 6mo)
  so_questions: number      // total SO question count for tag
  so_monthly: number        // SO questions in last 30 days
  job_mentions: number      // job posting mentions (from cron-stored data)
  npm_weekly: number        // weekly npm downloads for primary package (0 if no npm)
  npm_package: string | null
  composite_score: number   // normalized 0-100
}

const LANGUAGES = [
  {
    name: 'Solidity',
    vm: 'EVM',
    color: '#627EEA',
    description: 'Ethereum & EVM chains. Powers 95%+ of DeFi TVL.',
    githubLang: 'Solidity',
    soTag: 'solidity',
    npmPackage: 'hardhat',  // hardhat as proxy for Solidity tooling adoption
  },
  {
    name: 'Rust',
    vm: 'SVM / WASM',
    color: '#CE422B',
    description: 'Solana, Near, Polkadot. Performance-first smart contracts.',
    githubTopic: 'solana',  // use solana topic as blockchain-Rust proxy
    soTag: 'rust',
    npmPackage: '@solana/web3.js',
  },
  {
    name: 'Vyper',
    vm: 'EVM',
    color: '#2A9D8F',
    description: 'Pythonic alternative to Solidity. Used by Curve Finance.',
    githubLang: 'Vyper',
    soTag: 'vyper',
    npmPackage: null,
  },
  {
    name: 'Move',
    vm: 'MoveVM',
    color: '#0EA5E9',
    description: 'Aptos & Sui. Resource-oriented, designed for safety.',
    githubLang: 'Move',
    soTag: 'move-lang',
    npmPackage: null,
  },
  {
    name: 'Cairo',
    vm: 'Cairo VM',
    color: '#FF6B35',
    description: 'Starknet ZK-rollup. Provable computation language.',
    githubTopic: 'starknet',
    soTag: 'cairo-lang',
    npmPackage: null,
  },
]

const FRAMEWORK_REPOS = [
  { name: 'Foundry',  repo: 'foundry-rs/foundry',         color: '#E63946', ecosystem: 'EVM' },
  { name: 'Hardhat',  repo: 'NomicFoundation/hardhat',     color: '#FFC107', ecosystem: 'EVM' },
  { name: 'Anchor',   repo: 'coral-xyz/anchor',            color: '#9945FF', ecosystem: 'Solana' },
  { name: 'Truffle',  repo: 'trufflesuite/truffle',        color: '#5E4698', ecosystem: 'EVM' },
  { name: 'Brownie',  repo: 'eth-brownie/brownie',         color: '#8BC34A', ecosystem: 'EVM' },
]

export interface FrameworkSignal {
  name: string
  repo: string
  ecosystem: string
  color: string
  stars: number
  forks: number
  weeklyCommits: number
  openIssues: number
  lastPush: string
}

async function githubSearch(query: string, token: string): Promise<number> {
  try {
    // Add pushed filter for "active" repos only (last 6 months)
    const since = new Date(Date.now() - 180 * 86400_000).toISOString().split('T')[0]
    const q = `${query}+pushed:>${since}`
    const res = await fetch(
      `${GITHUB_API}/search/repositories?q=${encodeURIComponent(q)}&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return 0
    const data = await res.json()
    return data.total_count ?? 0
  } catch {
    return 0
  }
}

async function soQuestions(tag: string, apiKey: string): Promise<{ total: number; monthly: number }> {
  try {
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 86400

    const [totalRes, monthlyRes] = await Promise.all([
      fetch(
        `${SO_API}/tags/${encodeURIComponent(tag)}/info?site=stackoverflow&key=${apiKey}`,
        { next: { revalidate: 86400 } }
      ),
      fetch(
        `${SO_API}/search/advanced?q=${encodeURIComponent(tag)}&tagged=${encodeURIComponent(tag)}&fromdate=${thirtyDaysAgo}&site=stackoverflow&key=${apiKey}&pagesize=1`,
        { next: { revalidate: 86400 } }
      ),
    ])

    let total = 0
    let monthly = 0

    if (totalRes.ok) {
      const d = await totalRes.json()
      total = d.items?.[0]?.count ?? 0
    }
    if (monthlyRes.ok) {
      const d = await monthlyRes.json()
      monthly = d.total ?? 0
    }

    return { total, monthly }
  } catch {
    return { total: 0, monthly: 0 }
  }
}

async function npmWeeklyDownloads(pkg: string): Promise<number> {
  if (!pkg) return 0
  try {
    const res = await fetch(
      `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return 0
    const data = await res.json()
    return data.downloads ?? 0
  } catch {
    return 0
  }
}

async function fetchRepoStats(repoPath: string, token: string): Promise<{
  stars: number; forks: number; openIssues: number; lastPush: string
}> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${repoPath}`, {
      headers: { Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return { stars: 0, forks: 0, openIssues: 0, lastPush: '' }
    const d = await res.json()
    return {
      stars: d.stargazers_count ?? 0,
      forks: d.forks_count ?? 0,
      openIssues: d.open_issues_count ?? 0,
      lastPush: d.pushed_at ?? '',
    }
  } catch {
    return { stars: 0, forks: 0, openIssues: 0, lastPush: '' }
  }
}

function normalize(value: number, max: number): number {
  if (max === 0) return 0
  return Math.min(100, Math.round((value / max) * 100))
}

export async function fetchLanguageWarsData(): Promise<LanguageSignal[]> {
  const token = process.env.GITHUB_TOKEN ?? ''
  const soKey = process.env.STACKOVERFLOW_API_KEY ?? ''

  const results = await Promise.allSettled(
    LANGUAGES.map(async (lang) => {
      const query = lang.githubLang
        ? `language:${lang.githubLang}`
        : `topic:${lang.githubTopic}`

      const [repoCount, soData, npmDownloads] = await Promise.all([
        githubSearch(query, token),
        soQuestions(lang.soTag, soKey),
        lang.npmPackage ? npmWeeklyDownloads(lang.npmPackage) : Promise.resolve(0),
      ])

      return {
        name: lang.name,
        vm: lang.vm,
        color: lang.color,
        description: lang.description,
        github_repos: repoCount,
        so_questions: soData.total,
        so_monthly: soData.monthly,
        job_mentions: 0, // populated from cron-stored data
        npm_weekly: npmDownloads,
        npm_package: lang.npmPackage,
        composite_score: 0, // computed after all data is collected
      } satisfies Omit<LanguageSignal, 'composite_score'> & { composite_score: number }
    })
  )

  const signals: LanguageSignal[] = results
    .filter((r): r is PromiseFulfilledResult<LanguageSignal> => r.status === 'fulfilled')
    .map((r) => r.value)

  // Compute composite score: normalize each metric to 0-100 vs the max, then weight
  const maxRepos  = Math.max(...signals.map((s) => s.github_repos), 1)
  const maxSo     = Math.max(...signals.map((s) => s.so_questions), 1)
  const maxNpm    = Math.max(...signals.map((s) => s.npm_weekly), 1)

  for (const s of signals) {
    const repoScore = normalize(s.github_repos, maxRepos)
    const soScore   = normalize(s.so_questions, maxSo)
    const npmScore  = normalize(s.npm_weekly, maxNpm)
    // Weighted: GitHub 40%, SO 40%, npm 20%
    s.composite_score = Math.round(repoScore * 0.4 + soScore * 0.4 + npmScore * 0.2)
  }

  return signals.sort((a, b) => b.composite_score - a.composite_score)
}

export async function fetchFrameworkAdoption(): Promise<FrameworkSignal[]> {
  const token = process.env.GITHUB_TOKEN ?? ''

  const results = await Promise.allSettled(
    FRAMEWORK_REPOS.map(async (f) => {
      const stats = await fetchRepoStats(f.repo, token)

      // Get recent commit activity (last 4 weeks)
      let weeklyCommits = 0
      try {
        const res = await fetch(`${GITHUB_API}/repos/${f.repo}/stats/participation`, {
          headers: { Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' },
          next: { revalidate: 86400 },
        })
        if (res.ok) {
          const d = await res.json()
          const allWeeks: number[] = d.all ?? []
          weeklyCommits = allWeeks.slice(-4).reduce((sum, n) => sum + n, 0)
        }
      } catch { /* ignore */ }

      return {
        name: f.name,
        repo: f.repo,
        ecosystem: f.ecosystem,
        color: f.color,
        stars: stats.stars,
        forks: stats.forks,
        weeklyCommits,
        openIssues: stats.openIssues,
        lastPush: stats.lastPush,
      } satisfies FrameworkSignal
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<FrameworkSignal> => r.status === 'fulfilled')
    .map((r) => r.value)
    .sort((a, b) => b.stars - a.stars)
}
