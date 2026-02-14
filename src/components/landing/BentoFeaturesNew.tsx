'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, ArrowUpRight, Zap, Bell, CheckCircle2, BarChart3, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Mini mockup components for inside the cards
function LeaderboardMockup() {
  const items = [
    { name: 'shadcn/ui', metric: '★ 1,500', badge: 'HOT', color: 'text-orange-500' },
    { name: 'Svelte 5', metric: '▲ Very Positive', badge: null, color: 'text-green-500' },
    { name: 'Bun', metric: '★ 890', badge: 'NEW', color: 'text-blue-500' },
  ];
  return (
    <div className="mt-4 space-y-2">
      {items.map((item) => (
        <div key={item.name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background/50 border border-border/30">
          <span className="text-xs font-medium text-foreground">{item.name}</span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold ${item.color}`}>{item.metric}</span>
            {item.badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500">{item.badge}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompareMockup() {
  const techs = [
    { name: 'React', score: 95, color: '#61DAFB' },
    { name: 'Vue', score: 78, color: '#42B883' },
    { name: 'Angular', score: 65, color: '#DD0031' },
  ];
  return (
    <div className="mt-4 space-y-2">
      {techs.map((tech) => (
        <div key={tech.name} className="flex items-center gap-2">
          <div className="w-12 text-[10px] font-medium text-foreground">{tech.name}</div>
          <div className="flex-1 h-4 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${tech.score}%`, backgroundColor: tech.color, opacity: 0.8 }}
            />
          </div>
          <div className="w-6 text-[10px] font-bold text-primary text-right">{tech.score}</div>
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
    description: 'Real-time rankings powered by GitHub stars, HN discussions, and community signals.',
    gradient: 'from-blue-500/10 via-cyan-500/10 to-transparent',
    large: true,
    mockup: LeaderboardMockup,
  },
  {
    title: 'Compare Technologies',
    description: 'Side-by-side analysis across job demand, momentum, and ecosystem maturity.',
    gradient: 'from-purple-500/10 via-pink-500/10 to-transparent',
    large: true,
    mockup: CompareMockup,
  },
  {
    title: 'Job Market Intel',
    description: 'Track hiring demand across 100+ technologies in real-time.',
    gradient: 'from-orange-500/10 via-amber-500/10 to-transparent',
    large: false,
    mockup: JobDemandMockup,
  },
  {
    title: 'AI Insights',
    description: 'GPT-powered analysis of trends, momentum, and career impact.',
    gradient: 'from-red-500/10 via-orange-500/10 to-transparent',
    large: false,
    mockup: AIInsightsMockup,
  },
  {
    title: 'Ask AI',
    description: 'Get instant answers about technology choices and career decisions.',
    gradient: 'from-green-500/10 via-emerald-500/10 to-transparent',
    large: false,
    mockup: AskAIMockup,
  },
  {
    title: 'Daily Updates',
    description: 'Fresh data aggregated from 8+ sources including GitHub, HN, and Stack Overflow.',
    gradient: 'from-yellow-500/10 via-lime-500/10 to-transparent',
    large: false,
    mockup: RealtimeMockup,
  },
];

export default function BentoFeaturesNew() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="features" className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-xs">
              <Star className="w-3 h-3 mr-1.5" />
              Career Intelligence at a Glance
            </Badge>
          </motion.div>

          <motion.h2
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
          >
            Your developer career,{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
              supercharged
            </span>
          </motion.h2>

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Our bento dashboard aggregates millions of data points into actionable insights for developers.
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
                  <div className="group h-full border border-border/50 hover:border-primary/40 rounded-2xl p-5 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden relative bg-card/50 backdrop-blur-sm elevation-2 hover:elevation-4">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                      <Mockup />
                    </div>

                    <div className="relative flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 mt-4">
                      Explore
                      <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
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
