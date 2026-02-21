'use client';

import { Badge } from '@/components/ui/badge';
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo';
import { ThemeToggle } from '../ThemeToggle';
import { useScrolled } from '@/hooks/useScrolled';

export default function HeaderNew() {
  const isScrolled = useScrolled(8);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60'
          : 'border-b border-transparent bg-transparent shadow-none backdrop-blur-0'
      }`}
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <DevTrendsLogo size="sm" />
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 transition-colors">
              BETA
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
