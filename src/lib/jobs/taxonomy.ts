import type { Technology, TechnologyCategory } from '@/types'

export type CanonicalRoleSlug =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'mobile'
  | 'data'
  | 'ml-ai'
  | 'devops-platform'
  | 'security'
  | 'blockchain'

export interface CanonicalRole {
  slug: CanonicalRoleSlug
  label: string
  keywords: string[]
}

export const CANONICAL_ROLES: CanonicalRole[] = [
  { slug: 'frontend', label: 'Frontend', keywords: ['frontend', 'front-end', 'ui engineer', 'web ui', 'react developer', 'vue developer'] },
  { slug: 'backend', label: 'Backend', keywords: ['backend', 'back-end', 'api engineer', 'platform backend', 'server-side'] },
  { slug: 'fullstack', label: 'Full-Stack', keywords: ['fullstack', 'full-stack', 'full stack', 'product engineer'] },
  { slug: 'mobile', label: 'Mobile', keywords: ['mobile', 'android', 'ios', 'react native', 'flutter'] },
  { slug: 'data', label: 'Data', keywords: ['data engineer', 'analytics engineer', 'data platform', 'etl', 'warehouse'] },
  { slug: 'ml-ai', label: 'ML / AI', keywords: ['machine learning', 'ml engineer', 'ai engineer', 'llm', 'mlops'] },
  { slug: 'devops-platform', label: 'DevOps / Platform', keywords: ['devops', 'site reliability', 'sre', 'platform engineer', 'kubernetes', 'infrastructure'] },
  { slug: 'security', label: 'Security', keywords: ['security engineer', 'application security', 'cloud security', 'detection engineer'] },
  { slug: 'blockchain', label: 'Blockchain', keywords: ['blockchain', 'web3', 'solidity', 'smart contract', 'defi'] },
]

const TECHNOLOGY_SEARCH_OVERRIDES: Record<string, string[]> = {
  go: ['golang', 'go developer', 'go engineer'],
  rust: ['rust programming', 'rust developer', 'rust engineer'],
  r: ['r programming', 'r developer', 'r engineer'],
  bun: ['bun runtime', 'bun javascript'],
  c: ['c programming', 'c developer', 'c engineer'],
  '.net': ['dotnet', '.net', 'asp.net'],
  nextjs: ['next.js', 'nextjs'],
  'tailwind-css': ['tailwind css', 'tailwind'],
}

export const ADJACENT_SKILL_DICTIONARY: Array<{ slug: string; label: string; category: string; keywords: string[] }> = [
  { slug: 'typescript', label: 'TypeScript', category: 'language', keywords: ['typescript'] },
  { slug: 'javascript', label: 'JavaScript', category: 'language', keywords: ['javascript', 'js'] },
  { slug: 'python', label: 'Python', category: 'language', keywords: ['python'] },
  { slug: 'go', label: 'Go', category: 'language', keywords: ['golang', 'go developer', 'go engineer'] },
  { slug: 'rust', label: 'Rust', category: 'language', keywords: ['rust programming', 'rust developer'] },
  { slug: 'react', label: 'React', category: 'framework', keywords: ['react', 'reactjs'] },
  { slug: 'nextjs', label: 'Next.js', category: 'framework', keywords: ['next.js', 'nextjs'] },
  { slug: 'vue', label: 'Vue', category: 'framework', keywords: ['vue', 'vuejs'] },
  { slug: 'angular', label: 'Angular', category: 'framework', keywords: ['angular'] },
  { slug: 'nodejs', label: 'Node.js', category: 'runtime', keywords: ['node.js', 'nodejs', 'node developer'] },
  { slug: 'fastapi', label: 'FastAPI', category: 'framework', keywords: ['fastapi'] },
  { slug: 'django', label: 'Django', category: 'framework', keywords: ['django'] },
  { slug: 'postgresql', label: 'PostgreSQL', category: 'database', keywords: ['postgresql', 'postgres'] },
  { slug: 'mongodb', label: 'MongoDB', category: 'database', keywords: ['mongodb', 'mongo db'] },
  { slug: 'redis', label: 'Redis', category: 'database', keywords: ['redis'] },
  { slug: 'docker', label: 'Docker', category: 'devops', keywords: ['docker'] },
  { slug: 'kubernetes', label: 'Kubernetes', category: 'devops', keywords: ['kubernetes', 'k8s'] },
  { slug: 'terraform', label: 'Terraform', category: 'devops', keywords: ['terraform'] },
  { slug: 'aws', label: 'AWS', category: 'cloud', keywords: ['aws', 'amazon web services'] },
  { slug: 'gcp', label: 'Google Cloud', category: 'cloud', keywords: ['google cloud', 'gcp'] },
  { slug: 'azure', label: 'Azure', category: 'cloud', keywords: ['azure', 'microsoft azure'] },
  { slug: 'graphql', label: 'GraphQL', category: 'api', keywords: ['graphql'] },
  { slug: 'supabase', label: 'Supabase', category: 'platform', keywords: ['supabase'] },
  { slug: 'firebase', label: 'Firebase', category: 'platform', keywords: ['firebase'] },
  { slug: 'solidity', label: 'Solidity', category: 'blockchain', keywords: ['solidity', 'smart contract'] },
]

const CATEGORY_ROLE_HINTS: Record<TechnologyCategory, CanonicalRoleSlug> = {
  language: 'backend',
  frontend: 'frontend',
  backend: 'backend',
  database: 'backend',
  devops: 'devops-platform',
  cloud: 'devops-platform',
  mobile: 'mobile',
  ai_ml: 'ml-ai',
  blockchain: 'blockchain',
}

export function getTechnologySearchTerms(technology: Technology): string[] {
  const override = TECHNOLOGY_SEARCH_OVERRIDES[technology.slug]
  if (override) return override

  const aliasTerms = technology.aliases
    .filter(Boolean)
    .slice(0, 4)

  return [technology.name, ...aliasTerms]
}

export function inferRoleFromText(
  text: string,
  fallbackCategory?: TechnologyCategory | null
): CanonicalRole {
  const lower = text.toLowerCase()
  const matched = CANONICAL_ROLES.find((role) =>
    role.keywords.some((keyword) => lower.includes(keyword))
  )

  if (matched) return matched

  const fallbackSlug = fallbackCategory ? CATEGORY_ROLE_HINTS[fallbackCategory] : 'backend'
  return CANONICAL_ROLES.find((role) => role.slug === fallbackSlug) ?? CANONICAL_ROLES[1]
}

export function extractAdjacentSkills(text: string): Array<{
  slug: string
  label: string
  category: string
  confidence: number
}> {
  const lower = text.toLowerCase()
  return ADJACENT_SKILL_DICTIONARY
    .filter((entry) => entry.keywords.some((keyword) => lower.includes(keyword.toLowerCase())))
    .map((entry) => ({
      slug: entry.slug,
      label: entry.label,
      category: entry.category,
      confidence: 0.8,
    }))
}

export function slugifyText(value: string | null | undefined, fallback = 'unknown'): string {
  if (!value) return fallback
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || fallback
}
