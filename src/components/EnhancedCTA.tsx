'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AnimatedCTA from './AnimatedCTA';

export default function EnhancedCTA() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main content */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            Start discovering trends today
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Join thousands staying informed with real-time insights from across the web.
            Get started in seconds—no credit card required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <AnimatedCTA 
              href="/dashboard/trending" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl"
              delay={150}
            >
              Get Started →
            </AnimatedCTA>
            
            <AnimatedCTA 
              href="/dashboard/trending" 
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-medium rounded-full border-2 hover:bg-primary/5"
              delay={100}
            >
              View Demo
            </AnimatedCTA>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
              No credit card required
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              Free to start
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-warning animate-pulse-glow" />
              Privacy protected
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
