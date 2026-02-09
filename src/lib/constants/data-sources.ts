// ================================================================
// DevTrends — All Data Sources (Public + Authenticated)
// ================================================================
// This file defines every source DevTrends pulls data from.
//
// PUBLIC sources (RSS feeds, keyless APIs) are defined here as
// constants because they don't contain secrets.
//
// AUTHENTICATED sources reference env vars for their keys but
// define base URLs and config here.
// ================================================================

// --------------------------------------------------
// 1. RSS FEEDS (No auth, no rate limits, unlimited free data)
// --------------------------------------------------
// These are the backbone of real-time content tracking.
// Parse with a library like 'rss-parser' (npm install rss-parser).

export const RSS_FEEDS = {
  // --- Tech News (General) ---
  techcrunch: {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'news',
    frequency: 'hourly',
    description: 'Major tech news, startup funding, product launches',
  },
  theVerge: {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'news',
    frequency: 'hourly',
    description: 'Tech news, reviews, consumer tech trends',
  },
  arstechnica: {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'news',
    frequency: 'hourly',
    description: 'Deep tech analysis, security, science',
  },
  wired: {
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: 'news',
    frequency: 'hourly',
    description: 'Technology culture, business, science',
  },

  // --- Developer-Specific News ---
  hackerNews: {
    name: 'Hacker News (Best)',
    url: 'https://hnrss.org/best',
    category: 'developer',
    frequency: 'hourly',
    description: 'Top stories from HN — filtered for quality',
  },
  hackerNewsFrontpage: {
    name: 'Hacker News (Front Page)',
    url: 'https://hnrss.org/frontpage',
    category: 'developer',
    frequency: 'hourly',
    description: 'Current HN front page stories',
  },
  hackerNewsShowHN: {
    name: 'Hacker News (Show HN)',
    url: 'https://hnrss.org/show',
    category: 'developer',
    frequency: 'daily',
    description: 'New projects/tools developers are building',
  },
  lobsters: {
    name: 'Lobste.rs',
    url: 'https://lobste.rs/rss',
    category: 'developer',
    frequency: 'hourly',
    description: 'Curated tech links, strong programming focus',
  },
  echojs: {
    name: 'Echo JS',
    url: 'https://www.echojs.com/rss',
    category: 'developer',
    frequency: 'daily',
    description: 'JavaScript-focused community news',
  },
  changelog: {
    name: 'The Changelog',
    url: 'https://changelog.com/feed',
    category: 'developer',
    frequency: 'daily',
    description: 'Open source news, developer interviews',
  },
  infoq: {
    name: 'InfoQ',
    url: 'https://feed.infoq.com/',
    category: 'developer',
    frequency: 'daily',
    description: 'Enterprise software, architecture, practices',
  },

  // --- Developer Blogs / Tutorials ---
  devTo: {
    name: 'DEV.to (Top)',
    url: 'https://dev.to/feed',
    category: 'blogs',
    frequency: 'hourly',
    description: 'Community blog posts, tutorials, discussions',
  },
  hashnode: {
    name: 'Hashnode',
    url: 'https://hashnode.com/n/general-programming/rss',
    category: 'blogs',
    frequency: 'daily',
    description: 'Developer blog platform, tutorials',
  },
  freecodecamp: {
    name: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/news/rss/',
    category: 'blogs',
    frequency: 'daily',
    description: 'Programming tutorials, career advice',
  },
  smashingMagazine: {
    name: 'Smashing Magazine',
    url: 'https://www.smashingmagazine.com/feed/',
    category: 'blogs',
    frequency: 'daily',
    description: 'Frontend development, design, UX',
  },
  cssTriks: {
    name: 'CSS-Tricks',
    url: 'https://css-tricks.com/feed/',
    category: 'blogs',
    frequency: 'daily',
    description: 'CSS, frontend tips and techniques',
  },

  // --- Weekly Newsletters (as RSS) ---
  // These are gold for tracking what the community considers important.
  javascriptWeekly: {
    name: 'JavaScript Weekly',
    url: 'https://javascriptweekly.com/rss/',
    category: 'newsletters',
    frequency: 'weekly',
    description: 'Curated JS news — what editors think matters',
  },
  nodeWeekly: {
    name: 'Node Weekly',
    url: 'https://nodeweekly.com/rss/',
    category: 'newsletters',
    frequency: 'weekly',
    description: 'Node.js ecosystem news',
  },
  reactStatus: {
    name: 'React Status',
    url: 'https://react.statuscode.com/rss/',
    category: 'newsletters',
    frequency: 'weekly',
    description: 'React ecosystem updates',
  },
  golangWeekly: {
    name: 'Golang Weekly',
    url: 'https://golangweekly.com/rss/',
    category: 'newsletters',
    frequency: 'weekly',
    description: 'Go language community news',
  },
  rustWeekly: {
    name: 'This Week in Rust',
    url: 'https://this-week-in-rust.org/rss.xml',
    category: 'newsletters',
    frequency: 'weekly',
    description: 'Rust ecosystem updates, official',
  },
  pythonWeekly: {
    name: 'Python Weekly',
    url: 'https://www.pythonweekly.com/rss/uJZ5SJbAAg',
    category: 'newsletters',
    frequency: 'weekly',
    description: 'Python ecosystem news',
  },
  dbWeekly: {
    name: 'DB Weekly',
    url: 'https://dbweekly.com/rss/',
    category: 'newsletters',
    frequency: 'weekly',
    description: 'Database news across all engines',
  },
  devopsWeekly: {
    name: 'DevOps Weekly',
    url: 'https://www.devopsweekly.com/rss.xml',
    category: 'newsletters',
    frequency: 'weekly',
    description: 'DevOps tools, practices, infrastructure',
  },

  // --- Company Engineering Blogs ---
  // Track what big companies are actually using in production.
  netflixTech: {
    name: 'Netflix Tech Blog',
    url: 'https://netflixtechblog.com/feed',
    category: 'engineering',
    frequency: 'weekly',
    description: 'Netflix engineering — Java, microservices, data',
  },
  uberEngineering: {
    name: 'Uber Engineering',
    url: 'https://www.uber.com/en-US/blog/engineering/rss/',
    category: 'engineering',
    frequency: 'weekly',
    description: 'Uber engineering — Go, Java, ML',
  },
  githubBlog: {
    name: 'GitHub Blog (Engineering)',
    url: 'https://github.blog/engineering/feed/',
    category: 'engineering',
    frequency: 'weekly',
    description: 'GitHub engineering — Ruby, Go, infrastructure',
  },
  vercelBlog: {
    name: 'Vercel Blog',
    url: 'https://vercel.com/atom',
    category: 'engineering',
    frequency: 'weekly',
    description: 'Next.js, edge computing, frontend infrastructure',
  },
  stripeBlog: {
    name: 'Stripe Engineering',
    url: 'https://stripe.com/blog/engineering/feed.rss',
    category: 'engineering',
    frequency: 'weekly',
    description: 'Stripe engineering — Ruby, API design',
  },
} as const

