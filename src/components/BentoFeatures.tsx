'use client';

import { motion } from 'framer-motion';
import { Sparkles, Shield, Globe2, Zap, BarChart3, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    description: 'Understand trends with context and clarity, powered by advanced analysis.',
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'Stay current with continuously refreshed data from multiple sources.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'No tracking, no data collection. Your browsing stays completely private.',
  },
  {
    icon: Globe2,
    title: 'Global Sources',
    description: 'Aggregate trends from technology, business, culture, and beyond.',
  },
  {
    icon: BarChart3,
    title: 'Visual Analytics',
    description: 'Clean charts and data visualization make complex trends easy to grasp.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Detection',
    description: 'Spot emerging patterns early and stay ahead of the curve.',
  },
];

export default function BentoFeatures() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
          >
            Everything you need to stay informed
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Powerful features designed to help you discover and understand trends that matter.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
