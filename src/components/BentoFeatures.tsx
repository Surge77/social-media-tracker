'use client';

import { motion } from 'framer-motion';
import { Sparkles, Shield, Globe2, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import FeatureCard from './FeatureCard';

export default function BentoFeatures() {
  return (
    <section className="py-24 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Features</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-foreground">
            Track What Matters
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stay informed with real-time insights from across the web, all in one place.
          </p>
        </div>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {/* Large card - AI Insights */}
          <div className="md:col-span-2 lg:col-span-2">
            <FeatureCard
              icon={Sparkles}
              title="Smart Insights"
              description="Understand not just what's trending, but why. Our AI analyzes patterns and context to help you make sense of emerging trends."
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
              delay={0}
            />
          </div>
          
          {/* Small card - Privacy */}
          <div className="md:col-span-1">
            <FeatureCard
              icon={Shield}
              title="Privacy Focused"
              description="No tracking, no data collection. Your browsing habits remain completely private."
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
              delay={0.05}
            />
          </div>
          
          {/* Small card - Global Coverage */}
          <div className="md:col-span-1">
            <FeatureCard
              icon={Globe2}
              title="Multiple Sources"
              description="Aggregate trends from various sources across technology, business, and culture."
              gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
              delay={0.1}
            />
          </div>
          
          {/* Medium card - Real-time */}
          <div className="md:col-span-1 lg:col-span-1">
            <FeatureCard
              icon={Zap}
              title="Real-Time Updates"
              description="Stay current with frequently refreshed data. See what's trending as it happens."
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              delay={0.15}
            />
          </div>
          
          {/* Medium card - Analytics */}
          <div className="md:col-span-2 lg:col-span-1">
            <FeatureCard
              icon={BarChart3}
              title="Visual Analytics"
              description="Clean, interactive charts and data visualization to track trends over time."
              gradient="bg-gradient-to-br from-pink-500 to-rose-600"
              delay={0.2}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