export type RSSFeedKey = keyof typeof RSS_FEEDS


// --------------------------------------------------
// 2. PUBLIC APIs (No authentication required)
// --------------------------------------------------
// These APIs are free and keyless. Rate limits are generous.

export const PUBLIC_APIS = {
  // --- Hacker News (Firebase + Algolia) ---
  hackerNewsFirebase: {
    name: 'Hacker News (Official Firebase)',
    baseUrl: 'https://hacker-news.firebaseio.com/v0',
    docs: 'https://github.com/HackerNews/API',
    rateLimit: 'No hard limit, be reasonable',
    endpoints: {
      topStories: '/topstories.json',
      newStories: '/newstories.json',
      bestStories: '/beststories.json',
      showStories: '/showstories.json',
      askStories: '/askstories.json',
      item: '/item/{id}.json',
      user: '/user/{id}.json',
    },
    description: 'Official HN API. Returns IDs, need to fetch items individually.',
  },
  hackerNewsAlgolia: {
    name: 'Hacker News (Algolia Search)',
    baseUrl: 'https://hn.algolia.com/api/v1',
    docs: 'https://hn.algolia.com/api',
    rateLimit: 'No hard limit (10,000+/day is fine)',
    endpoints: {
      search: '/search',          // by relevance
      searchByDate: '/search_by_date', // by date
      item: '/items/{id}',
    },
    description: 'Full-text search across HN. Best for finding tech mentions.',
  },

  // --- Dev.to (works without key) ---
  devTo: {
    name: 'DEV.to',
    baseUrl: 'https://dev.to/api',
    docs: 'https://developers.forem.com/api/v1',
    rateLimit: '30 req/30s (no key), higher with key',
    endpoints: {
      articles: '/articles',
      articlesByTag: '/articles?tag={tag}',
      tags: '/tags',
      podcast_episodes: '/podcast_episodes',
    },
    description: 'Blog posts, tags, and engagement metrics.',
  },

  // --- Remotive (Remote Jobs) ---
  remotive: {
    name: 'Remotive',
    baseUrl: 'https://remotive.com/api',
    docs: 'https://remotive.com/api-documentation',
    rateLimit: 'No hard limit',
    endpoints: {
      jobs: '/remote-jobs',
      jobsByCategory: '/remote-jobs?category=software-dev',
    },
    description: 'Remote tech job listings. Free, no key.',
  },

  // --- Arbeitnow (Tech Jobs) ---
  arbeitnow: {
    name: 'Arbeitnow',
    baseUrl: 'https://www.arbeitnow.com/api',
    docs: 'https://documenter.getpostman.com/view/18545278/UVJbJdKh',
    rateLimit: 'No hard limit',
    endpoints: {
      jobs: '/job-board-api',
    },
    description: 'Tech job board, GitHub Jobs spiritual successor.',
  },

  // --- Lobste.rs ---
  lobsters: {
    name: 'Lobste.rs',
    baseUrl: 'https://lobste.rs',
    docs: 'https://lobste.rs/about',
    rateLimit: 'Be reasonable',
    endpoints: {
      newest: '/newest.json',
      hottest: '/hottest.json',
      active: '/active.json',
      taggedStories: '/t/{tag}.json',
    },
    description: 'Curated tech links. Smaller than HN, higher signal-to-noise.',
  },

  // --- Product Hunt (limited without OAuth) ---
  productHunt: {
    name: 'Product Hunt',
    baseUrl: 'https://api.producthunt.com/v2/api/graphql',
    docs: 'https://api.producthunt.com/v2/docs',
    rateLimit: '450 req/15min with token',
    endpoints: {
      graphql: '/',
    },
    description: 'New products/tools. GraphQL API. OAuth needed for full access, but trending page scrapable.',
  },
} as const


