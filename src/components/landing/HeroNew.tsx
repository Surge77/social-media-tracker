'use client';

import { motion } from 'framer-motion';
import FloatingIcons from '../FloatingIcons';
import AnimatedCTA from '../AnimatedCTA';
import { ArrowUpRight, ArrowDownRight, Minus, Users, Database, Zap } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from 'next-themes';
import { Sparkline } from '@/components/technologies/Sparkline';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { BorderBeam } from '@/components/ui/border-beam';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { MorphingText } from '@/components/ui/morphing-text';
import { HyperText } from '@/components/ui/hyper-text';

const MOCK_SPARKLINES = {
  up:     [52, 54, 51, 56, 58, 55, 62, 66, 70, 75, 78, 82, 86, 90, 94],
  down:   [88, 85, 87, 82, 79, 80, 75, 71, 68, 65, 62, 60, 58, 55, 52],
  stable: [72, 74, 71, 75, 73, 76, 72, 74, 73, 75, 72, 74, 73, 75, 74],
};

const mockLeaderboard = [
  { rank: 1, name: 'TypeScript', score: 94, change: +12, trend: 'up' },
  { rank: 2, name: 'Rust', score: 89, change: +28, trend: 'up' },
  { rank: 3, name: 'Python', score: 85, change: +9, trend: 'up' },
  { rank: 4, name: 'Go', score: 78, change: +3, trend: 'stable' },
  { rank: 5, name: 'React', score: 74, change: -4, trend: 'down' },
];

