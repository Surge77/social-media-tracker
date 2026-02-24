'use client';

import { TrendingUp, TrendingDown, Minus, Zap, Code2, Database, Star, GitFork, Briefcase, ArrowUpRight } from 'lucide-react';

// ─── Theme Definitions ────────────────────────────────────────────────────────

const THEMES = [
  {
    id: 'navy',
    name: 'Deep Navy',
    subtitle: 'Bloomberg Terminal',
    dark: {
      bg: 'hsl(225 40% 8%)',
      bgCard: 'hsl(225 35% 11%)',
      bgMuted: 'hsl(225 30% 14%)',
      fg: 'hsl(215 30% 92%)',
      fgMuted: 'hsl(215 20% 55%)',
      border: 'hsl(225 30% 18%)',
    },
    light: {
      bg: 'hsl(220 40% 96%)',
      bgCard: 'hsl(220 35% 98%)',
      bgMuted: 'hsl(220 30% 92%)',
      fg: 'hsl(225 40% 14%)',
      fgMuted: 'hsl(220 20% 46%)',
      border: 'hsl(220 25% 85%)',
    },
  },
  {
    id: 'slate',
    name: 'Warm Slate',
    subtitle: 'Linear / Raycast',
    dark: {
      bg: 'hsl(240 8% 6%)',
      bgCard: 'hsl(240 6% 9%)',
      bgMuted: 'hsl(240 5% 13%)',
      fg: 'hsl(240 10% 94%)',
      fgMuted: 'hsl(240 6% 55%)',
      border: 'hsl(240 6% 16%)',
    },
    light: {
      bg: 'hsl(40 15% 95%)',
      bgCard: 'hsl(40 12% 98%)',
      bgMuted: 'hsl(40 10% 91%)',
      fg: 'hsl(240 20% 12%)',
      fgMuted: 'hsl(240 8% 46%)',
      border: 'hsl(40 10% 84%)',
    },
  },
  {
    id: 'indigo',
    name: 'Midnight Indigo',
    subtitle: 'GitHub-adjacent',
    dark: {
      bg: 'hsl(245 35% 8%)',
      bgCard: 'hsl(245 30% 11%)',
      bgMuted: 'hsl(245 25% 15%)',
      fg: 'hsl(240 20% 93%)',
      fgMuted: 'hsl(240 12% 55%)',
      border: 'hsl(245 25% 18%)',
    },
    light: {
      bg: 'hsl(245 30% 96%)',
      bgCard: 'hsl(245 25% 98%)',
      bgMuted: 'hsl(245 20% 92%)',
      fg: 'hsl(245 35% 12%)',
      fgMuted: 'hsl(245 15% 46%)',
      border: 'hsl(245 20% 84%)',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    subtitle: 'Unique / Rare in dev tools',
    dark: {
      bg: 'hsl(155 30% 5%)',
      bgCard: 'hsl(155 25% 8%)',
      bgMuted: 'hsl(155 20% 12%)',
      fg: 'hsl(150 15% 92%)',
      fgMuted: 'hsl(150 10% 52%)',
      border: 'hsl(155 20% 14%)',
    },
    light: {
      bg: 'hsl(150 20% 95%)',
      bgCard: 'hsl(150 15% 97%)',
      bgMuted: 'hsl(150 12% 91%)',
      fg: 'hsl(155 30% 10%)',
      fgMuted: 'hsl(150 12% 44%)',
      border: 'hsl(150 15% 83%)',
    },
  },
];

const ORANGE = 'hsl(16 100% 60%)';
const ORANGE_DIM = 'hsl(16 100% 60% / 0.12)';
const TEAL = 'hsl(158 64% 48%)';
const TEAL_DIM = 'hsl(158 64% 48% / 0.12)';
const RED = 'hsl(0 72% 54%)';
const RED_DIM = 'hsl(0 72% 54% / 0.10)';
const AMBER = 'hsl(38 92% 50%)';
const AMBER_DIM = 'hsl(38 92% 50% / 0.12)';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TECH_ROWS = [
  { name: 'Rust', category: 'Language', score: 94, trend: 'up', delta: '+8.2', jobs: '12.4k', stars: '88.1k', momentum: 'Surging' },
  { name: 'TypeScript', category: 'Language', score: 91, trend: 'up', delta: '+3.1', jobs: '58.2k', stars: '99.6k', momentum: 'Rising' },
  { name: 'React', category: 'Framework', score: 88, trend: 'flat', delta: '0.0', jobs: '91.4k', stars: '224k', momentum: 'Stable' },
  { name: 'Angular', category: 'Framework', score: 62, trend: 'down', delta: '-4.1', jobs: '32.1k', stars: '96.8k', momentum: 'Declining' },
];

const STATS = [
  { label: 'Technologies Tracked', value: '247', sub: 'across 12 categories', icon: Code2, color: ORANGE },
  { label: 'Data Points Today', value: '1.4M', sub: 'from 14 sources', icon: Database, color: TEAL },
  { label: 'Active Jobs', value: '94.2k', sub: 'indexed this week', icon: Briefcase, color: AMBER },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp size={13} style={{ color: TEAL }} />;
  if (trend === 'down') return <TrendingDown size={13} style={{ color: RED }} />;
  return <Minus size={13} style={{ color: AMBER }} />;
}

function MomentumBadge({ label }: { label: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Surging: { bg: TEAL_DIM, color: TEAL },
    Rising: { bg: TEAL_DIM, color: TEAL },
    Stable: { bg: AMBER_DIM, color: AMBER },
    Declining: { bg: RED_DIM, color: RED },
  };
  const s = map[label] ?? map.Stable;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600, letterSpacing: '0.02em' }}>
      {label}
    </span>
  );
}

