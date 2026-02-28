'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, ArrowUpRight, Zap, Bell, CheckCircle2, BarChart3, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TextAnimation from '@/components/ui/scroll-text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AnimatedBeam } from '@/components/ui/animated-beam';

// Mini mockup components for inside the cards
function LeaderboardMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ghRef = useRef<HTMLDivElement>(null);
  const hnRef = useRef<HTMLDivElement>(null);
  const soRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);

  const items = [
    {
      name: 'Next.js',
      metric: '★ 1,500',
      badge: 'HOT',
      color: 'text-orange-500',
      logo: <svg viewBox="0 0 180 180" className="w-4 h-4"><mask id="a" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180"><circle cx="90" cy="90" r="90" fill="currentColor" /></mask><g mask="url(#a)"><circle cx="90" cy="90" r="90" fill="currentColor" /><path d="M149.508 157.52L69.142 54H54v71.97h12.114V69.384l73.885 95.461a90.304 90.304 0 009.509-7.325z" fill="url(#b)" /><path d="M115 54h12v72h-12z" fill="url(#c)" /></g><defs><linearGradient id="b" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient><linearGradient id="c" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs></svg>
    },
    {
      name: 'TypeScript',
      metric: '▲ Very Positive',
      badge: null,
      color: 'text-green-500',
      logo: <svg viewBox="0 0 256 256" className="w-4 h-4"><rect width="256" height="256" fill="#3178C6" rx="28" /><path d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 0 0-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.881-2.949-9.761-4.359-2.879-1.41-5.327-2.848-7.342-4.316-2.016-1.467-3.571-3.021-4.665-4.661-1.094-1.64-1.641-3.495-1.641-5.567 0-1.899.489-3.61 1.468-5.135s2.362-2.834 4.147-3.927c1.785-1.094 3.973-1.942 6.565-2.547 2.591-.604 5.471-.906 8.638-.906 2.304 0 4.737.173 7.299.518 2.563.345 5.14.877 7.732 1.597a53.669 53.669 0 0 1 7.558 2.719 41.7 41.7 0 0 1 6.781 3.797v-25.807c-4.204-1.611-8.797-2.805-13.778-3.582-4.981-.777-10.697-1.165-17.147-1.165-6.565 0-12.784.705-18.658 2.115-5.874 1.409-11.043 3.61-15.506 6.602-4.463 2.993-7.99 6.805-10.582 11.437-2.591 4.632-3.887 10.17-3.887 16.615 0 8.228 2.375 15.248 7.127 21.06 4.751 5.811 11.963 10.731 21.638 14.759a291.458 291.458 0 0 1 10.625 4.575c3.283 1.496 6.119 3.049 8.509 4.66 2.39 1.611 4.276 3.366 5.658 5.265 1.382 1.899 2.073 4.057 2.073 6.474a9.901 9.901 0 0 1-1.296 4.963c-.863 1.524-2.174 2.848-3.93 3.97-1.756 1.122-3.945 1.999-6.565 2.632-2.62.633-5.687.95-9.2.95-5.989 0-11.92-1.05-17.794-3.151-5.875-2.1-11.317-5.25-16.327-9.451Zm-46.036-68.733H140V109H41v22.742h35.345V233h28.137V131.742Z" fill="#FFF" /></svg>
    },
    {
      name: 'Rust',
      metric: '★ 890',
      badge: 'NEW',
      color: 'text-blue-500',
      logo: <svg viewBox="0 0 144 144" className="w-4 h-4"><path d="M67.743 31.035a3.108 3.108 0 012.514 0l27.137 12.193a3.108 3.108 0 011.594 4.088 3.108 3.108 0 01-4.088 1.594l-24.923-11.2-24.923 11.2a3.108 3.108 0 01-4.088-1.594 3.108 3.108 0 011.594-4.088z" fill="currentColor" /><path d="M97.394 43.228a3.108 3.108 0 014.088 1.594l12.193 27.137a3.108 3.108 0 010 2.514l-12.193 27.137a3.108 3.108 0 01-4.088 1.594 3.108 3.108 0 01-1.594-4.088l11.2-24.923-11.2-24.923a3.108 3.108 0 011.594-4.088z" fill="currentColor" /><path d="M77.257 112.965a3.108 3.108 0 01-2.514 0l-27.137-12.193a3.108 3.108 0 01-1.594-4.088 3.108 3.108 0 014.088-1.594l24.923 11.2 24.923-11.2a3.108 3.108 0 014.088 1.594 3.108 3.108 0 01-1.594 4.088z" fill="currentColor" /><path d="M46.606 100.772a3.108 3.108 0 01-4.088-1.594l-12.193-27.137a3.108 3.108 0 010-2.514l12.193-27.137a3.108 3.108 0 014.088-1.594 3.108 3.108 0 011.594 4.088l-11.2 24.923 11.2 24.923a3.108 3.108 0 01-1.594 4.088z" fill="currentColor" /><circle cx="72" cy="72" r="8" fill="#F74C00" /></svg>
    },
  ];
  return (
    <div>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background/50 border border-border/30 hover:bg-background/80 transition-colors group">
            <div className="flex items-center gap-2">
              <div className="opacity-80 group-hover:opacity-100 transition-opacity">{item.logo}</div>
              <span className="text-xs font-medium text-foreground">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold ${item.color}`}>{item.metric}</span>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500 animate-pulse">{item.badge}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* AnimatedBeam: data sources → score */}
      <div ref={containerRef} className="relative mt-3 h-10 flex items-center justify-between px-1">
        <div className="flex flex-col justify-between h-full py-0.5">
          <div ref={ghRef} className="text-[8px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded w-fit">GH</div>
          <div ref={hnRef} className="text-[8px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded w-fit">HN</div>
          <div ref={soRef} className="text-[8px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded w-fit">SO</div>
        </div>
        <div ref={scoreRef} className="w-8 h-8 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-[8px] font-bold text-primary">▲</span>
        </div>
        <AnimatedBeam containerRef={containerRef} fromRef={ghRef} toRef={scoreRef} duration={2} curvature={8} />
        <AnimatedBeam containerRef={containerRef} fromRef={hnRef} toRef={scoreRef} duration={3} curvature={0} />
        <AnimatedBeam containerRef={containerRef} fromRef={soRef} toRef={scoreRef} duration={2.5} curvature={-8} />
      </div>
    </div>
  );
}

function CompareMockup() {
  const techs = [
    {
      name: 'React',
      score: 95,
      color: '#61DAFB',
      logo: <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-3.5 h-3.5"><circle cx="0" cy="0" r="2.05" fill="#61dafb" /><g stroke="#61dafb" strokeWidth="1" fill="none"><ellipse rx="11" ry="4.2" /><ellipse rx="11" ry="4.2" transform="rotate(60)" /><ellipse rx="11" ry="4.2" transform="rotate(120)" /></g></svg>
    },
    {
      name: 'Vue',
      score: 78,
      color: '#42B883',
      logo: <svg viewBox="0 0 256 221" className="w-3.5 h-3.5"><path d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36Z" fill="#41B883" /><path d="M50.56 0 128 133.12 204.8 0h-47.36L128 51.2 97.92 0H50.56Z" fill="#35495E" /></svg>
    },
    {
      name: 'Angular',
      score: 65,
      color: '#DD0031',
      logo: <svg viewBox="0 0 256 256" className="w-3.5 h-3.5"><path fill="#DD0031" d="M128 0L0 45.9l19.5 166.7L128 256l108.5-43.4L256 45.9z" /><path fill="#C3002F" d="M128 0v256l108.5-43.4L256 45.9z" /><path fill="#FFF" d="M128 26.3L47.9 187.1h30.7l16.2-40.4h66.4l16.2 40.4h30.7L128 26.3zm17.2 104.6H110.8L128 83.7l17.2 47.2z" /></svg>
    },
  ];
  return (
    <div className="mt-4 space-y-2.5">
      {techs.map((tech) => (
        <div key={tech.name} className="flex items-center gap-2.5 group">
          <div className="flex items-center gap-1.5 w-16">
            {tech.logo}
            <div className="text-[10px] font-medium text-foreground">{tech.name}</div>
          </div>
          <div className="flex-1 h-4 rounded-full bg-muted/50 overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-1000 group-hover:opacity-100"
              style={{ width: `${tech.score}%`, backgroundColor: tech.color, opacity: 0.8 }}
            />
          </div>
          <div className="w-6 text-[10px] font-bold text-primary text-right tabular-nums">{tech.score}</div>
        </div>
      ))}
    </div>
  );
}

function JobDemandMockup() {
  const bars = [85, 72, 65, 55, 48];
  const labels = ['React', 'Python', 'TS', 'Go', 'Rust'];
  return (
    <div className="mt-4 flex items-end gap-2 justify-center h-16">
      {bars.map((height, i) => (
        <div key={labels[i]} className="flex flex-col items-center gap-1">
          <div
            className="w-6 rounded-t bg-gradient-to-t from-primary/80 to-primary/40 transition-all"
            style={{ height: `${height * 0.6}px` }}
          />
          <span className="text-[9px] text-muted-foreground">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function AIInsightsMockup() {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-start gap-2 px-2 py-1.5 rounded bg-primary/5 border border-primary/20">
        <Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
        <span className="text-[10px] text-muted-foreground">
          <span className="text-foreground font-medium">React</span> shows strong momentum in enterprise
        </span>
      </div>
      <div className="flex items-start gap-2 px-2 py-1.5 rounded bg-background/50 border border-border/30">
        <TrendingUp className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
        <span className="text-[10px] text-muted-foreground">
          <span className="text-foreground font-medium">TypeScript</span> job demand +28% this quarter
        </span>
      </div>
    </div>
  );
}

function AskAIMockup() {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-start gap-2 px-2 py-1.5 rounded bg-muted/30 border border-border/30">
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] font-bold text-primary">Q</span>
        </div>
        <span className="text-[10px] text-muted-foreground italic">Should I learn React or Vue?</span>
      </div>
      <div className="flex items-start gap-2 px-2 py-1.5 rounded bg-primary/5 border border-primary/20">
        <Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
        <span className="text-[10px] text-foreground">
          React has 3x more jobs and stronger momentum...
        </span>
      </div>
    </div>
  );
}

function RealtimeMockup() {
  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-[11px] font-medium text-green-500">Active</span>
      </div>
      <span className="text-[10px] text-muted-foreground">Fresh data · Updated daily</span>
    </div>
  );
}

const features = [
  {
    title: 'Tech Leaderboard',
    description: 'Composite scores built from GitHub activity, HN velocity, Stack Overflow volume, and job demand — updated nightly.',
    gradient: 'from-blue-500/10 via-cyan-500/10 to-transparent',
    large: true,
    mockup: LeaderboardMockup,
  },
  {
    title: 'Compare Technologies',
    description: 'Pick two to four technologies and see them side by side across jobs, momentum, community, and ecosystem health.',
    gradient: 'from-purple-500/10 via-pink-500/10 to-transparent',
    large: true,
    mockup: CompareMockup,
  },
  {
    title: 'Trending Repos',
    description: 'Open-source projects gaining stars faster than usual — a reliable early signal of where the ecosystem is heading.',
    gradient: 'from-orange-500/10 via-amber-500/10 to-transparent',
    large: false,
    mockup: JobDemandMockup,
  },
  {
    title: 'AI Insights',
    description: 'Per-technology AI analysis: what the score means, why it moved, and whether it matters for your career.',
    gradient: 'from-red-500/10 via-orange-500/10 to-transparent',
    large: false,
    mockup: AIInsightsMockup,
  },
  {
    title: 'Ask AI',
    description: 'Ask any career or technology question. Answers are grounded in real trend data, not general knowledge.',
    gradient: 'from-green-500/10 via-emerald-500/10 to-transparent',
    large: false,
    mockup: AskAIMockup,
  },
  {
    title: 'Weekly Digest',
    description: "What moved this week, what didn't, and what's worth watching — delivered as a short, scannable report.",
    gradient: 'from-yellow-500/10 via-lime-500/10 to-transparent',
    large: false,
    mockup: RealtimeMockup,
  },
];

export default function BentoFeaturesNew() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="features" className="py-16 sm:py-20 md:py-32 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-xs">
              <Star className="w-3 h-3 mr-1.5" />
              6 tools. One dashboard.
            </Badge>
          </motion.div>

          <TextAnimation
            as="h2"
            text="Everything you need to make the call"
            classname="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 justify-center"
            variants={{
              hidden: { filter: 'blur(10px)', opacity: 0, y: 20 },
              visible: {
                filter: 'blur(0px)', opacity: 1, y: 0,
                transition: { ease: 'linear' },
              },
            }}
          />

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-foreground/80 dark:text-muted-foreground max-w-2xl mx-auto"
          >
            Rankings, comparisons, trending repos, language data, career quizzes, and AI answers — all in one place.
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Mockup = feature.mockup;
              return (
                <motion.div
                  key={feature.title}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={feature.large ? 'lg:col-span-2' : ''}
                >
                  <div className="group h-full border border-border/50 hover:border-primary/40 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:shadow-primary/10 hover:-translate-y-1 overflow-hidden relative bg-card/50 backdrop-blur-sm shadow-sm cursor-pointer hover:bg-card">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Dynamic border glow on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px hsl(var(--primary) / 0.2)' }} />

                    <div className="relative">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                        {feature.title}
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 -translate-x-1 group-hover:translate-y-0 group-hover:translate-x-0" />
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                      <Mockup />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