export default function HeroNew() {
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10">
      {/* ── Layer 1: solid background base ─────────────────────────────── */}
      <div className="absolute inset-0 bg-background" />

      {/* ── Layer 2: FlickeringGrid + masking overlays ──────────────────
           The canvas fills the section via absolute inset-0.
           Three overlay passes ensure uniform masking on every edge:
             a) Radial vignette  — fades all four corners symmetrically.
                ellipse 50% 50% means horizontal radius = 50% of element
                width = exact center-to-edge distance, so the right/left
                edges always reach 100% background opacity.
             b) Left + right linear fades — hard-edge backup so even at
                odd viewport widths the side edges are fully masked.
             c) Top + bottom linear fades — clean crop at header/section end.
      ──────────────────────────────────────────────────────────────── */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <FlickeringGrid
            squareSize={4}
            gridGap={6}
            color={isLight ? '#9a3412' : '#f97316'}
            maxOpacity={isLight ? 0.35 : 0.22}
            flickerChance={0.10}
          />

          {/* a) Radial vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 50% 50% at 50% 50%, transparent 30%, hsl(var(--background)) 100%)',
            }}
          />

          {/* b) Left + right edge fades */}
          <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent" />

          {/* c) Top + bottom edge fades */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      {/* ── Layer 3: subtle centered glow (square = equal spread) ────── */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <FloatingIcons />

      <div className="container relative mx-auto px-6">
        <div className="text-center max-w-5xl mx-auto">

          {/* Badge — Magic UI AnimatedGradientText */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <AnimatedGradientText>
              <span className="relative flex h-2 w-2 mr-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 bg-clip-text text-transparent font-semibold tracking-wide">
                OPEN BETA
              </span>
            </AnimatedGradientText>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-8"
          >
            <HyperText
              text="Know what to learn"
              className="block text-3xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em] leading-[1.02] text-foreground"
              duration={1000}
            />
            <span className="mt-1.5 block text-2xl sm:text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.04] bg-gradient-to-r from-orange-700 via-amber-600 to-orange-600 dark:from-orange-500 dark:via-amber-500 dark:to-orange-400 bg-clip-text text-transparent animate-gradient">
              before the market shifts
            </span>
          </motion.h1>

          {/* Magic UI — MorphingText data signal ticker */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mb-4 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs">
              <span className="text-muted-foreground font-medium shrink-0">Tracking:</span>
              <MorphingText
                texts={["GitHub stars", "Stack Overflow velocity", "job postings", "community sentiment", "npm downloads"]}
                className="font-semibold text-primary"
              />
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-foreground/80 dark:text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Aggregated into daily scores for 100+ technologies.
            Skip the guesswork. See what the data actually says.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center justify-center mb-6"
          >
            <AnimatedCTA
              href="/technologies"
              size="lg"
              className="group relative px-12 py-5 text-xl font-semibold rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-[0_0_30px_rgba(249,115,22,0.3),0_15px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5),0_20px_40px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98] overflow-hidden cursor-pointer transition-all duration-300"
              delay={150}
            >
              <span className="relative z-10 flex items-center gap-2">
                See the Rankings
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </span>
            </AnimatedCTA>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-sm text-foreground/65 dark:text-muted-foreground mb-8"
          >
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#61DAFB]/10 border-2 border-background flex items-center justify-center p-1.5">
                <svg viewBox="-11.5 -10.23174 23 20.46348" className="w-full h-full">
                  <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
                  <g stroke="#61dafb" strokeWidth="1" fill="none">
                    <ellipse rx="11" ry="4.2"/>
                    <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
                    <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
                  </g>
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#3178C6]/10 border-2 border-background flex items-center justify-center p-1">
                <svg viewBox="0 0 256 256" className="w-full h-full">
                  <rect width="256" height="256" fill="#3178C6" rx="28"/>
                  <path d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 0 0-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.881-2.949-9.761-4.359-2.879-1.41-5.327-2.848-7.342-4.316-2.016-1.467-3.571-3.021-4.665-4.661-1.094-1.64-1.641-3.495-1.641-5.567 0-1.899.489-3.61 1.468-5.135s2.362-2.834 4.147-3.927c1.785-1.094 3.973-1.942 6.565-2.547 2.591-.604 5.471-.906 8.638-.906 2.304 0 4.737.173 7.299.518 2.563.345 5.14.877 7.732 1.597a53.669 53.669 0 0 1 7.558 2.719 41.7 41.7 0 0 1 6.781 3.797v-25.807c-4.204-1.611-8.797-2.805-13.778-3.582-4.981-.777-10.697-1.165-17.147-1.165-6.565 0-12.784.705-18.658 2.115-5.874 1.409-11.043 3.61-15.506 6.602-4.463 2.993-7.99 6.805-10.582 11.437-2.591 4.632-3.887 10.17-3.887 16.615 0 8.228 2.375 15.248 7.127 21.06 4.751 5.811 11.963 10.731 21.638 14.759a291.458 291.458 0 0 1 10.625 4.575c3.283 1.496 6.119 3.049 8.509 4.66 2.39 1.611 4.276 3.366 5.658 5.265 1.382 1.899 2.073 4.057 2.073 6.474a9.901 9.901 0 0 1-1.296 4.963c-.863 1.524-2.174 2.848-3.93 3.97-1.756 1.122-3.945 1.999-6.565 2.632-2.62.633-5.687.95-9.2.95-5.989 0-11.92-1.05-17.794-3.151-5.875-2.1-11.317-5.25-16.327-9.451Zm-46.036-68.733H140V109H41v22.742h35.345V233h28.137V131.742Z" fill="#FFF"/>
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#41B883]/10 border-2 border-background flex items-center justify-center p-1.5">
                <svg viewBox="0 0 256 221" className="w-full h-full">
                  <path d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36Z" fill="#41B883"/>
                  <path d="M50.56 0 128 133.12 204.8 0h-47.36L128 51.2 97.92 0H50.56Z" fill="#35495E"/>
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#3776AB]/10 border-2 border-background flex items-center justify-center p-1">
                <svg viewBox="16 16 32 32" className="w-full h-full">
                  <defs>
                    <linearGradient id="pyGrad1" x1="19.075" x2="34.898" y1="18.782" y2="34.658" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#387EB8"/><stop offset="1" stopColor="#366994"/>
                    </linearGradient>
                    <linearGradient id="pyGrad2" x1="28.809" x2="45.803" y1="28.882" y2="45.163" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FFE052"/><stop offset="1" stopColor="#FFC331"/>
                    </linearGradient>
                  </defs>
                  <path fill="url(#pyGrad1)" d="M31.885 16c-8.124 0-7.617 3.523-7.617 3.523l.01 3.65h7.752v1.095H21.197S16 23.678 16 31.876c0 8.196 4.537 7.906 4.537 7.906h2.708v-3.804s-.146-4.537 4.465-4.537h7.688s4.32.07 4.32-4.175v-7.019S40.374 16 31.885 16zm-4.275 2.454a1.394 1.394 0 1 1 0 2.79 1.393 1.393 0 0 1-1.395-1.395c0-.771.624-1.395 1.395-1.395z"/>
                  <path fill="url(#pyGrad2)" d="M32.115 47.833c8.124 0 7.617-3.523 7.617-3.523l-.01-3.65H31.97v-1.095h10.832S48 40.155 48 31.958c0-8.197-4.537-7.906-4.537-7.906h-2.708v3.803s.146 4.537-4.465 4.537h-7.688s-4.32-.07-4.32 4.175v7.019s-.656 4.247 7.833 4.247zm4.275-2.454a1.393 1.393 0 0 1-1.395-1.395 1.394 1.394 0 1 1 1.395 1.395z"/>
                </svg>
              </div>
            </div>
            <span className="font-medium">
              <span className="text-foreground">100+ technologies</span> tracked with live data
            </span>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-foreground/65 dark:text-muted-foreground mb-16"
          >
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="font-medium">Free forever</span>
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-medium">No credit card</span>
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4 text-amber-500" />
              <span className="font-medium">8+ data sources</span>
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              <span className="font-medium">Updated daily</span>
            </span>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 60 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative max-w-3xl mx-auto group"
          >
            <div className="absolute -inset-6 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500" />
            <div className="absolute -inset-4 bg-purple-500/8 rounded-3xl blur-2xl opacity-50" />

            {/* Card with Magic UI BorderBeam */}
            <div className="relative bg-card/90 backdrop-blur-2xl border border-border/50 rounded-2xl p-6 shadow-[0_20px_70px_rgba(0,0,0,0.3),0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_30px_90px_rgba(0,0,0,0.4),0_15px_40px_rgba(0,0,0,0.25)] transition-shadow duration-500 overflow-hidden">
              <BorderBeam size={300} duration={10} colorFrom="#f97316" colorTo="#f59e0b" />

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
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className={`grid grid-cols-[40px_1fr_80px_80px_50px] gap-3 items-center px-3 py-2.5 rounded-lg hover:bg-muted/80 hover:shadow-[inset_0_0_0_1px_rgba(249,115,22,0.2)] transition-all duration-200 group cursor-pointer ${index === 0 ? 'bg-orange-500/5' : ''}`}
                  >
                    <span className={`text-sm font-bold ${index === 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>{item.rank}</span>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {item.name}
                    </span>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${index === 0 ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' : 'bg-primary/10 text-primary'} text-xs font-bold`}>
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
                      <Sparkline
                        data={MOCK_SPARKLINES[item.trend as keyof typeof MOCK_SPARKLINES]}
                        width={60}
                        height={24}
                        showDelta={false}
                      />
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