// --------------------------------------------------
// 3. PACKAGE REGISTRY APIs (No auth, free, critical for adoption metrics)
// --------------------------------------------------
// These track REAL adoption — actual downloads, not just hype.

export const PACKAGE_REGISTRIES = {
  npm: {
    name: 'npm Registry',
    baseUrl: 'https://registry.npmjs.org',
    statsUrl: 'https://api.npmjs.org',
    docs: 'https://github.com/npm/registry/blob/main/docs/REGISTRY-API.md',
    rateLimit: 'No hard limit for public data',
    endpoints: {
      packageInfo: '/{package}',                              // metadata, versions, maintainers
      downloadCounts: '/downloads/point/{period}/{package}',  // period: last-day, last-week, last-month, last-year
      downloadRange: '/downloads/range/{start}:{end}/{package}',  // daily breakdown
      search: '/-/v1/search?text={query}',                   // search packages
    },
    ecosystem: 'JavaScript / TypeScript',
    description: 'The single best metric for JS ecosystem adoption. Downloads = real usage.',
  },

  npms: {
    name: 'npms.io (npm Package Scoring)',
    baseUrl: 'https://api.npms.io/v2',
    docs: 'https://api-docs.npms.io/',
    rateLimit: 'No hard limit',
    endpoints: {
      packageScore: '/package/{package}',      // quality, popularity, maintenance scores
      search: '/search?q={query}',
      searchSuggestions: '/search/suggestions?q={query}',
      multiPackage: '/package/mget',           // POST: bulk package info
    },
    ecosystem: 'JavaScript / TypeScript',
    description: 'Pre-computed quality/popularity/maintenance scores for npm packages.',
  },

  pypi: {
    name: 'PyPI (Python Package Index)',
    baseUrl: 'https://pypi.org',
    statsUrl: 'https://pypistats.org/api',
    docs: 'https://warehouse.pypa.io/api-reference/',
    rateLimit: 'No hard limit',
    endpoints: {
      packageInfo: '/pypi/{package}/json',                  // metadata, versions, downloads
      downloadStats: '/packages/{package}/recent',          // via pypistats.org
      downloadTimeSeries: '/packages/{package}/overall',    // via pypistats.org
    },
    ecosystem: 'Python',
    description: 'Python package metadata. Use pypistats.org for download counts.',
  },

  cratesIo: {
    name: 'crates.io (Rust Package Registry)',
    baseUrl: 'https://crates.io/api/v1',
    docs: 'https://crates.io/policies',
    rateLimit: '1 req/sec',
    endpoints: {
      crateInfo: '/crates/{crate}',
      crateDownloads: '/crates/{crate}/downloads',
      search: '/crates?q={query}',
      summary: '/summary',                      // top crates, new crates, most downloaded
    },
    ecosystem: 'Rust',
    description: 'Rust package registry. Downloads, dependents, version history.',
  },

  packagist: {
    name: 'Packagist (PHP Package Registry)',
    baseUrl: 'https://packagist.org',
    docs: 'https://packagist.org/apidoc',
    rateLimit: 'No hard limit',
    endpoints: {
      packageInfo: '/packages/{vendor}/{package}.json',
      search: '/search.json?q={query}',
      stats: '/statistics.json',
    },
    ecosystem: 'PHP',
    description: 'PHP/Composer ecosystem metrics.',
  },

  rubyGems: {
    name: 'RubyGems.org',
    baseUrl: 'https://rubygems.org/api/v1',
    docs: 'https://guides.rubygems.org/rubygems-org-api/',
    rateLimit: 'No hard limit',
    endpoints: {
      gemInfo: '/gems/{gem}.json',
      search: '/search.json?query={query}',
      downloads: '/downloads/{gem}.json',
      mostDownloaded: '/downloads/top.json',
    },
    ecosystem: 'Ruby',
    description: 'Ruby gem download counts and metadata.',
  },

  nuget: {
    name: 'NuGet (.NET Package Registry)',
    baseUrl: 'https://api.nuget.org/v3',
    docs: 'https://learn.microsoft.com/en-us/nuget/api/overview',
    rateLimit: 'No hard limit',
    endpoints: {
      search: '/registration5-gz-semver2/{package}/index.json',
      searchQuery: 'https://azuresearch-usnc.nuget.org/query?q={query}',
    },
    ecosystem: '.NET / C#',
    description: '.NET ecosystem package metrics.',
  },

  pubDev: {
    name: 'pub.dev (Dart/Flutter)',
    baseUrl: 'https://pub.dev/api',
    docs: 'https://pub.dev/help/api',
    rateLimit: 'No hard limit',
    endpoints: {
      packageInfo: '/packages/{package}',
      packageScore: '/packages/{package}/score',
      search: '/search?q={query}',
    },
    ecosystem: 'Dart / Flutter',
    description: 'Dart/Flutter ecosystem adoption metrics.',
  },

  goProxy: {
    name: 'Go Module Proxy',
    baseUrl: 'https://proxy.golang.org',
    docs: 'https://go.dev/ref/mod#module-proxy-protocol',
    rateLimit: 'No hard limit',
    endpoints: {
      moduleVersions: '/{module}/@v/list',
      moduleInfo: '/{module}/@v/{version}.info',
    },
    ecosystem: 'Go',
    description: 'Go module version info. For download stats, use pkg.go.dev.',
  },
} as const


