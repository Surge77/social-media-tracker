'use client';

import { motion } from 'framer-motion';
import AnimatedCTA from '../AnimatedCTA';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Meteors } from '@/components/ui/meteors';
import { RetroGrid } from '@/components/ui/retro-grid';
import TextAnimation from '@/components/ui/scroll-text';

export default function FinalCTA() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 md:py-40">
      {/* 1. Retro Grid Background */}
      {!prefersReducedMotion && <RetroGrid className="z-0 opacity-40" angle={65} />}

      {/* 2. Meteors */}
      {!prefersReducedMotion && <Meteors number={15} />}

      {/* 3. Gradient Overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)] z-0" />

      {/* 4. Animated Glowing Orbs */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-96 h-96 bg-orange-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-pink-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
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
            className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto"
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
              className="group relative px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:scale-[1.05] active:scale-[0.98] transition-all duration-300 overflow-hidden"
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
    </section>
  );
}
