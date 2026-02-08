'use client';

import { Button } from "@/components/ui/button";
import FloatingIcons from "./FloatingIcons";
import AnimatedCTA from "./AnimatedCTA";
import SharedTitle from "./SharedTitle";

const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background"></div>
      
      <FloatingIcons />

      <div className="container relative mx-auto px-6 text-center">
        <SharedTitle
          variant="hero"
          className="text-5xl md:text-7xl mb-10"
        />

        <div className="max-w-2xl mx-auto mb-12">
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed transition-colors">
            Discover what&apos;s trending across the web with AI-powered insights. 
            Get the full picture without compromising your privacy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AnimatedCTA
              href="/technologies"
              size="lg"
              className="relative px-10 py-4 text-lg font-semibold rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.15),0_0_20px_hsl(var(--primary)/0.3)] overflow-hidden cursor-pointer transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.2),0_0_40px_hsl(var(--primary)/0.5)] before:absolute before:inset-0 before:rounded-full before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.8)_45%,rgba(255,255,255,1)_50%,rgba(255,255,255,0.8)_55%,transparent_75%)] before:bg-[length:200%_200%] before:animate-shimmer hover:before:opacity-100"
              delay={150}
            >
              <span className="relative z-10">Get Started →</span>
            </AnimatedCTA>

            <AnimatedCTA
              href="/technologies"
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-medium rounded-full border-2 hover:bg-primary/5"
              delay={100}
            >
              Explore Trending
            </AnimatedCTA>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground transition-colors">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow transition-colors"></span>
            Transparent
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse-glow transition-colors"></span>
            Explainable
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warning animate-pulse-glow transition-colors"></span>
            Global
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
