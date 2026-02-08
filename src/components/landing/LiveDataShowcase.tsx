'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const trendingTech = [
  { name: 'Rust', velocity: '+20%', score: 78, hot: true },
  { name: 'Svelte', velocity: '+12%', score: 68, hot: false },
  { name: 'Bun', velocity: '+11%', score: 62, hot: false },
  { name: 'Next.js', velocity: '+8%', score: 85, hot: false },
  { name: 'Deno', velocity: '+7%', score: 55, hot: false },
];

const tagCloudItems = [
  { name: 'React', size: 'text-2xl', opacity: 'opacity-100' },
  { name: 'Python', size: 'text-xl', opacity: 'opacity-90' },
  { name: 'TypeScript', size: 'text-2xl', opacity: 'opacity-95' },
  { name: 'Rust', size: 'text-lg', opacity: 'opacity-90' },
  { name: 'Go', size: 'text-base', opacity: 'opacity-80' },
  { name: 'Next.js', size: 'text-lg', opacity: 'opacity-85' },
  { name: 'Docker', size: 'text-base', opacity: 'opacity-75' },
  { name: 'AI', size: 'text-xl', opacity: 'opacity-90' },
  { name: 'Svelte', size: 'text-base', opacity: 'opacity-80' },
  { name: 'Kubernetes', size: 'text-sm', opacity: 'opacity-70' },
  { name: 'Vue', size: 'text-base', opacity: 'opacity-75' },
  { name: 'PostgreSQL', size: 'text-sm', opacity: 'opacity-70' },
  { name: 'Node.js', size: 'text-lg', opacity: 'opacity-85' },
  { name: 'Tailwind', size: 'text-base', opacity: 'opacity-80' },
  { name: 'Bun', size: 'text-sm', opacity: 'opacity-75' },
];

export default function LiveDataShowcase() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="trending" className="py-20 md:py-32 bg-gradient-to-b from-muted/10 via-background to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.05),transparent_60%)]" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            See What&apos;s Trending{' '}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Right Now
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A real peek into the data powering DevTrends.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trending list */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: -30 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Top Rising This Week</h3>
            </div>

            <div className="space-y-3">
              {trendingTech.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5">{index + 1}</span>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {tech.name}
                    </span>
                    {tech.hot && (
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Score: {tech.score}</span>
                    <span className="text-sm font-bold text-green-500 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {tech.velocity}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tag cloud */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 30 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 flex flex-col"
          >
            <h3 className="text-lg font-bold text-foreground mb-5">Technology Cloud</h3>
            <div className="flex-1 flex flex-wrap items-center justify-center gap-3 py-4">
              {tagCloudItems.map((tag, index) => (
                <motion.span
                  key={tag.name}
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.15 }}
                  className={`${tag.size} ${tag.opacity} font-semibold text-foreground hover:text-primary transition-colors cursor-pointer`}
                >
                  {tag.name}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
