'use client';

import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const features = [
  { name: 'GitHub Pulse Tracking', devtrends: true, manual: false, google: false },
  { name: 'HN Sentiment Analysis', devtrends: true, manual: false, google: false },
  { name: 'Real-time Job Matching', devtrends: true, manual: 'partial', google: false },
  { name: 'Auto-generated Roadmaps', devtrends: true, manual: false, google: false },
  { name: 'Multi-source Aggregation', devtrends: true, manual: false, google: 'partial' },
  { name: 'Technology Velocity Scores', devtrends: true, manual: false, google: false },
  { name: 'Career Recommendations', devtrends: true, manual: false, google: false },
];

function StatusIcon({ status }: { status: boolean | string }) {
  if (status === true) return <Check className="w-5 h-5 text-green-500" />;
  if (status === 'partial') return <Minus className="w-5 h-5 text-yellow-500" />;
  return <X className="w-5 h-5 text-muted-foreground/40" />;
}

export default function ComparisonTable() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/10 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            How We Compare
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Everything you need, one dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-border/50 bg-muted/30">
              <div className="text-sm font-medium text-muted-foreground">Feature</div>
              <div className="text-sm font-bold text-primary text-center">DevTrends</div>
              <div className="text-sm font-medium text-muted-foreground text-center">Manual Checking</div>
              <div className="text-sm font-medium text-muted-foreground text-center">Google Trends</div>
            </div>

            {/* Table rows */}
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`grid grid-cols-4 gap-4 px-6 py-4 ${index % 2 === 0 ? 'bg-background/30' : ''} ${index < features.length - 1 ? 'border-b border-border/30' : ''}`}
              >
                <div className="text-sm text-foreground font-medium">{feature.name}</div>
                <div className="flex justify-center"><StatusIcon status={feature.devtrends} /></div>
                <div className="flex justify-center"><StatusIcon status={feature.manual} /></div>
                <div className="flex justify-center"><StatusIcon status={feature.google} /></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
