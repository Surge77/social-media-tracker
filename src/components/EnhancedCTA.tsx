'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import LightweightCTA from './LightweightCTA';

export default function EnhancedCTA() {
  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-semibold mb-6 leading-tight text-foreground">
            Start Tracking Trends
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Stay informed with real-time insights from across the web.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <LightweightCTA 
              href="/dashboard/trending" 
              className="group px-8 py-3 text-base font-medium rounded-full bg-foreground hover:bg-foreground/90 text-background transition-all flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </LightweightCTA>
          </div>
        </div>
      </div>
    </section>
  );
}