function ScoreBar({ score, fg }: { score: number; fg: string }) {
  const color = score >= 80 ? TEAL : score >= 60 ? AMBER : RED;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 48, height: 4, borderRadius: 99, background: `${fg}18`, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{score}</span>
    </div>
  );
}

// ─── Single Theme Block ───────────────────────────────────────────────────────

function ThemeBlock({ theme, mode }: { theme: typeof THEMES[0]; mode: 'dark' | 'light' }) {
  const c = theme[mode];
  const isDark = mode === 'dark';

  return (
    <div style={{ background: c.bg, borderRadius: 16, overflow: 'hidden', border: `1px solid ${c.border}`, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Nav bar mock */}
      <div style={{ background: c.bgCard, borderBottom: `1px solid ${c.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, hsl(16 100% 60%), hsl(25 100% 58%))` }} />
          <span style={{ color: c.fg, fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>DevTrends</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Technologies', 'Compare', 'Ask AI', 'Digest'].map(item => (
            <span key={item} style={{ color: c.fgMuted, fontSize: 12, cursor: 'pointer' }}>{item}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bgMuted, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, color: c.fgMuted }}>{isDark ? '☀' : '☽'}</span>
          </div>
          <div style={{ background: `linear-gradient(135deg, hsl(16 100% 60%), hsl(25 100% 58%))`, borderRadius: 8, padding: '5px 12px' }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>Get Access</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Hero line */}
        <div>
          <h2 style={{ color: c.fg, fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', margin: 0, lineHeight: 1.2 }}>
            Know what to learn <span style={{ background: `linear-gradient(135deg, hsl(16 100% 60%), hsl(25 100% 58%))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>before the market moves</span>
          </h2>
          <p style={{ color: c.fgMuted, fontSize: 12, margin: '6px 0 0', lineHeight: 1.5 }}>Real-time intelligence from GitHub, Stack Overflow, HN, Reddit, and 10 more sources.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={12} style={{ color: s.color }} />
                </div>
                <span style={{ color: c.fgMuted, fontSize: 10 }}>{s.label}</span>
              </div>
              <div style={{ color: c.fg, fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: c.fgMuted, fontSize: 10, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tech table */}
        <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: c.fg, fontSize: 12, fontWeight: 700 }}>Technology Leaderboard</span>
            <span style={{ color: ORANGE, fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
              View all <ArrowUpRight size={11} />
            </span>
          </div>
          <div>
            {TECH_ROWS.map((row, i) => (
              <div key={row.name} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 80px 80px 64px 80px', alignItems: 'center', gap: 8, padding: '9px 14px', borderBottom: i < TECH_ROWS.length - 1 ? `1px solid ${c.border}` : 'none', background: i % 2 === 0 ? 'transparent' : `${c.bgMuted}40` }}>
                <span style={{ color: c.fgMuted, fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: ORANGE, opacity: 0.7 + i * 0.05 }} />
                  <div>
                    <div style={{ color: c.fg, fontSize: 12, fontWeight: 700 }}>{row.name}</div>
                    <div style={{ color: c.fgMuted, fontSize: 10 }}>{row.category}</div>
                  </div>
                </div>
                <ScoreBar score={row.score} fg={c.fg} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendIcon trend={row.trend} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: row.trend === 'up' ? TEAL : row.trend === 'down' ? RED : AMBER, fontVariantNumeric: 'tabular-nums' }}>{row.delta}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Briefcase size={10} style={{ color: c.fgMuted }} />
                  <span style={{ color: c.fgMuted, fontSize: 10 }}>{row.jobs}</span>
                </div>
                <MomentumBadge label={row.momentum} />
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight card */}
        <div style={{ background: `${ORANGE}08`, border: `1px solid ${ORANGE}22`, borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Zap size={12} style={{ color: ORANGE }} />
            <span style={{ color: ORANGE, fontSize: 11, fontWeight: 700 }}>AI Insight · Rust</span>
            <span style={{ marginLeft: 'auto', color: c.fgMuted, fontSize: 10 }}>2 min ago</span>
          </div>
          <p style={{ color: c.fg, fontSize: 11, lineHeight: 1.6, margin: 0 }}>
            Rust adoption is accelerating rapidly in systems-level roles. The 8.2pt score gain tracks with a 34% jump in job postings over the past 30 days, driven largely by WebAssembly and embedded demand.
          </p>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <span style={{ background: TEAL_DIM, color: TEAL, fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>#systems</span>
            <span style={{ background: ORANGE_DIM, color: ORANGE, fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>#wasm</span>
            <span style={{ background: `${c.bgMuted}`, color: c.fgMuted, fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 600, border: `1px solid ${c.border}` }}>#embedded</span>
          </div>
        </div>

        {/* Button row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={{ background: `linear-gradient(135deg, hsl(16 100% 60%), hsl(25 100% 58%))`, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            Explore Dashboard
          </button>
          <button style={{ background: 'transparent', color: c.fg, border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            View Methodology
          </button>
          <button style={{ background: c.bgMuted, color: c.fgMuted, border: `1px solid ${c.border}`, borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer' }}>
            Ask AI →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Theme Card (dark + light stacked) ───────────────────────────────────────

function ThemeCard({ theme }: { theme: typeof THEMES[0] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Label */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.03em' }}>{theme.name}</h2>
          <span style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>{theme.subtitle}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {(['dark', 'light'] as const).map(mode => (
            <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: theme[mode].bg, border: '1px solid #333' }} />
              <span style={{ fontSize: 11, color: '#666' }}>{mode} · {theme[mode].bg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dark preview */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: 6, display: 'block' }}>Dark Mode</span>
        <ThemeBlock theme={theme} mode="dark" />
      </div>

      {/* Light preview */}
      <div>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#555', marginBottom: 6, display: 'block' }}>Light Mode</span>
        <ThemeBlock theme={theme} mode="light" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ThemePreviewPage() {
  return (
    <div style={{ background: '#090909', minHeight: '100vh', padding: '40px 32px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ maxWidth: 1400, margin: '0 auto 48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 99, padding: '4px 12px', marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: ORANGE, display: 'inline-block' }} />
          <span style={{ color: '#888', fontSize: 11, letterSpacing: '0.05em' }}>THEME PREVIEW · DEVTRENDS</span>
        </div>
        <h1 style={{ color: '#f0f0f0', fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 8px' }}>
          4 Brand Palettes
        </h1>
        <p style={{ color: '#555', fontSize: 14, margin: 0, maxWidth: 520 }}>
          Each palette shown in dark + light mode with real mock components — nav bar, stat cards, tech table, AI insight, and buttons.
          Orange gradient accent is unchanged across all four.
        </p>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 48 }}>
        {THEMES.map(theme => (
          <ThemeCard key={theme.id} theme={theme} />
        ))}
      </div>

      {/* Footer note */}
      <div style={{ maxWidth: 1400, margin: '48px auto 0', paddingTop: 24, borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#444', fontSize: 12 }}>Colors are applied via overridden CSS custom properties — all shadcn components will inherit them automatically.</span>
        <span style={{ color: '#333', fontSize: 11 }}>Remove this page before deploy: /src/app/theme-preview/page.tsx</span>
      </div>
    </div>
  );
}
