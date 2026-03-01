// ---- Re-exports from scoring/intelligence modules ----

export type { WeightProfile } from '@/lib/scoring/adaptive-weights'
export type {
  MomentumTrend,
  MomentumAnalysis,
} from '@/lib/scoring/enhanced-momentum'
export type {
  ConfidenceGrade,
  ConfidenceBreakdown,
} from '@/lib/scoring/confidence'
export type { TechSentimentResult } from '@/lib/intelligence/tech-sentiment'
export type { PromptSection } from '@/lib/ai/token-budget'
export type {
  LifecycleStage,
  LifecycleClassification,
} from '@/lib/analysis/lifecycle'

import type { LifecycleStage } from '@/lib/analysis/lifecycle'

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
  // Source 4: Extended package registries
  packagist_package: string | null
  rubygems_package: string | null
  nuget_package: string | null
  pubdev_package: string | null
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
  | 'blockchain'

export const CATEGORY_LABELS: Record<TechnologyCategory, string> = {
  language: 'Language',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps',
  cloud: 'Cloud',
  mobile: 'Mobile',
  ai_ml: 'AI/ML',
  blockchain: 'Blockchain',
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
  | 'rss' | 'jobs' | 'packages'
  | 'librariesio'                                      // Source 2
  | 'npms'                                             // Source 5
  | 'packagist' | 'rubygems' | 'nuget' | 'pubdev'     // Source 4
  | 'youtube'                                          // YouTube Data API v3

export type DataMetric =
  | 'stars' | 'forks' | 'open_issues' | 'contributors' | 'watchers'
  | 'mentions' | 'upvotes' | 'comments' | 'sentiment'
  | 'questions' | 'answer_rate' | 'views'
  | 'downloads' | 'dependents' | 'likes'
  | 'job_postings' | 'articles' | 'posts'
  | 'active_contributors' | 'commit_velocity' | 'closed_issues'             // Source 1
  | 'dependents_count' | 'dependent_repos_count' | 'sourcerank' | 'latest_release_age'  // Source 2
  | 'quality_score' | 'popularity_score' | 'maintenance_score'              // Source 5
  | 'yt_video_count' | 'yt_total_views' | 'yt_avg_likes'                   // YouTube metrics
  | 'yt_upload_velocity' | 'yt_top_videos'                                  // YouTube metrics

export interface DailyScore {
  id: number
  technology_id: string
  score_date: string // DATE string: "2026-01-15"
  composite_score: number
  github_score: number | null
  community_score: number | null
  jobs_score: number | null
  ecosystem_score: number | null
  onchain_score: number | null
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
  onchain_score: number | null
  momentum: number | null
  data_completeness: number | null
  sparkline: number[]
  previous_rank: number | null      // Rank 7 days ago
  rank_change: number | null        // Current rank - previous rank (positive = moved up)
  rank?: number | null              // Current rank among all scored techs
  ai_summary: string                // Generated honest one-liner
  confidence_grade?: string | null  // A-F confidence grade from scoring pipeline
  // Lifecycle classification (added by technologies API)
  lifecycle_stage?: LifecycleStage
  lifecycle_label?: string          // Human-readable: "Early Growth", "Mainstream Adoption", etc.
  // Raw signals (optional, added by compare API)
  github_stars?: number | null
  npm_downloads?: number | null
  so_questions?: number | null
  job_postings?: number | null
  hn_mentions?: number | null
}

export interface TechnologyDetail {
  technology: Technology
  current_scores: DailyScore | null
  chart_data: ChartDataPoint[]
  latest_signals: LatestSignals
  related_technologies: TechnologyWithScore[]
  rank?: number | null
  total_ranked?: number | null
  dimension_percentiles?: {
    github: number | null
    community: number | null
    jobs: number | null
    ecosystem: number | null
  } | null
  anomalies?: Array<{
    type: string
    severity: string
    metric: string
    deviationSigma: number
    explanation: string | null
  }>
}

export interface ChartDataPoint {
  date: string
  composite: number
  github: number | null
  community: number | null
  jobs: number | null
  ecosystem: number | null
}

export interface LatestSignals {
  github: {
    stars: number
    forks: number
    open_issues: number
    active_contributors?: number    // Source 1
    commit_velocity?: number        // Source 1 (avg commits/week, last 4 weeks)
  } | null
  hackernews: { mentions: number; avg_upvotes: number; sentiment: number; top_stories: HNStory[] } | null
  stackoverflow: { questions_30d: number; total_questions: number } | null
  npm: { weekly_downloads: number } | null
  reddit: { posts: number; avg_upvotes: number; sentiment: number } | null
  devto: { articles: number; reactions: number } | null
  jobs: { adzuna: number; jsearch: number; remotive: number; total: number } | null
  // Source 2: Libraries.io adoption signal
  librariesio: {
    dependents_count: number
    dependent_repos_count: number
    latest_release_age_days: number | null
  } | null
  // Source 4: Extended package registries (conditional by tech ecosystem)
  packagist: { monthly_downloads: number } | null
  rubygems: { total_downloads: number } | null
  nuget: { total_downloads: number } | null
  pubdev: { likes: number } | null
  // Source 5: npms.io quality dimensions (npm packages only)
  npms: {
    quality: number      // 0-1 code quality, tests, docs
    popularity: number   // 0-1 downloads, stars, dependents
    maintenance: number  // 0-1 release frequency, issue response
  } | null
  // YouTube Data API v3 — tutorial video signals
  youtube: {
    videoCount30d: number        // Tutorial videos published in last 30 days
    totalViews: number           // Aggregate views across top tutorial videos
    avgLikes: number             // Average likes per video
    uploadVelocity: number       // last7d videos minus prev7d videos (positive = accelerating)
    topVideos: YouTubeTopVideo[] // Top 3 tutorial + top 2 comparison videos
  } | null
}

export interface YouTubeTopVideo {
  videoId: string
  title: string
  channel: string
  views: number
  likes: number
  publishedAt: string
  thumbnail: string | null
  intent: 'tutorial' | 'comparison'
}

export interface HNStory {
  title: string
  url: string
  points: number
}

export interface CompareData {
  technologies: TechnologyWithScore[]
  chart_data: Array<Record<string, string | number>>
  lifecycle_data?: Record<string, {
    stage: string
    confidence: number
    reasoning: string[]
    daysInStage: number
    stageTransitionProbability: number
    previousStage?: string
  }>
  relationships?: Array<{
    source: string
    target: string
    type: string
    strength: number
  }>
}

// ---- Fetcher types ----

export interface FetcherResult {
  source: DataSource
  dataPoints: Omit<DataPoint, 'id' | 'created_at'>[]
  errors: string[]
}
