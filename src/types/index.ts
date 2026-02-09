// ---- Core database types ----

export interface Technology {
  id: string
  slug: string
  name: string
  description: string
  category: TechnologyCategory
  ecosystem: string | null
  website_url: string | null
  github_repo: string | null
  npm_package: string | null
  pypi_package: string | null
  crates_package: string | null
  stackoverflow_tag: string
  subreddit: string | null
  devto_tag: string | null
  aliases: string[]
  color: string
  first_appeared: number | null
  maintained_by: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TechnologyCategory =
  | 'language'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'cloud'
  | 'mobile'
  | 'ai_ml'

export const CATEGORY_LABELS: Record<TechnologyCategory, string> = {
  language: 'Language',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps',
  cloud: 'Cloud',
  mobile: 'Mobile',
  ai_ml: 'AI/ML',
}

export interface DataPoint {
  id: number
  technology_id: string
  source: DataSource
  metric: DataMetric
  value: number
  metadata: Record<string, unknown>
  measured_at: string // DATE string: "2026-01-15"
  created_at: string
}

export type DataSource =
  | 'github' | 'hackernews' | 'stackoverflow' | 'npm' | 'pypi' | 'crates'
  | 'reddit' | 'devto' | 'adzuna' | 'jsearch' | 'remotive' | 'arbeitnow'
  | 'newsapi' | 'rss'

export type DataMetric =
  | 'stars' | 'forks' | 'open_issues' | 'contributors' | 'watchers'
  | 'mentions' | 'upvotes' | 'comments' | 'sentiment'
  | 'questions' | 'answer_rate' | 'views'
  | 'downloads' | 'dependents'
  | 'job_postings' | 'articles' | 'posts'

export interface DailyScore {
  id: number
  technology_id: string
  score_date: string // DATE string: "2026-01-15"
  composite_score: number
  github_score: number
  community_score: number
  jobs_score: number
  ecosystem_score: number
  momentum: number
  data_completeness: number
  raw_sub_scores: Record<string, unknown>
  computed_at: string
}

export interface FetchLog {
  id: number
  source: string
  status: 'success' | 'partial' | 'failed'
  technologies_processed: number
  data_points_created: number
  error_message: string | null
  duration_ms: number
  started_at: string
  completed_at: string | null
}

// ---- API response types ----

export interface TechnologyWithScore extends Technology {
  composite_score: number | null
  github_score: number | null
  community_score: number | null
  jobs_score: number | null
  ecosystem_score: number | null
  momentum: number | null
  data_completeness: number | null
  sparkline: number[]
}

export interface TechnologyDetail {
  technology: Technology
  current_scores: DailyScore | null
  chart_data: ChartDataPoint[]
  latest_signals: LatestSignals
  related_technologies: TechnologyWithScore[]
}

export interface ChartDataPoint {
  date: string
  composite: number
  github: number
  community: number
  jobs: number
  ecosystem: number
}

export interface LatestSignals {
  github: { stars: number; forks: number; open_issues: number } | null
  hackernews: { mentions: number; avg_upvotes: number; sentiment: number; top_stories: HNStory[] } | null
  stackoverflow: { questions_30d: number; total_questions: number } | null
  npm: { weekly_downloads: number } | null
  reddit: { posts: number; avg_upvotes: number; sentiment: number } | null
  devto: { articles: number; reactions: number } | null
  jobs: { adzuna: number; jsearch: number; remotive: number; total: number } | null
}

export interface HNStory {
  title: string
  url: string
  points: number
}

export interface CompareData {
  technologies: TechnologyWithScore[]
  chart_data: Array<Record<string, string | number>>
}

// ---- Fetcher types ----

export interface FetcherResult {
  source: DataSource
  dataPoints: Omit<DataPoint, 'id' | 'created_at'>[]
  errors: string[]
}
