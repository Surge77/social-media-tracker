const GITHUB_API_BASE = 'https://api.github.com'
const SO_API_BASE = 'https://api.stackexchange.com/2.3'

export interface LanguageStats {
  language: string
  github_repos_count: number
  stackoverflow_questions: number
  job_listings: number
}

export const TRACKED_LANGUAGES = [
  { name: 'JavaScript', soTag: 'javascript',   adzunaQuery: 'javascript developer' },
  { name: 'Python',     soTag: 'python',        adzunaQuery: 'python developer' },
  { name: 'Java',       soTag: 'java',          adzunaQuery: 'java developer' },
  { name: 'TypeScript', soTag: 'typescript',    adzunaQuery: 'typescript developer' },
  { name: 'C#',         soTag: 'c%23',          adzunaQuery: 'c# developer' },
  { name: 'C++',        soTag: 'c%2B%2B',       adzunaQuery: 'c++ developer' },
  { name: 'PHP',        soTag: 'php',           adzunaQuery: 'php developer' },
  { name: 'Go',         soTag: 'go',            adzunaQuery: 'golang developer' },
  { name: 'C',          soTag: 'c',             adzunaQuery: 'c programming developer' },
  { name: 'Swift',      soTag: 'swift',         adzunaQuery: 'swift developer' },
  { name: 'Kotlin',     soTag: 'kotlin',        adzunaQuery: 'kotlin developer' },
  { name: 'Ruby',       soTag: 'ruby',          adzunaQuery: 'ruby developer' },
  { name: 'Rust',       soTag: 'rust',          adzunaQuery: 'rust developer' },
  { name: 'Shell',      soTag: 'bash',          adzunaQuery: 'bash shell scripting' },
  { name: 'R',          soTag: 'r',             adzunaQuery: 'r programming developer' },
  { name: 'Scala',      soTag: 'scala',         adzunaQuery: 'scala developer' },
  { name: 'Dart',       soTag: 'dart',          adzunaQuery: 'dart flutter developer' },
  { name: 'Lua',        soTag: 'lua',           adzunaQuery: 'lua developer' },
  { name: 'Perl',       soTag: 'perl',          adzunaQuery: 'perl developer' },
  { name: 'Haskell',    soTag: 'haskell',       adzunaQuery: 'haskell developer' },
  { name: 'Elixir',     soTag: 'elixir',        adzunaQuery: 'elixir developer' },
  { name: 'Groovy',     soTag: 'groovy',        adzunaQuery: 'groovy developer' },
  { name: 'Julia',      soTag: 'julia',         adzunaQuery: 'julia programming developer' },
  { name: 'F#',         soTag: 'f%23',          adzunaQuery: 'f# developer' },
  { name: 'Clojure',    soTag: 'clojure',       adzunaQuery: 'clojure developer' },
  { name: 'Zig',           soTag: 'zig',           adzunaQuery: 'zig programming developer' },
  { name: 'Crystal',       soTag: 'crystal-lang',  adzunaQuery: 'crystal programming developer' },
  { name: 'Nim',           soTag: 'nim-lang',      adzunaQuery: 'nim programming developer' },
  { name: 'Objective-C',   soTag: 'objective-c',   adzunaQuery: 'objective-c ios developer' },
  { name: 'MATLAB',        soTag: 'matlab',         adzunaQuery: 'matlab developer' },
  { name: 'PowerShell',    soTag: 'powershell',     adzunaQuery: 'powershell developer' },
  { name: 'Assembly',      soTag: 'assembly',       adzunaQuery: 'assembly programmer' },
  { name: 'Erlang',        soTag: 'erlang',         adzunaQuery: 'erlang developer' },
  { name: 'OCaml',         soTag: 'ocaml',          adzunaQuery: 'ocaml developer' },
  { name: 'Prolog',        soTag: 'prolog',         adzunaQuery: 'prolog developer' },
  { name: 'Solidity',      soTag: 'solidity',       adzunaQuery: 'solidity smart contract developer' },
  { name: 'Fortran',       soTag: 'fortran',        adzunaQuery: 'fortran developer' },
  { name: 'Visual Basic',  soTag: 'vb.net',         adzunaQuery: 'visual basic vb.net developer' },
  { name: 'D',             soTag: 'd',              adzunaQuery: 'd programming developer' },
  { name: 'Ada',           soTag: 'ada',            adzunaQuery: 'ada programming developer' },
  { name: 'Tcl',           soTag: 'tcl',            adzunaQuery: 'tcl developer' },
  { name: 'COBOL',         soTag: 'cobol',          adzunaQuery: 'cobol developer' },
  { name: 'Racket',        soTag: 'racket',         adzunaQuery: 'racket scheme developer' },
  { name: 'Carbon',        soTag: 'carbon-lang',    adzunaQuery: 'carbon programming developer' },
  { name: 'Hack',          soTag: 'hacklang',       adzunaQuery: 'hack language developer' },
  { name: 'CoffeeScript',  soTag: 'coffeescript',   adzunaQuery: 'coffeescript developer' },
  { name: 'VHDL',          soTag: 'vhdl',           adzunaQuery: 'vhdl fpga developer' },
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchLanguageStats(
  lang: { name: string; soTag: string; adzunaQuery: string }
): Promise<LanguageStats> {
  const githubToken = process.env.GITHUB_TOKEN
  const soKey = process.env.STACKOVERFLOW_API_KEY
  const adzunaId = process.env.ADZUNA_APP_ID
  const adzunaKey = process.env.ADZUNA_API_KEY

  // GitHub repos count
  let github_repos_count = 0
  if (githubToken) {
    try {
      const r = await fetch(
        `${GITHUB_API_BASE}/search/repositories?q=language:${encodeURIComponent(lang.name)}&per_page=1`,
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      )
      if (r.ok) {
        const d = await r.json()
        github_repos_count = d.total_count ?? 0
      }
    } catch {}
  }

  await sleep(300)

  // Stack Overflow questions
  let stackoverflow_questions = 0
  if (soKey) {
    try {
      const r = await fetch(
        `${SO_API_BASE}/tags/${lang.soTag}/info?site=stackoverflow&key=${soKey}`
      )
      if (r.ok) {
        const d = await r.json()
        stackoverflow_questions = d.items?.[0]?.count ?? 0
      }
    } catch {}
  }

  await sleep(300)

  // Adzuna job listings
  let job_listings = 0
  if (adzunaId && adzunaKey) {
    try {
      const r = await fetch(
        `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${adzunaId}&app_key=${adzunaKey}&what=${encodeURIComponent(lang.adzunaQuery)}&results_per_page=1&content-type=application/json`
      )
      if (r.ok) {
        const d = await r.json()
        job_listings = d.count ?? 0
      }
    } catch {}
  }

  return { language: lang.name, github_repos_count, stackoverflow_questions, job_listings }
}

/**
 * Compute market share as a true weighted % across all tracked languages.
 * Formula: (gh_share% × 0.40) + (so_share% × 0.40) + (jobs_share% × 0.20)
 * All values across all languages sum to 100%.
 */
export function computeMarketShare(stats: LanguageStats[], current: LanguageStats): number {
  const totalGH   = stats.reduce((s, l) => s + l.github_repos_count, 0) || 1
  const totalSO   = stats.reduce((s, l) => s + l.stackoverflow_questions, 0) || 1
  const totalJobs = stats.reduce((s, l) => s + l.job_listings, 0) || 1

  const ghShare   = (current.github_repos_count / totalGH) * 100
  const soShare   = (current.stackoverflow_questions / totalSO) * 100
  const jobShare  = (current.job_listings / totalJobs) * 100

  return Math.round((ghShare * 0.4 + soShare * 0.4 + jobShare * 0.2) * 100) / 100
}

/** @deprecated use computeMarketShare */
export const computePopularityIndex = computeMarketShare
