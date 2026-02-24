import { ArrowRight, BarChart3, Brain, Clock, Database, Scale, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Methodology | DevTrends',
  description: 'How DevTrends scores technologies: composite scoring from 9+ data sources, multi-window momentum analysis, Bayesian smoothing, and AI-powered insights.',
}

export default function MethodologyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-12">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          How DevTrends Works
        </h1>
        <p className="text-lg text-muted-foreground">
          Every score, ranking, and insight on this platform is computed from real data. Here's exactly what we measure, how we weight it, and where we know we fall short.
        </p>
      </div>

      {/* What we measure */}
      <Section icon={<Zap className="h-5 w-5" />} title="What We Measure">
        <p>
          DevTrends tracks technologies across four signal types — developer community activity, job market demand,
          ecosystem health, and open-source momentum. These signals are collected from 9+ sources daily and combined
          into a single composite score from 0–100.
        </p>
        <p>
          The goal is to answer three questions a developer actually cares about: <strong className="text-foreground">Is this technology growing or shrinking?</strong>{' '}
          <strong className="text-foreground">Is it in demand from employers?</strong>{' '}
          <strong className="text-foreground">Is the community healthy?</strong>
        </p>
        <p>
          We don't measure quality, suitability for a specific project, or personal preference. A high score means
          a technology is widely adopted, actively discussed, and currently hired for — not that it's the right
          tool for your situation.
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
              { name: 'GitHub API', detail: 'Stars, forks, issues, contributors, commit velocity' },
            ]}
          />
          <SourceCard
            category="Community Buzz"
            color="text-cyan-400"
            sources={[
              { name: 'Hacker News', detail: 'Mentions, upvotes, sentiment' },
              { name: 'Reddit', detail: 'Posts, engagement, sentiment' },
              { name: 'Dev.to', detail: 'Articles, reactions' },
              { name: 'NewsAPI', detail: 'Tech news coverage' },
            ]}
          />
          <SourceCard
            category="Job Market"
            color="text-emerald-400"
            sources={[
              { name: 'Adzuna', detail: 'Job postings across regions' },
              { name: 'JSearch', detail: 'Aggregated job board data' },
              { name: 'Remotive', detail: 'Remote job listings' },
            ]}
          />
          <SourceCard
            category="Ecosystem Health"
            color="text-amber-400"
            sources={[
              { name: 'npm / PyPI / crates.io', detail: 'Weekly download counts and growth' },
              { name: 'Stack Overflow', detail: 'Question count and recent activity' },
            ]}
          />
        </div>
      </Section>

      {/* Scoring */}
      <Section icon={<Scale className="h-5 w-5" />} title="Adaptive Composite Scoring">
        <p>
          Each technology gets a <strong className="text-foreground">composite score from 0 to 100</strong> using
          weights that adapt based on the technology's category and maturity. A programming language and a CSS
          framework shouldn't be weighted the same way — the language matters more in the job market,
          the framework matters more in community adoption.
        </p>

        <h3 className="mt-6 mb-3 font-semibold text-foreground">Weight profiles by category</h3>
        <div className="my-4 space-y-3 text-sm">
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <p className="font-medium text-foreground mb-1">Languages & Databases</p>
            <p className="font-mono text-xs text-muted-foreground">
              Jobs (35–40%) · Ecosystem (30–35%) · GitHub (15–20%) · Community (10–15%)
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <p className="font-medium text-foreground mb-1">Frontend & Mobile Frameworks</p>
            <p className="font-mono text-xs text-muted-foreground">
              GitHub (20–25%) · Community (20–25%) · Jobs (25–30%) · Ecosystem (25–30%)
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <p className="font-medium text-foreground mb-1">AI / ML Tools</p>
            <p className="font-mono text-xs text-muted-foreground">
              Community (30%) · GitHub (25%) · Jobs (25%) · Ecosystem (20%)
            </p>
          </div>
        </div>

        <h3 className="mt-6 mb-3 font-semibold text-foreground">Maturity adjustments</h3>
        <p>
          New technologies (under 6 months of data) get boosted GitHub and community weights —
          because job market adoption lags behind developer interest by months. Mature technologies
          get boosted job and ecosystem weights, since those signals are more stable predictors
          of long-term relevance.
        </p>

        <h3 className="mt-6 mb-3 font-semibold text-foreground">Score ranges</h3>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <ScoreRange label="Excellent" range="80–100" color="text-green-400" />
          <ScoreRange label="Strong"    range="65–79"  color="text-green-400/80" />
          <ScoreRange label="Good"      range="50–64"  color="text-amber-400" />
          <ScoreRange label="Fair"      range="35–49"  color="text-amber-400/80" />
          <ScoreRange label="Low"       range="20–34"  color="text-red-400/80" />
          <ScoreRange label="Minimal"   range="0–19"   color="text-red-400" />
        </div>

        <p className="mt-6">
          Every score includes a <strong className="text-foreground">confidence grade (A–F)</strong> based on
          data completeness, sample size, recency, and source diversity. A score of 85 with grade A
          is more reliable than the same score with grade C — it means more sources agreed and the data is fresh.
        </p>
      </Section>

      {/* Sub-Scores */}
      <Section icon={<BarChart3 className="h-5 w-5" />} title="Normalization & Smoothing">
        <p>
          Raw numbers aren't comparable across technologies — a framework with 50,000 GitHub stars and one with
          500 stars aren't in the same league. We normalize each signal using <strong className="text-foreground">z-score normalization</strong>,
          which measures how far a technology sits from the average across the full tracked population.
        </p>

        <p>
          We then apply <strong className="text-foreground">Bayesian smoothing</strong> to prevent low-sample
          technologies from gaming the rankings. Without it, a project with 10 stars gaining 10 more would score
          higher than one with 10,000 stars gaining 500 (100% vs 5% growth). Smoothing applies a confidence
          penalty proportional to sample size — the less data we have, the more we pull the score toward the population mean.
        </p>

        <div className="mt-6 space-y-4">
          <SubScoreDetail
            name="GitHub Score"
            color="text-violet-400"
            components={[
              'Star velocity (40%) — new stars gained, normalized across tracked repos',
              'Fork count (20%) — indicator of real-world usage',
              'Issue close rate (20%) — maintenance health and responsiveness',
              'Contributor growth (20%) — expanding vs contracting developer interest',
            ]}
          />
          <SubScoreDetail
            name="Community Score"
            color="text-cyan-400"
            components={[
              'Hacker News mentions (35%) — normalized mention count',
              'Reddit posts (25%) — subreddit activity and engagement',
              'Dev.to articles (25%) — content ecosystem health',
              'Sentiment adjustment (±15 pts) — positive vs negative buzz weighting',
            ]}
          />
          <SubScoreDetail
            name="Jobs Score"
            color="text-emerald-400"
            components={[
              'Adzuna postings (40%) — normalized across all tracked technologies',
              'JSearch postings (40%) — secondary job board coverage',
              'Remotive postings (20%) — remote job demand signal',
            ]}
          />
          <SubScoreDetail
            name="Ecosystem Score"
            color="text-amber-400"
            components={[
              'Package downloads (40%) — weekly downloads, normalized within each registry',
              'Download growth rate (25%) — adoption trajectory over 30 days',
              'Stack Overflow activity (35%) — question count and recent engagement',
            ]}
          />
        </div>
      </Section>

      {/* Momentum */}
      <Section icon={<ArrowRight className="h-5 w-5" />} title="Momentum Analysis">
        <p>
          The composite score tells you where a technology stands today. Momentum tells you where it's heading.
          We use <strong className="text-foreground">three exponential moving averages</strong> running in parallel
          to distinguish short-term noise from genuine directional change.
        </p>

        <div className="my-4 rounded-lg border border-border/50 bg-muted/10 p-4">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Three-window analysis</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-medium text-cyan-400">7-day EMA</span> — Breaking news, launches, viral moments</p>
            <p><span className="font-medium text-emerald-400">30-day EMA</span> — Monthly adoption trend</p>
            <p><span className="font-medium text-violet-400">90-day EMA</span> — Long-term trajectory</p>
          </div>
        </div>

        <p>
          When short-term momentum contradicts long-term momentum — a 7-day spike against a 90-day decline,
          for example — the system flags a potential inflection point. These are worth investigating further
          before drawing conclusions.
        </p>

        <h3 className="mt-6 mb-3 font-semibold text-foreground">Trend labels</h3>
        <div className="mt-4 space-y-2 text-sm">
          <MomentumRange label="Surging"        range="> +15"    description="All three windows accelerating rapidly" />
          <MomentumRange label="Rising quickly" range="+8 to +15" description="Strong growth across multiple windows" />
          <MomentumRange label="Trending up"    range="+3 to +8"  description="Steady positive momentum" />
          <MomentumRange label="Stable"         range="−3 to +3"  description="Holding current position" />
          <MomentumRange label="Slowing"        range="−8 to −3"  description="Short-term decline detected" />
          <MomentumRange label="Declining"      range="−15 to −8" description="Multi-window negative trend" />
          <MomentumRange label="Dropping fast"  range="< −15"    description="Significant sustained decline" />
        </div>
      </Section>

      {/* Sentiment */}
      <Section icon={<Brain className="h-5 w-5" />} title="Sentiment Analysis">
        <p>
          Mention count alone is misleading. "React 19 is incredible" and "Why I'm abandoning React" are both
          mentions — but they carry opposite signals. Our sentiment engine combines lexicon-based analysis
          with tech-specific context rules to weight mentions by their actual signal direction.
        </p>

        <div className="my-4 space-y-3 text-sm">
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-emerald-400">Positive signals</h4>
            <p className="text-muted-foreground">
              "production-ready", "battle-tested", "game-changer", "hiring for", "just shipped" — phrases
              that indicate real adoption rather than curiosity.
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-red-400">Negative signals</h4>
            <p className="text-muted-foreground">
              "deprecated", "legacy", "abandoning", "security vulnerability", "rewrite in X" — phrases
              that indicate decline or active rejection.
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-amber-400">Sarcasm detection</h4>
            <p className="text-muted-foreground">
              Phrases like "yeah right" and "sure buddy" flip the polarity of the surrounding sentiment
              to prevent misclassification of ironic praise as genuine endorsement.
            </p>
          </div>
        </div>

        <p>
          Sentiment adjusts the community sub-score by up to ±15 points. High mention volume with
          predominantly negative sentiment will score meaningfully lower than moderate volume with positive sentiment.
        </p>
      </Section>

      {/* AI Insights */}
      <Section icon={<Brain className="h-5 w-5" />} title="AI-Generated Insights">
        <p>
          Scores and charts show you what's happening. The AI insights explain <em>why</em> — drawing on
          the underlying data to surface patterns, flag anomalies, and provide context a raw number can't.
        </p>

        <div className="mt-4 grid gap-3 text-sm">
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-foreground">Quality checks</h4>
            <p className="text-muted-foreground">
              Every generated insight passes through six automated quality dimensions: factual grounding,
              relevance to the technology, completeness, clarity, actionability, and consistency with
              the underlying data. Insights that fail are regenerated rather than surfaced.
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-foreground">Freshness</h4>
            <p className="text-muted-foreground">
              Insights are invalidated when the underlying data changes significantly. A cached insight
              about a technology that just saw a 40% score drop will be regenerated before being shown —
              you won't read stale analysis about current events.
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <h4 className="mb-2 font-semibold text-foreground">Resilience</h4>
            <p className="text-muted-foreground">
              Insights are generated across multiple AI providers with automatic failover. If one provider
              is unavailable, the system routes to alternatives — insight availability is independent
              of any single provider's uptime.
            </p>
          </div>
        </div>
      </Section>

      {/* Status Labels */}
      <Section icon={<Shield className="h-5 w-5" />} title="Status Labels">
        <p>
          Each technology receives a human-readable status label derived from its score, momentum direction,
          and confidence grade combined:
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <StatusLabel label="Strong Growth" color="text-emerald-400" description="High score and accelerating momentum — active investment now makes sense" />
          <StatusLabel label="High Demand"   color="text-orange-400"  description="Surging employer demand relative to community size" />
          <StatusLabel label="Established"   color="text-blue-400"    description="Proven, stable, and reliably hired for — low risk, lower upside" />
          <StatusLabel label="Emerging"      color="text-cyan-400"    description="Growing adoption — early positioning opportunity" />
          <StatusLabel label="Slowing"       color="text-amber-400"   description="Still relevant but losing momentum across multiple signals" />
          <StatusLabel label="Low Demand"    color="text-red-400"     description="Declining interest — worth considering alternatives" />
          <StatusLabel label="New"           color="text-slate-400"   description="Recently added — still accumulating data, treat scores with caution" />
        </div>
      </Section>

      {/* Update Frequency */}
      <Section icon={<Clock className="h-5 w-5" />} title="Update Schedule">
        <p>Data collection and score recomputation run on a fixed schedule:</p>
        <div className="mt-4 space-y-2 text-sm">
          {[
            { freq: 'Daily',     detail: 'GitHub stats, Hacker News, Reddit, Dev.to, npm downloads, Stack Overflow' },
            { freq: 'Weekly',    detail: 'Job postings (Adzuna, JSearch, Remotive), news articles' },
            { freq: 'On demand', detail: 'Score recomputation triggers automatically after new data arrives' },
          ].map(({ freq, detail }) => (
            <div key={freq} className="flex items-baseline gap-3">
              <span className="w-20 shrink-0 font-medium text-foreground">{freq}</span>
              <span className="text-muted-foreground">{detail}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Limitations */}
      <Section icon={<Shield className="h-5 w-5" />} title="Limitations" isLast={false}>
        <p>
          We'd rather tell you where this breaks than have you discover it the wrong way.
        </p>
        <ul className="mt-3 space-y-3">
          {[
            {
              title: 'Popularity ≠ quality.',
              body: 'A high score means a technology is widely used, discussed, and hired for. It says nothing about whether it\'s the right tool for your specific situation.',
            },
            {
              title: 'Enterprise blind spots.',
              body: 'Technologies dominant in enterprises (Java, C#, SAP, Oracle) may score lower on community signals because enterprise discussions happen behind firewalls, not on Hacker News.',
            },
            {
              title: 'English-language bias.',
              body: 'All data sources are English-language. Technologies with large non-English communities — particularly in China, Japan, and Eastern Europe — may be underrepresented.',
            },
            {
              title: 'AI-generated insights can be wrong.',
              body: 'Insights are quality-checked but not fact-checked by humans. LLMs can misinterpret data or miss context. Use them as a starting point, not a final answer.',
            },
            {
              title: 'Job data lags reality.',
              body: 'Job postings are a lagging indicator. By the time a technology shows up heavily in job listings, the early-adopter window has often already closed.',
            },
            {
              title: 'Sentiment accuracy is imperfect.',
              body: 'Our tech-aware sentiment analysis is more accurate than generic approaches, but sarcasm detection and context understanding aren\'t solved problems. Ironic or nuanced community discussion may be misclassified.',
            },
          ].map(({ title, body }) => (
            <li key={title} className="flex gap-2 text-sm">
              <span className="mt-0.5 shrink-0 text-foreground">&#8226;</span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{title}</strong> {body}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* CTA */}
      <Section icon={<Zap className="h-5 w-5" />} title="What's Tracked" isLast>
        <p>
          DevTrends currently tracks technologies across 8 categories: Languages, Frontend, Backend,
          Databases, DevOps, Cloud, Mobile, and AI/ML. Rankings and scores update continuously
          as new data arrives.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/technologies"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse Technologies
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/languages"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            Language Rankings
          </Link>
        </div>
      </Section>
    </div>
  )
}

// ---- Helpers ----

function Section({
  icon, title, children, isLast = false,
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

function SourceCard({ category, color, sources }: {
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

function SubScoreDetail({ name, color, components }: {
  name: string
  color: string
  components: string[]
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
      <h4 className={`mb-2 font-semibold ${color}`}>{name}</h4>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {components.map((c) => (
          <li key={c} className="flex gap-2">
            <span className="text-foreground/60">&#8226;</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MomentumRange({ label, range, description }: {
  label: string
  range: string
  description: string
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-28 shrink-0 font-medium text-foreground">{label}</span>
      <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground/80">{range}</span>
      <span className="text-muted-foreground">{description}</span>
    </div>
  )
}

function StatusLabel({ label, color, description }: {
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
