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

function VelocityMockup() {
  return (
    <div className="mt-4 flex items-center justify-center">
      <div className="relative w-32 h-20">
        <svg viewBox="0 0 120 70" className="w-full h-full">
          <defs>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,60 L15,55 L30,45 L45,50 L60,35 L75,25 L90,20 L105,10 L120,5"
                stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M0,60 L15,55 L30,45 L45,50 L60,35 L75,25 L90,20 L105,10 L120,5 L120,70 L0,70 Z"
                fill="url(#areaGrad)" />
        </svg>
        <div className="absolute bottom-0 right-0 text-xs font-bold text-green-500 flex items-center gap-0.5">
          <ArrowUpRight className="w-3 h-3" /> +20%
        </div>
      </div>
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

function AlertsMockup() {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-start gap-2 px-2 py-1.5 rounded bg-background/50 border border-border/30">
        <Bell className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
        <span className="text-[10px] text-muted-foreground">New feature pushed at <span className="text-foreground font-medium">Google</span></span>
      </div>
      <div className="flex items-start gap-2 px-2 py-1.5 rounded bg-background/50 border border-border/30">
        <Zap className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
        <span className="text-[10px] text-muted-foreground">Rust crossed <span className="text-foreground font-medium">10,000+ jobs</span></span>
      </div>
    </div>
  );
}

function RoadmapMockup() {
  const items = [
    { text: 'Master Next.js 14 Basics', done: true },
    { text: 'Understand Server Actions', done: false, active: true },
    { text: 'Optimize for Web Vitals', done: false },
  ];
  return (
    <div className="mt-4 space-y-2">
      {items.map((item) => (
        <div key={item.text} className={`flex items-center gap-2 px-2 py-1.5 rounded text-[10px] ${item.active ? 'bg-primary/10 border border-primary/20' : 'bg-background/50 border border-border/30'}`}>
          <CheckCircle2 className={`w-3 h-3 flex-shrink-0 ${item.done ? 'text-green-500' : item.active ? 'text-primary' : 'text-muted-foreground/40'}`} />
          <span className={item.done ? 'text-muted-foreground line-through' : 'text-foreground'}>{item.text}</span>
        </div>
      ))}
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
        <span className="text-[11px] font-medium text-green-500">Live</span>
      </div>
      <span className="text-[10px] text-muted-foreground">Updated 3 min ago · Next refresh in 12 min</span>
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
    title: 'Skill Velocity',
    description: 'Personal growth tracking vs industry averages.',
    gradient: 'from-purple-500/10 via-pink-500/10 to-transparent',
    large: true,
    mockup: VelocityMockup,
  },
  {
    title: 'Job Demand',
    description: 'Active hiring signals for your tech stack.',
    gradient: 'from-orange-500/10 via-amber-500/10 to-transparent',
    large: false,
    mockup: JobDemandMockup,
  },
  {
    title: 'Alerts',
    description: 'Know when markets shift or trends emerge.',
    gradient: 'from-red-500/10 via-orange-500/10 to-transparent',
    large: false,
    mockup: AlertsMockup,
  },
  {
    title: 'Learning Roadmap',
    description: 'Personalized recommendations based on market data.',
    gradient: 'from-green-500/10 via-emerald-500/10 to-transparent',
    large: false,
    mockup: RoadmapMockup,
  },
  {
    title: 'Real-Time Updates',
    description: 'Continuously refreshed from top developer communities.',
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
                  <div className="group h-full border border-border/50 hover:border-primary/40 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 overflow-hidden relative bg-card/50 backdrop-blur-sm">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

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
