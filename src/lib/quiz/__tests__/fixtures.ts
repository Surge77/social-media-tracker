// Shared TechnologyWithScore fixtures for quiz engine integration tests

import type { TechnologyWithScore } from '@/types'

const baseFields = {
  description: '',
  ecosystem: null,
  website_url: null,
  github_repo: null,
  npm_package: null,
  pypi_package: null,
  crates_package: null,
  stackoverflow_tag: '',
  subreddit: null,
  devto_tag: null,
  aliases: [],
  first_appeared: null,
  maintained_by: null,
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  packagist_package: null,
  rubygems_package: null,
  nuget_package: null,
  pubdev_package: null,
  onchain_score: null,
  data_completeness: 0.9,
  sparkline: [],
  previous_rank: null,
  rank_change: null,
  rank: null,
  ai_summary: '',
  confidence_grade: 'B',
}

export const reactFixture: TechnologyWithScore = {
  ...baseFields,
  id: 'uuid-react',
  slug: 'react',
  name: 'React',
  category: 'frontend',
  color: '#61DAFB',
  composite_score: 80,
  github_score: 85,
  community_score: 90,
  jobs_score: 90,
  ecosystem_score: 88,
  momentum: 4,
}

export const vueFixture: TechnologyWithScore = {
  ...baseFields,
  id: 'uuid-vue',
  slug: 'vue',
  name: 'Vue',
  category: 'frontend',
  color: '#42B883',
  composite_score: 65,
  github_score: 70,
  community_score: 72,
  jobs_score: 60,
  ecosystem_score: 68,
  momentum: 2,
}

export const angularFixture: TechnologyWithScore = {
  ...baseFields,
  id: 'uuid-angular',
  slug: 'angular',
  name: 'Angular',
  category: 'frontend',
  color: '#DD0031',
  composite_score: 70,
  github_score: 72,
  community_score: 74,
  jobs_score: 75,
  ecosystem_score: 72,
  momentum: -1,
}

export const rustFixture: TechnologyWithScore = {
  ...baseFields,
  id: 'uuid-rust',
  slug: 'rust',
  name: 'Rust',
  category: 'language',
  color: '#DEA584',
  composite_score: 72,
  github_score: 78,
  community_score: 70,
  jobs_score: 45,
  ecosystem_score: 60,
  momentum: 8,
}

export const jqueryFixture: TechnologyWithScore = {
  ...baseFields,
  id: 'uuid-jquery',
  slug: 'jquery',
  name: 'jQuery',
  category: 'frontend',
  color: '#0769AD',
  composite_score: 25,
  github_score: 30,
  community_score: 40,
  jobs_score: 30,
  ecosystem_score: 28,
  momentum: -12,
}

// A frontend tech with high hype gap (community >> jobs) for hype-check tests
export const hypedTechFixture: TechnologyWithScore = {
  ...baseFields,
  id: 'uuid-hyped',
  slug: 'hyped-framework',
  name: 'HypedFramework',
  category: 'frontend',
  color: '#FF6B6B',
  composite_score: 55,
  github_score: 60,
  community_score: 90,
  jobs_score: 40,
  ecosystem_score: 50,
  momentum: 2, // low momentum despite high community score
}

// A fading tech (jobs > community, negative momentum)
export const fadingTechFixture: TechnologyWithScore = {
  ...baseFields,
  id: 'uuid-fading',
  slug: 'fading-tech',
  name: 'FadingTech',
  category: 'backend',
  color: '#888',
  composite_score: 40,
  github_score: 38,
  community_score: 30,
  jobs_score: 50,
  ecosystem_score: 35,
  momentum: -8,
}

// A balanced, real-deal tech
export const realDealFixture: TechnologyWithScore = {
  ...baseFields,
  id: 'uuid-real',
  slug: 'real-deal',
  name: 'RealDeal',
  category: 'backend',
  color: '#4CAF50',
  composite_score: 62,
  github_score: 65,
  community_score: 70,
  jobs_score: 65,
  ecosystem_score: 60,
  momentum: 7, // strong momentum + balanced gap + composite > 50 → 'real'
}

export const allFrontendFixtures = [reactFixture, vueFixture, angularFixture]
export const allFixtures = [reactFixture, vueFixture, angularFixture, rustFixture]
