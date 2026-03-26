'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import TextAnimation from '@/components/ui/scroll-text'

const IconCloud = dynamic(
  () => import('@/components/ui/icon-cloud').then(m => ({ default: m.IconCloud })),
  { ssr: false, loading: () => <div className="h-[320px]" /> },
)

const techPills = ['React', 'Rust', 'TypeScript', 'Go', 'Python', 'Kubernetes']

export default function TechCloudSection() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_60%)]" />

      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">

            {/* Text side */}
            <div className="flex-1 text-center md:text-left">
              <motion.p
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary"
              >
                100+ technologies
              </motion.p>
              <TextAnimation
                as="h2"
                text="Every language, framework, and tool that matters"
                classname="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl"
                direction="left"
                variants={{
                  hidden: { filter: 'blur(8px)', opacity: 0, x: 20 },
                  visible: {
                    filter: 'blur(0px)', opacity: 1, x: 0,
                    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
                  },
                }}
              />
              <motion.p
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-base text-muted-foreground leading-relaxed"
              >
                From JavaScript frameworks to systems languages, cloud platforms
                to databases — if developers are talking about it, we're
                tracking it. Scores updated every 24 hours across all signals.
              </motion.p>

              {/* Tech pills with stagger + hover pop */}
              <div className="mt-6 flex flex-wrap gap-2 md:justify-start justify-center">
                {techPills.map((t, i) => (
                  <motion.span
                    key={t}
                    initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                    whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={prefersReducedMotion ? {} : {
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2 + i * 0.05,
                    }}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.12, y: -2 }}
                    className="cursor-default rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 hover:border-primary/40"
                  >
                    {t}
                  </motion.span>
                ))}
                <motion.span
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={prefersReducedMotion ? {} : {
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2 + techPills.length * 0.05,
                  }}
                  className="rounded-full border border-border/40 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  +94 more
                </motion.span>
              </div>
            </div>

            {/* Icon cloud */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? {} : {
                type: 'spring',
                stiffness: 80,
                damping: 20,
                delay: 0.15,
              }}
              className="w-full flex-1 max-w-[380px]"
            >
              <IconCloud />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