// --------------------------------------------------
// 4. AUTHENTICATED APIs (keys in .env.local)
// --------------------------------------------------
// Base URLs and config only — secrets stay in env vars.

export const AUTHENTICATED_APIS = {
  github: {
    name: 'GitHub API',
    baseUrl: 'https://api.github.com',
    docs: 'https://docs.github.com/en/rest',
    rateLimit: '5,000 req/hr with PAT, 60/hr without',
    envKey: 'GITHUB_TOKEN',
    endpoints: {
      searchRepos: '/search/repositories',
      repoInfo: '/repos/{owner}/{repo}',
      repoStats: '/repos/{owner}/{repo}/stats/contributors',
      repoTraffic: '/repos/{owner}/{repo}/traffic/views',    // requires push access
      trending: '/search/repositories?q=created:>{date}&sort=stars&order=desc',
      languageStats: '/search/repositories?q=language:{lang}&sort=stars',
    },
    description: 'Stars, forks, contributors, issues, language stats.',
  },

  stackoverflow: {
    name: 'Stack Overflow API',
    baseUrl: 'https://api.stackexchange.com/2.3',
    docs: 'https://api.stackexchange.com/docs',
    rateLimit: '10,000 req/day with key, 300/day without',
    envKey: 'STACKOVERFLOW_API_KEY',
    endpoints: {
      search: '/search/advanced',
      tags: '/tags',
      tagInfo: '/tags/{tag}/info',
      tagWikis: '/tags/{tags}/wikis',
      tagSynonyms: '/tags/{tag}/synonyms',
      questions: '/questions',
      questionsByTag: '/questions?tagged={tag}&sort=activity',
    },
    description: 'Question volume, answer rates, tag popularity over time.',
  },

  reddit: {
    name: 'Reddit API',
    baseUrl: 'https://oauth.reddit.com',
    authUrl: 'https://www.reddit.com/api/v1/access_token',
    docs: 'https://www.reddit.com/dev/api/',
    rateLimit: '60 req/min with OAuth',
    envKeys: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USER_AGENT'],
    subreddits: [
      'programming',
      'webdev',
      'javascript',
      'reactjs',
      'typescript',
      'rust',
      'golang',
      'python',
      'devops',
      'node',
      'nextjs',
      'sveltejs',
      'vuejs',
      'cscareerquestions',
      'experienceddevs',
      'learnprogramming',
    ],
    endpoints: {
      subredditHot: '/r/{subreddit}/hot',
      subredditNew: '/r/{subreddit}/new',
      subredditTop: '/r/{subreddit}/top?t={period}',  // hour, day, week, month, year
      search: '/search?q={query}&type=link',
    },
    description: 'Community discussions, sentiment, technology mentions.',
  },

  newsapi: {
    name: 'NewsAPI',
    baseUrl: 'https://newsapi.org/v2',
    docs: 'https://newsapi.org/docs',
    rateLimit: '100 req/day (free dev), paid for production',
    envKey: 'NEWSAPI_KEY',
    endpoints: {
      everything: '/everything',
      topHeadlines: '/top-headlines',
      sources: '/top-headlines/sources',
    },
    description: 'Tech news articles. Free dev tier is fine for data collection.',
  },

  adzuna: {
    name: 'Adzuna',
    baseUrl: 'https://api.adzuna.com/v1/api/jobs',
    docs: 'https://developer.adzuna.com/overview',
    rateLimit: '250 req/month (free tier)',
    envKeys: ['ADZUNA_APP_ID', 'ADZUNA_API_KEY'],
    endpoints: {
      search: '/{country}/search/{page}',
      histogram: '/{country}/histogram',         // salary distribution
      top_companies: '/{country}/top_companies',
      categories: '/{country}/categories',
    },
    countries: ['us', 'gb', 'de', 'fr', 'au', 'ca', 'in'],
    description: 'Job postings with salary data across countries.',
  },

  jsearch: {
    name: 'JSearch (RapidAPI)',
    baseUrl: 'https://jsearch.p.rapidapi.com',
    docs: 'https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch',
    rateLimit: '500 req/month (free tier)',
    envKey: 'RAPIDAPI_KEY',
    endpoints: {
      search: '/search',
      details: '/job-details',
      estimated_salary: '/estimated-salary',
    },
    description: 'Aggregated job data from LinkedIn, Indeed, Glassdoor, etc.',
  },

  librariesIo: {
    name: 'Libraries.io',
    baseUrl: 'https://libraries.io/api',
    docs: 'https://libraries.io/api',
    rateLimit: '60 req/min with key',
    envKey: 'LIBRARIESIO_API_KEY',
    endpoints: {
      platformPackage: '/{platform}/{name}',
      packageDependents: '/{platform}/{name}/dependents',
      packageSourceRank: '/{platform}/{name}/sourcerank',
      search: '/search?q={query}',
    },
    platforms: ['npm', 'pypi', 'rubygems', 'cargo', 'nuget', 'packagist', 'go', 'pub'],
    description: 'Cross-platform package dependency tracking. SourceRank = quality metric.',
  },
} as const


