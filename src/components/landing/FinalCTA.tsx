'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import AnimatedCTA from '../AnimatedCTA';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useParallaxLayer } from '@/hooks/useParallaxLayer';
import { Meteors } from '@/components/ui/meteors';
import { RetroGrid } from '@/components/ui/retro-grid';
import TextAnimation from '@/components/ui/scroll-text';

const freeForeverWords = ['No account required', '·', 'Free forever', '·', 'No credit card'];

export default function FinalCTA() {
  const prefersReducedMotion = useReducedMotion();

  // Parallax layers for each orb — different depths for spatial effect
  const orb1 = useParallaxLayer(-30);
  const orb2 = useParallaxLayer(20);
  const orb3 = useParallaxLayer(-15);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 md:py-40">
      {/* 1. Retro Grid Background */}
      {!prefersReducedMotion && <RetroGrid className="z-0 opacity-40" angle={65} />}

      {/* 2. Meteors */}
      {!prefersReducedMotion && <Meteors number={15} />}

      {/* 3. Gradient Overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)] z-0" />

      {/* 4. Animated Glowing Orbs — now with parallax mouse-drift */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-10 w-96 h-96 bg-orange-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"
          style={prefersReducedMotion ? {} : { x: orb1.x, y: orb1.y }}
        />
        <motion.div
          className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"
          style={prefersReducedMotion ? {} : { x: orb2.x, y: orb2.y }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"
          style={prefersReducedMotion ? {} : { x: orb3.x, y: orb3.y }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <TextAnimation
            as="h2"
            text="Stop learning what everyone already knows"
            classname="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 sm:mb-6 justify-center"
            letterAnime={false}
            variants={{
              hidden: { filter: 'blur(10px)', opacity: 0, y: 20 },
              visible: {
                filter: 'blur(0px)', opacity: 1, y: 0,
                transition: { ease: 'linear', duration: 0.4 },
              },
            }}
          />

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg text-foreground/80 dark:text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto"
          >
            See what's rising, what's falling, and what's actually worth learning next.
          </motion.p>

          {/* CTA button with idle glow pulse ring */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="relative">
              {/* Idle pulsing glow ring */}
              {!prefersReducedMotion && (
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-orange-500/30 to-amber-500/30 blur-lg animate-[pulse-glow_2.5s_ease-in-out_infinite]" />
              )}
              <AnimatedCTA
                href="/technologies"
                size="lg"
                className="group relative px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:scale-[1.05] active:scale-[0.98] transition-all duration-300 overflow-hidden"
                delay={150}
              >
                <span className="flex items-center gap-2">
                  Start Exploring
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </span>
              </AnimatedCTA>
            </div>
          </motion.div>

          {/* "Free forever" text — staggered word-by-word reveal */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {freeForeverWords.map((word, i) => (
              <motion.span
                key={i}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={prefersReducedMotion ? {} : {
                  type: 'spring',
                  stiffness: 120,
                  damping: 20,
                  delay: 0.3 + i * 0.08,
                }}
                className="text-sm font-medium text-foreground/90 dark:text-muted-foreground drop-shadow-sm"
              >
                {word}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
