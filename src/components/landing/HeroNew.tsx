'use client';

import { motion } from 'framer-motion';
import FloatingIcons from '../FloatingIcons';
import AnimatedCTA from '../AnimatedCTA';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const mockLeaderboard = [
  { rank: 1, name: 'React Server Components', score: 94, change: +45, trend: 'up' },
  { rank: 2, name: 'Rust', score: 89, change: +28, trend: 'up' },
  { rank: 3, name: 'Vercel AI SDK', score: 85, change: +18, trend: 'up' },
  { rank: 4, name: 'TypeScript', score: 82, change: +3, trend: 'stable' },
  { rank: 5, name: 'Next.js', score: 80, change: -2, trend: 'down' },
];

function MiniSparkline({ trend }: { trend: string }) {
  const paths = {
    up: 'M0,20 L5,18 L10,15 L15,16 L20,12 L25,10 L30,6 L35,3',
    down: 'M0,5 L5,7 L10,8 L15,10 L20,14 L25,16 L30,18 L35,20',
    stable: 'M0,12 L5,11 L10,13 L15,11 L20,12 L25,10 L30,11 L35,12',
  };
  const color = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#eab308';

  return (
    <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
      <path d={paths[trend as keyof typeof paths]} stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function HeroNew() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <FloatingIcons />

      <div className="container relative mx-auto px-6">
        <div className="text-center max-w-5xl mx-auto">
          {/* Tracking badge */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Badge className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 backdrop-blur-sm">
              <Activity className="w-3.5 h-3.5 mr-2 animate-pulse" />
              NOW TRACKING 4,200+ TECH SIGNALS
            </Badge>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8"
          >
            <span className="text-foreground">Know What to</span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
              Learn Before
            </span>
            <br />
            <span className="text-foreground">Everyone Else</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Track technology trends across GitHub, Hacker News, Stack Overflow, and 5+ sources.
            Make career decisions backed by real data, not opinions.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <AnimatedCTA
              href="/dashboard"
              size="lg"
              className="relative px-10 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] overflow-hidden cursor-pointer transition-shadow duration-300"
              delay={150}
            >
              <span className="relative z-10">Start Tracking Free →</span>
            </AnimatedCTA>

            <AnimatedCTA
              href="/dashboard"
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-medium rounded-full border-2 border-border hover:border-primary/50 hover:bg-primary/5"
              delay={100}
            >
              View Live Trends
            </AnimatedCTA>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-16"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Free forever
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              No credit card
            </span>
            <span className="text-border">•</span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Real-time data
            </span>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 60 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative max-w-3xl mx-auto"
          >
            {/* Glow behind mockup */}
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-primary/10 to-blue-500/20 rounded-3xl blur-2xl" />

            {/* Mockup card */}
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl">
              {/* Mockup header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">devtrends.app — Tech Leaderboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  LIVE · 7:32 AM EST
                </div>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[40px_1fr_80px_80px_50px] gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3 px-3">
                <span>#</span>
                <span>Technology</span>
                <span className="text-right">Score</span>
                <span className="text-right">Change</span>
                <span className="text-right">7D</span>
              </div>

              {/* Table rows */}
              <div className="space-y-1">
                {mockLeaderboard.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    className="grid grid-cols-[40px_1fr_80px_80px_50px] gap-3 items-center px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <span className="text-sm font-bold text-muted-foreground">{item.rank}</span>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {item.name}
                    </span>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {item.score}
                      </div>
                    </div>
                    <span className={`text-sm font-semibold text-right flex items-center justify-end gap-1 ${
                      item.trend === 'up' ? 'text-green-500' : item.trend === 'down' ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {item.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : item.trend === 'down' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                    <div className="flex justify-end">
                      <MiniSparkline trend={item.trend} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