// --------------------------------------------------
// 5. SUPPLEMENTARY DATA SOURCES (Scraping targets / periodic checks)
// --------------------------------------------------
// These don't have APIs but contain valuable data.
// Use sparingly, respect robots.txt, cache aggressively.

export const SUPPLEMENTARY_SOURCES = {
  githubTrending: {
    name: 'GitHub Trending',
    url: 'https://github.com/trending',
    urlByLanguage: 'https://github.com/trending/{language}?since={period}',
    periods: ['daily', 'weekly', 'monthly'],
    method: 'scrape',
    frequency: 'daily',
    description: 'Daily/weekly/monthly trending repos by language. No API — scrape or use community mirrors.',
  },
  stateOfJs: {
    name: 'State of JS Survey',
    url: 'https://stateofjs.com',
    dataUrl: 'https://api.stateofjs.com/graphql',
    method: 'api',
    frequency: 'yearly',
    description: 'Annual developer survey. Satisfaction, usage, awareness data.',
  },
  stackOverflowTrends: {
    name: 'Stack Overflow Trends',
    url: 'https://insights.stackoverflow.com/trends',
    method: 'scrape',
    frequency: 'weekly',
    description: 'Visual tag trend data. Complements API data.',
  },
  tiobe: {
    name: 'TIOBE Index',
    url: 'https://www.tiobe.com/tiobe-index/',
    method: 'scrape',
    frequency: 'monthly',
    description: 'Language popularity ranking. Good for validation.',
  },
  redmonk: {
    name: 'RedMonk Language Rankings',
    url: 'https://redmonk.com/rstephens/category/top20/',
    method: 'scrape',
    frequency: 'biannual',
    description: 'GitHub + SO cross-reference ranking. Industry standard.',
  },
  developerSurvey: {
    name: 'Stack Overflow Developer Survey',
    url: 'https://survey.stackoverflow.co/',
    method: 'download',
    frequency: 'yearly',
    description: 'Massive annual survey. Technology usage, salary, demographics.',
  },
  httpArchive: {
    name: 'HTTP Archive',
    url: 'https://httparchive.org/',
    dataUrl: 'https://cdn.httparchive.org/reports/',
    method: 'api',
    frequency: 'monthly',
    description: 'Web technology usage across millions of sites. Real adoption data.',
  },
} as const


