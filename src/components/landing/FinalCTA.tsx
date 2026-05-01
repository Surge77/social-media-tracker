'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import AnimatedCTA from '../AnimatedCTA';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useParallaxLayer } from '@/hooks/useParallaxLayer';
import { Meteors } from '@/components/ui/meteors';
import { RetroGrid } from '@/components/ui/retro-grid';
import TextAnimation from '@/components/ui/scroll-text';

const freeForeverWords = ['No account required', 'Free forever', 'No credit card'];

export default function FinalCTA() {
  const prefersReducedMotion = useReducedMotion();

  const orb1 = useParallaxLayer(-30);
  const orb2 = useParallaxLayer(20);
  const orb3 = useParallaxLayer(-15);

  return (
    <section className="relative overflow-hidden py-20 sm:py-32 md:py-40">
      {!prefersReducedMotion && <RetroGrid className="z-0 opacity-40" angle={65} />}
      {!prefersReducedMotion && <Meteors number={15} />}

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]" />

      <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
        <motion.div
          className="absolute -left-12 top-1/4 h-72 w-72 rounded-full bg-orange-600/20 blur-[100px] mix-blend-screen sm:-left-10 sm:h-96 sm:w-96"
          style={prefersReducedMotion ? {} : { x: orb1.x, y: orb1.y }}
        />
        <motion.div
          className="absolute -right-12 top-1/3 h-72 w-72 rounded-full bg-purple-600/20 blur-[100px] mix-blend-screen animation-delay-2000 sm:-right-10 sm:h-96 sm:w-96"
          style={prefersReducedMotion ? {} : { x: orb2.x, y: orb2.y }}
        />
        <motion.div
          className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-pink-600/20 blur-[100px] mix-blend-screen animation-delay-4000 sm:-bottom-20 sm:h-96 sm:w-96"
          style={prefersReducedMotion ? {} : { x: orb3.x, y: orb3.y }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <TextAnimation
            as="h2"
            text="Build the roadmap your career actually needs"
            classname="mb-5 justify-center text-[clamp(2.2rem,8vw,4.75rem)] font-bold text-foreground sm:mb-6"
            letterAnime={false}
            variants={{
              hidden: { filter: 'blur(10px)', opacity: 0, y: 20 },
              visible: {
                filter: 'blur(0px)',
                opacity: 1,
                y: 0,
                transition: { ease: 'linear', duration: 0.4 },
              },
            }}
          />

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mb-8 max-w-xl text-base text-foreground/80 dark:text-muted-foreground sm:mb-10 sm:text-lg"
          >
            Powered by live market signals — GitHub, job boards, community momentum, and more. Know exactly what to learn next for your career.
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 flex items-center justify-center"
          >
            <div className="relative w-full sm:w-auto">
              {!prefersReducedMotion && (
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-orange-500/30 to-amber-500/30 blur-lg animate-[pulse-glow_2.5s_ease-in-out_infinite]" />
              )}
              <AnimatedCTA
                href="/quiz/roadmap"
                size="lg"
                className="group relative flex w-full overflow-hidden rounded-full border-0 bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] active:scale-[0.98] sm:px-12 sm:py-5 sm:text-xl"
                delay={150}
              >
                <span className="flex items-center gap-2">
                  Build My Learning Roadmap
                  <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </span>
              </AnimatedCTA>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {freeForeverWords.map((word, i) => (
              <motion.span
                key={word}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={
                  prefersReducedMotion
                    ? {}
                    : {
                        type: 'spring',
                        stiffness: 120,
                        damping: 20,
                        delay: 0.3 + i * 0.08,
                      }
                }
                className="rounded-full border border-border/40 bg-card/35 px-3 py-1.5 text-sm font-medium text-foreground/90 drop-shadow-sm dark:text-muted-foreground"
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
