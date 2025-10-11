'use client';

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FloatingIcons from "./FloatingIcons";

const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background"></div>
      
      <FloatingIcons />

      <div className="container relative mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="text-foreground">See what's </span>
          <span className="bg-gradient-to-r from-primary via-warning to-primary bg-clip-text text-transparent">
            trending now
          </span>
          <span className="text-foreground">,</span>
          <br />
          <span className="text-foreground">know </span>
          <span className="text-secondary">WHY</span>
          <span className="text-foreground"> it's trending,</span>
          <br />
          <span className="text-muted-foreground text-4xl md:text-5xl">
            without giving up your data.
          </span>
        </h2>

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
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search trending topics..."
              className="pl-12 pr-20 py-6 text-lg bg-card border-border rounded-full focus:ring-2 focus:ring-primary"
            />
            <Button 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90"
            >
              Go
            </Button>
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
