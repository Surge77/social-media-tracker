'use client';

import { Badge } from '@/components/ui/badge';
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo';
import AnimatedCTA from '../AnimatedCTA';
import { ThemeToggle } from '../ThemeToggle';

export default function HeaderNew() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <DevTrendsLogo size="sm" />
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 transition-colors">
              BETA
            </Badge>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="/technologies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Technologies
            </a>
            <a href="/technologies?sort=momentum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Trending
            </a>
            <a href="/methodology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Methodology
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