// --------------------------------------------------
// 6. FETCH SCHEDULE (recommended polling intervals)
// --------------------------------------------------

export const FETCH_SCHEDULE = {
  // Real-time (every 1-2 hours) — for content that changes fast
  realtime: [
    'hackerNews',          // HN front page rotates fast
    'lobsters',            // Active community
    'devTo',               // New articles constantly
    'reddit',              // Subreddit activity
  ],

  // Daily — for data that changes day-over-day
  daily: [
    'github',              // Star counts, trending repos
    'stackoverflow',       // Question volumes
    'npmDownloads',        // Daily download counts
    'pypiStats',           // Python package downloads
    'cratesIoStats',       // Rust package downloads
    'rssFeedsNews',        // Tech news RSS
    'rssFeedsBlogs',       // Blog RSS
  ],

  // Weekly — for slower-moving or aggregated data
  weekly: [
    'adzuna',              // Job postings (limited quota)
    'jsearch',             // Job data (limited quota)
    'remotive',            // Remote jobs
    'arbeitnow',           // Tech jobs
    'librariesIo',         // Package ecosystem health
    'rssFeedsNewsletters', // Weekly newsletter RSS
    'rssFeedsEngineering', // Company eng blogs
  ],

  // Monthly — for supplementary/validation data
  monthly: [
    'githubTrending',      // Monthly trending
    'httpArchive',         // Web tech usage
    'tiobe',               // Language rankings
  ],

  // Yearly — for survey/report data
  yearly: [
    'stateOfJs',
    'developerSurvey',
    'redmonk',
  ],
} as const


// --------------------------------------------------
// 7. HELPER — total source count for display
// --------------------------------------------------

export const SOURCE_COUNTS = {
  rssFeeds: Object.keys(RSS_FEEDS).length,
  publicApis: Object.keys(PUBLIC_APIS).length,
  packageRegistries: Object.keys(PACKAGE_REGISTRIES).length,
  authenticatedApis: Object.keys(AUTHENTICATED_APIS).length,
  supplementary: Object.keys(SUPPLEMENTARY_SOURCES).length,
  get total() {
    return (
      this.rssFeeds +
      this.publicApis +
      this.packageRegistries +
      this.authenticatedApis +
      this.supplementary
    )
  },
} as const
