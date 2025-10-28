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
          className="text-5xl md:text-7xl mb-6" 
        />

        <div className="flex justify-center gap-2 mb-8">
          <Button variant="outline" size="sm" className="rounded-full">
            Reader
          </Button>
          <Button variant="outline" size="sm" className="rounded-full">
            Creator
          </Button>
          <Button variant="outline" size="sm" className="rounded-full">
            Analyst
          </Button>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Discover what&apos;s trending across the web with AI-powered insights. 
            Get the full picture without compromising your privacy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
              Explore Trending
            </AnimatedCTA>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow"></span>
            Transparent
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse-glow"></span>
            Explainable
          </span>
          <span>•</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warning animate-pulse-glow"></span>
            Global
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
