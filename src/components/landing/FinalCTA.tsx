'use client';

import { motion } from 'framer-motion';
import AnimatedCTA from '../AnimatedCTA';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Meteors } from '@/components/ui/meteors';
import { BackgroundBeamsCollision } from '@/components/ui/background-beams-collision';

export default function FinalCTA() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <BackgroundBeamsCollision className="py-20 md:py-32">
      {/* Magic UI — meteors */}
      {!prefersReducedMotion && <Meteors number={10} />}

      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />

      {/* Animated gradient mesh */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse animation-delay-1000" />

      <div className="container mx-auto px-6 relative z-30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            Stop learning what{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
              everyone already knows
            </span>
          </motion.h2>

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            See what's rising, what's falling, and what's actually worth learning next.
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center mb-6"
          >
            <AnimatedCTA
              href="/technologies"
              size="lg"
              className="px-12 py-5 text-xl font-semibold rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:scale-[1.05] active:scale-[0.98] transition-all duration-300"
              delay={150}
            >
              See What to Learn Next →
            </AnimatedCTA>
          </motion.div>

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xs text-muted-foreground"
          >
            No account required · Free forever · No credit card
          </motion.p>
        </div>
      </div>
    </BackgroundBeamsCollision>
  );
}
