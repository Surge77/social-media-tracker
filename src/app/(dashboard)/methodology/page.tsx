import { ArrowRight, BarChart3, Brain, Clock, Database, Github, Scale, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Intelligence Methodology | DevTrends',
  description: 'Our AI-powered intelligence framework: adaptive scoring, multi-provider LLM architecture, and advanced analytics.',
}

export default function MethodologyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Intelligence Methodology
        </h1>
        <p className="text-lg text-muted-foreground">
          Advanced AI-powered analytics combining adaptive scoring algorithms, multi-provider LLM architecture, and real-time intelligence generation.
        </p>
      </div>

      {/* What is DevTrends */}
      <Section icon={<Zap className="h-5 w-5" />} title="What is DevTrends?">
        <p>
          DevTrends is an AI-powered Developer Career Intelligence Platform that combines real-time data aggregation
          with advanced machine learning to deliver actionable technology insights. We track 100+ technologies across
          9+ data sources — GitHub, Hacker News, Stack Overflow, job boards, package registries, and developer communities.
        </p>
        <p>
          Unlike simple aggregators, DevTrends uses adaptive algorithms, multi-provider LLM architecture, and
          continuous quality monitoring to generate insights that feel written by a senior analyst who&apos;s been
          tracking each technology for years.
        </p>
        <p>
          The goal: help developers make smarter decisions about what to learn, what skills to invest in,
          and how the job market is shifting — backed by intelligent analysis, not just raw data.
        </p>
      </Section>

      {/* AI Intelligence Engine */}
      <Section icon={<Brain className="h-5 w-5" />} title="AI Intelligence Engine">
        <p>
          DevTrends uses a multi-provider LLM architecture with <strong>7 AI providers</strong> working in concert
          to ensure reliability, cost optimization, and insight quality:
        </p>

        <div className="mt-4 grid gap-3 text-sm">
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-cyan-400">Provider Diversity</h4>
            <p className="text-muted-foreground">
              Gemini (2 keys), Groq, xAI Grok, Mistral, Cerebras, OpenRouter, and HuggingFace. Each provider
              optimized for specific use cases: deep analysis, rapid comparisons, conversational interfaces.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-emerald-400">Resilient Infrastructure</h4>
            <p className="text-muted-foreground">
              Automatic key rotation, exponential backoff with jitter, circuit breakers per provider, and
              intelligent fallback chains. If one provider fails, the system seamlessly switches to alternatives
              without user-facing errors.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-violet-400">Quality Assurance</h4>
            <p className="text-muted-foreground">
              Every AI-generated insight passes through 6-dimension quality checks: factual accuracy, relevance,
              completeness, clarity, actionability, and bias detection. Failed insights are regenerated or flagged
              for manual review.
            </p>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-amber-400">Cost Optimization</h4>
            <p className="text-muted-foreground">
              Intelligent caching with data-based invalidation, priority-based token budgeting, and provider
              routing by use case. Target: under $10/month for 100 technologies, under $100/month at scale.
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          All AI infrastructure is implemented in TypeScript/Node.js with zero Python dependencies,
          running entirely on Vercel&apos;s serverless platform.
        </p>
      </Section>

      {/* Data Sources */}
      <Section icon={<Database className="h-5 w-5" />} title="Data Sources">
        <p>We collect data from 9+ sources, organized into four signal categories:</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <SourceCard
            category="GitHub Activity"
            color="text-violet-400"
            sources={[
              { name: 'GitHub API', detail: 'Stars, forks, issues, contributors' },
            ]}
          />
          <SourceCard
            category="Community Buzz"
            color="text-cyan-400"
            sources={[
              { name: 'Hacker News', detail: 'Mentions, upvotes, sentiment' },
              { name: 'Reddit', detail: 'Posts, upvotes, sentiment' },
              { name: 'Dev.to', detail: 'Articles, reactions' },
              { name: 'NewsAPI', detail: 'Tech news articles' },
            ]}
          />
          <SourceCard
            category="Job Market"
            color="text-emerald-400"
            sources={[
              { name: 'Adzuna', detail: 'Job postings across regions' },
              { name: 'JSearch', detail: 'Job postings via RapidAPI' },
              { name: 'Remotive', detail: 'Remote job listings' },
            ]}
          />
          <SourceCard
            category="Ecosystem Health"
            color="text-amber-400"
            sources={[
              { name: 'npm Registry', detail: 'Weekly download counts' },
              { name: 'Stack Overflow', detail: 'Question count, activity' },
            ]}
          />
        </div>
      </Section>

      {/* Composite Score */}
      <Section icon={<Scale className="h-5 w-5" />} title="Adaptive Composite Scoring">
        <p>
          Each technology receives a <strong>composite score from 0 to 100</strong> using
          <strong> adaptive, category-specific weights</strong> that adjust based on technology maturity
          and data completeness. Unlike fixed-weight systems, our approach recognizes that a programming
          language should be weighted differently than a CSS framework.
        </p>

        <h3 className="mt-6 mb-3 font-semibold text-foreground">Category-Based Weighting Examples</h3>
        <div className="my-4 space-y-3 text-sm">
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <p className="font-medium text-foreground mb-1">Languages & Databases (Job-Weighted)</p>
            <p className="font-mono text-xs text-muted-foreground">
              Jobs (35-40%) &gt; Ecosystem (30-35%) &gt; GitHub (15-20%) &gt; Community (10-15%)
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <p className="font-medium text-foreground mb-1">Frontend & Mobile (Balanced)</p>
            <p className="font-mono text-xs text-muted-foreground">
              GitHub (20-25%) ≈ Community (20-25%) ≈ Jobs (25-30%) ≈ Ecosystem (25-30%)
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <p className="font-medium text-foreground mb-1">AI/ML (Community-Weighted)</p>
            <p className="font-mono text-xs text-muted-foreground">
              Community (30%) &gt; GitHub (25%) ≈ Jobs (25%) &gt; Ecosystem (20%)
            </p>
          </div>
        </div>

        <h3 className="mt-6 mb-3 font-semibold text-foreground">Maturity Adjustments</h3>
        <p className="text-sm text-muted-foreground">
          <strong>New technologies</strong> ({"<"}6 months of data): Boost GitHub + Community weights
          to capture early signals before job market adoption.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>Mature technologies</strong> ({">"}1 year of data): Boost Jobs + Ecosystem weights
          to emphasize real-world adoption and market demand.
        </p>

        <h3 className="mt-6 mb-3 font-semibold text-foreground">Score Ranges & Confidence Grades</h3>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <ScoreRange label="Excellent" range="80-100" color="text-green-400" />
          <ScoreRange label="Strong" range="65-79" color="text-green-400/80" />
          <ScoreRange label="Good" range="50-64" color="text-amber-400" />
          <ScoreRange label="Fair" range="35-49" color="text-amber-400/80" />
          <ScoreRange label="Low" range="20-34" color="text-red-400/80" />
          <ScoreRange label="Minimal" range="0-19" color="text-red-400" />
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Every score includes a <strong>confidence grade (A-F)</strong> based on four factors:
          data completeness, sample size, recency, and source diversity. A score of 85 with grade A
          is more trustworthy than a score of 85 with grade C.
        </p>
      </Section>

      {/* Sub-Scores */}
      <Section icon={<BarChart3 className="h-5 w-5" />} title="Statistical Normalization & Bayesian Smoothing">
        <p>
          Each sub-score uses <strong>z-score normalization</strong> to compare technologies against
          the population distribution, then applies <strong>Bayesian smoothing</strong> to prevent
          low-sample technologies from dominating rankings.
        </p>

        <div className="my-4 rounded-lg border border-border bg-muted/20 p-4 font-mono text-sm">
          <p className="mb-2">1. Z-Score Normalization:</p>
          <p className="pl-4">z = (value - mean) / standard_deviation</p>
          <p className="mt-3 mb-2">2. Bayesian Smoothing:</p>
          <p className="pl-4">smoothed = (C × mean + n × raw) / (C + n)</p>
          <p className="mt-3 mb-2">3. Map to 0-100:</p>
          <p className="pl-4 text-muted-foreground">Via cumulative normal distribution</p>
        </div>

        <p className="text-sm text-muted-foreground">
          <strong>Why Bayesian smoothing?</strong> Without it, a technology with 10 GitHub stars and 10 new stars
          would score higher than one with 10,000 stars and 500 new stars (100% vs 5% growth). Smoothing adds
          a confidence penalty for low-sample data.
        </p>

        <div className="mt-4 space-y-4">
          <SubScoreDetail
            name="GitHub Score"
            color="text-violet-400"
            components={[
              'Star velocity (40%) — new stars gained, z-scored',
              'Fork count (20%) — community engagement',
              'Issue close rate (20%) — maintenance health',
              'Contributor growth (20%) — developer interest',
            ]}
          />
          <SubScoreDetail
            name="Community Score"
            color="text-cyan-400"
            components={[
              'HN mentions (35%) — z-scored mention count',
              'Reddit posts (25%) — subreddit activity',
              'Dev.to articles (25%) — blog ecosystem',
              'Sentiment adjustment (±15) — positive/negative buzz',
            ]}
          />
          <SubScoreDetail
            name="Jobs Score"
            color="text-emerald-400"
            components={[
              'Adzuna postings (40%) — z-scored across technologies',
              'JSearch postings (40%) — additional job board data',
              'Remotive postings (20%) — remote job signal',
            ]}
          />
          <SubScoreDetail
            name="Ecosystem Score"
            color="text-amber-400"
            components={[
              'Package downloads (40%) — npm/PyPI/crates, z-scored within ecosystem',
              'Download growth rate (25%) — adoption trajectory',
              'SO question count (35%) — community support activity',
            ]}
          />
        </div>
      </Section>

      {/* Momentum */}
      <Section icon={<ArrowRight className="h-5 w-5" />} title="Enhanced Momentum Analysis">
        <p>
          Momentum measures how a technology&apos;s composite score is <strong>changing over time</strong>.
          Unlike simple moving averages, we use <strong>multi-window exponential moving averages (EMA)</strong>
          to detect both short-term volatility and long-term trends.
        </p>

        <div className="my-4 rounded-lg border border-border/50 bg-muted/10 p-4">
          <h4 className="mb-2 text-sm font-semibold text-foreground">Three-Window Analysis</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-medium text-cyan-400">7-day EMA</span> — Captures breaking news, launches, viral moments</p>
            <p><span className="font-medium text-emerald-400">30-day EMA</span> — Monthly adoption trends</p>
            <p><span className="font-medium text-violet-400">90-day EMA</span> — Long-term trajectory</p>
          </div>
        </div>

        <h3 className="mt-6 mb-3 font-semibold text-foreground">Trend Classification</h3>
        <div className="mt-4 space-y-2 text-sm">
          <MomentumRange label="Surging" range="> +15" description="All three windows accelerating rapidly" />
          <MomentumRange label="Rising quickly" range="+8 to +15" description="Strong growth across 2+ windows" />
          <MomentumRange label="Trending up" range="+3 to +8" description="Steady positive momentum" />
          <MomentumRange label="Stable" range="-3 to +3" description="Maintaining current position" />
          <MomentumRange label="Slowing down" range="-8 to -3" description="Short-term decline detected" />
          <MomentumRange label="Declining" range="-15 to -8" description="Multi-window negative trend" />
          <MomentumRange label="Dropping fast" range="< -15" description="Significant sustained decline" />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          The system also detects <strong>trend reversals</strong>: when short-term momentum contradicts
          long-term momentum, indicating potential inflection points worth investigating.
        </p>
      </Section>

      {/* Sentiment */}
      <Section icon={<Brain className="h-5 w-5" />} title="Advanced Sentiment Analysis">
        <p>
          Not all mentions are equal. &quot;React 19 is incredible&quot; and &quot;Why I&apos;m abandoning React&quot;
          carry opposite signals. Our sentiment engine combines <strong>lexicon-based analysis</strong> (wink-sentiment)
          with <strong>tech-specific boosters and dampeners</strong> to understand context that generic NLP misses.
        </p>

        <div className="my-4 space-y-3 text-sm">
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-emerald-400">Tech Boosters (+0.3 to +0.5)</h4>
            <p className="text-muted-foreground">
              &quot;production-ready&quot;, &quot;battle-tested&quot;, &quot;game-changer&quot;, &quot;hiring for&quot;
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-red-400">Tech Dampeners (-0.3 to -0.5)</h4>
            <p className="text-muted-foreground">
              &quot;deprecated&quot;, &quot;legacy&quot;, &quot;abandoning&quot;, &quot;security vulnerability&quot;
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-amber-400">Sarcasm Detection</h4>
            <p className="text-muted-foreground">
              &quot;yeah right&quot;, &quot;sure buddy&quot; → flips sentiment polarity to prevent misclassification
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Sentiment adjusts the community sub-score by up to ±15 points. A technology with lots of mentions
          but negative sentiment will score lower than one with fewer but more positive mentions.
        </p>
      </Section>

      {/* Status Labels */}
      <Section icon={<Shield className="h-5 w-5" />} title="Status Labels">
        <p>
          Each technology receives a human-readable status label based on its score, momentum, and data completeness:
        </p>

        <div className="mt-4 space-y-2 text-sm">
          <StatusLabel label="Strong Growth" color="text-emerald-400" description="High scores and accelerating adoption — invest now" />
          <StatusLabel label="High Demand" color="text-orange-400" description="Surging community interest and employer demand" />
          <StatusLabel label="Established" color="text-blue-400" description="Proven and stable — reliable career skill" />
          <StatusLabel label="Emerging" color="text-cyan-400" description="Growing adoption — early investment opportunity" />
          <StatusLabel label="Slowing" color="text-amber-400" description="Still relevant but losing momentum" />
          <StatusLabel label="Low Demand" color="text-red-400" description="Declining interest — consider alternatives" />
          <StatusLabel label="New" color="text-slate-400" description="Recently added — still gathering signals" />
        </div>
      </Section>

      {/* Update Frequency */}
      <Section icon={<Clock className="h-5 w-5" />} title="Update Frequency">
        <p>Data is collected and scores are recomputed on a regular schedule:</p>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-baseline gap-3">
            <span className="w-20 shrink-0 font-medium text-foreground">Daily</span>
            <span className="text-muted-foreground">
              GitHub stats, Hacker News, Reddit, Dev.to, npm downloads, Stack Overflow
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="w-20 shrink-0 font-medium text-foreground">Weekly</span>
            <span className="text-muted-foreground">
              Job postings (Adzuna, JSearch, Remotive), news articles
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="w-20 shrink-0 font-medium text-foreground">On demand</span>
            <span className="text-muted-foreground">
              Score recomputation after new data arrives
            </span>
          </div>
        </div>
      </Section>

      {/* Limitations */}
      <Section icon={<Shield className="h-5 w-5" />} title="Limitations & Transparency">
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-foreground">&#8226;</span>
            <span><strong className="text-foreground">Popularity ≠ Quality.</strong> A high score means a technology is widely used, discussed, and hired for — not that it&apos;s the best tool for every job.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">&#8226;</span>
            <span><strong className="text-foreground">Enterprise blind spots.</strong> Technologies popular in enterprises (Java, C#, Oracle) may score lower on community buzz because enterprise discussions happen behind firewalls.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">&#8226;</span>
            <span><strong className="text-foreground">English-language bias.</strong> Our sources are primarily English-language. Technologies popular in non-English communities may be under-represented.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">&#8226;</span>
            <span><strong className="text-foreground">AI-generated insights.</strong> While quality-checked, LLM-generated insights may occasionally hallucinate facts or miss nuances. We include confidence scores and source citations to help you verify claims.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">&#8226;</span>
            <span><strong className="text-foreground">Free-tier LLM providers.</strong> We use free-tier API access across 7 providers. During high demand, some insights may experience brief delays as the system rotates through available quotas.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">&#8226;</span>
            <span><strong className="text-foreground">Sentiment accuracy.</strong> Our tech-aware sentiment analysis achieves ~75-80% accuracy (vs ~65-70% for generic lexicon-based). Sarcasm detection helps but isn&apos;t perfect.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">&#8226;</span>
            <span><strong className="text-foreground">API rate limits.</strong> Some data sources have rate limits that may cause brief gaps in data collection. We track data completeness to flag when this happens.</span>
          </li>
        </ul>
      </Section>

      {/* Technology Taxonomy */}
      <Section icon={<Database className="h-5 w-5" />} title="Technology Taxonomy">
        <p>
          We currently track <strong>100 technologies</strong> across 8 categories:
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {[
            { name: 'Languages', count: '15+', color: 'text-cyan-400' },
            { name: 'Frontend', count: '15+', color: 'text-blue-400' },
            { name: 'Backend', count: '15+', color: 'text-violet-400' },
            { name: 'Databases', count: '10+', color: 'text-emerald-400' },
            { name: 'DevOps', count: '12+', color: 'text-orange-400' },
            { name: 'Cloud', count: '8+', color: 'text-sky-400' },
            { name: 'Mobile', count: '8+', color: 'text-pink-400' },
            { name: 'AI/ML', count: '10+', color: 'text-amber-400' },
          ].map((cat) => (
            <div key={cat.name} className="rounded-md border border-border/50 bg-muted/10 p-3">
              <span className={`font-medium ${cat.color}`}>{cat.name}</span>
              <span className="ml-2 text-muted-foreground">{cat.count}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Each technology includes a canonical name, aliases (for matching across sources),
          associated GitHub repos, package names, and Stack Overflow tags.
        </p>
      </Section>

      {/* Tech Stack */}
      <Section icon={<Zap className="h-5 w-5" />} title="Implementation Stack">
        <p>
          DevTrends is built entirely in <strong>TypeScript/Node.js</strong> with zero Python dependencies.
          All statistical algorithms, sentiment analysis, and machine learning features are implemented
          in pure JavaScript using production-tested libraries:
        </p>

        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-md border border-border/50 bg-muted/10 p-3">
            <span className="font-medium text-cyan-400">simple-statistics</span>
            <p className="text-xs text-muted-foreground mt-1">Z-score, std dev, percentiles, linear regression</p>
          </div>
          <div className="rounded-md border border-border/50 bg-muted/10 p-3">
            <span className="font-medium text-emerald-400">wink-sentiment</span>
            <p className="text-xs text-muted-foreground mt-1">Lexicon-based sentiment analysis</p>
          </div>
          <div className="rounded-md border border-border/50 bg-muted/10 p-3">
            <span className="font-medium text-violet-400">@google/generative-ai</span>
            <p className="text-xs text-muted-foreground mt-1">Gemini API for deep insights</p>
          </div>
          <div className="rounded-md border border-border/50 bg-muted/10 p-3">
            <span className="font-medium text-amber-400">OpenAI-compatible SDKs</span>
            <p className="text-xs text-muted-foreground mt-1">Groq, xAI, Mistral, Cerebras, HF</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Running on Next.js 16 (App Router), Supabase PostgreSQL, and Vercel serverless infrastructure.
          Python is only needed for Phase 3+ features (Prophet forecasting, BERTopic clustering) — not the MVP.
        </p>
      </Section>

      {/* Open Source */}
      <Section icon={<Github className="h-5 w-5" />} title="Open Methodology" isLast>
        <p>
          DevTrends is built with open-source technologies and transparent algorithms. Every scoring formula,
          normalization technique, and AI prompt is documented and reproducible:
        </p>

        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-foreground">✓</span>
            <span><strong className="text-foreground">All algorithms documented</strong> in ALGORITHMS_AND_ML.md with examples</span>
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">✓</span>
            <span><strong className="text-foreground">AI prompts versioned</strong> and tracked in database for reproducibility</span>
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">✓</span>
            <span><strong className="text-foreground">Data freshness indicators</strong> on every metric and insight</span>
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">✓</span>
            <span><strong className="text-foreground">Confidence scores</strong> reveal data quality behind every number</span>
          </li>
        </ul>

        <p className="mt-4 text-sm">
          Built with Next.js, TypeScript, Supabase, Tailwind CSS, Recharts, and Framer Motion.
        </p>

        <div className="mt-6">
          <Link
            href="/technologies"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Explore Technologies
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>
    </div>
  )
}

// ---- Helper Components ----

function Section({
  icon,
  title,
  children,
  isLast = false,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  isLast?: boolean
}) {
  return (
    <section className={isLast ? '' : 'mb-12'}>
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

function SourceCard({
  category,
  color,
  sources,
}: {
  category: string
  color: string
  sources: Array<{ name: string; detail: string }>
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
      <h4 className={`mb-2 font-semibold ${color}`}>{category}</h4>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {sources.map((s) => (
          <li key={s.name}>
            <span className="font-medium text-foreground/80">{s.name}</span> — {s.detail}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ScoreRange({ label, range, color }: { label: string; range: string; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/30 bg-muted/10 p-2">
      <span className={`font-medium ${color}`}>{label}</span>
      <span className="text-muted-foreground">{range}</span>
    </div>
  )
}

function SubScoreDetail({
  name,
  color,
  components,
}: {
  name: string
  color: string
  components: string[]
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
      <h4 className={`mb-2 font-semibold ${color}`}>{name}</h4>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {components.map((c, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-foreground/60">&#8226;</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MomentumRange({
  label,
  range,
  description,
}: {
  label: string
  range: string
  description: string
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-28 shrink-0 font-medium text-foreground">{label}</span>
      <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground/80">{range}</span>
      <span className="text-muted-foreground">{description}</span>
    </div>
  )
}

function StatusLabel({
  label,
  color,
  description,
}: {
  label: string
  color: string
  description: string
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className={`w-28 shrink-0 font-semibold ${color}`}>{label}</span>
      <span className="text-muted-foreground">{description}</span>
    </div>
  )
}
