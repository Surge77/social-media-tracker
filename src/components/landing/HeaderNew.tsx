'use client';

import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import AnimatedCTA from '../AnimatedCTA';
import { ThemeToggle } from '../ThemeToggle';

export default function HeaderNew() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary transition-colors" />
              <h1 className="text-lg font-bold text-foreground transition-colors">DevTrends</h1>
            </div>
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 transition-colors">
              BETA
            </Badge>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#trending" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Trending
            </a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <AnimatedCTA
              href="/dashboard"
              size="sm"
              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 hover:opacity-90 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            >
              Get Started →
            </AnimatedCTA>
          </div>
        </div>
      </div>
    </header>
  );
}
