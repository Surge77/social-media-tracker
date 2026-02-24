'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInView } from 'framer-motion';

const stats = [
  { value: 100, suffix: '+', label: 'Technologies', description: 'GitHub, jobs, community, ecosystem' },
  { value: 8, suffix: '+', label: 'Data Sources', description: 'GitHub, HN, Stack Overflow, and more' },
  { value: 24, suffix: 'hrs', label: 'Data Freshness', description: 'Scores refresh every night' },
  { value: 100, suffix: '%', label: 'Free', description: 'No account or credit card needed' },
];

const StatCard = React.memo(function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
        {isInView ? (
          <CountUp
            end={stat.value}
            duration={2}
            suffix={stat.suffix}
            enableScrollSpy={false}
          />
        ) : (
          <span>0{stat.suffix}</span>
        )}
      </div>
      <div className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">
        {stat.label}
      </div>
      <div className="text-xs text-muted-foreground">
        {stat.description}
      </div>
    </motion.div>
  );
})

export default function StatsSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-muted/10 to-background relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_60%)]" />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
            {stats.map((stat, index) => (
              <StatCard key={stat.label} stat={stat} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
