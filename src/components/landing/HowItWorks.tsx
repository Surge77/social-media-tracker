'use client';

import { motion } from 'framer-motion';
import { Download, Brain, Rocket } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const steps = [
  {
    number: '1',
    title: 'COLLECT',
    description: 'We scrape 50+ developer platforms every minute for new trends, projects, and sentiment.',
    icon: Download,
    color: 'from-blue-500 to-cyan-500',
    glow: 'bg-blue-500/20',
  },
  {
    number: '2',
    title: 'ANALYZE',
    description: 'Our LLM-powered engine filters out the noise and ranks technologies by real adoption potential.',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    glow: 'bg-purple-500/20',
  },
  {
    number: '3',
    title: 'DECIDE',
    description: 'Receive personalized roadmap suggestions and alerts tailored to the fastest-growing stacks.',
    icon: Rocket,
    color: 'from-orange-500 to-amber-500',
    glow: 'bg-orange-500/20',
  },
];

export default function HowItWorks() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/10 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            The Intelligence Loop
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            From raw data to career-changing decisions in three simple steps.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-[2px]">
              <div className="w-full h-full bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-orange-500/40" />
              <motion.div
                className="absolute inset-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                style={{ transformOrigin: 'left' }}
              />
            </div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center relative"
                >
                  {/* Icon circle */}
                  <div className="relative inline-flex mb-6">
                    <div className={`absolute inset-0 ${step.glow} rounded-full blur-xl scale-150`} />
                    <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-9 h-9 text-white" />
                    </div>
                  </div>

                  {/* Step number + title */}
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    {step.number}. {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
