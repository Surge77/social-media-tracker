'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AnimatedCTA from '@/components/AnimatedCTA';
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo';
import { useScrolled } from '@/hooks/useScrolled';
import { cn } from '@/lib/utils';

export default function HeaderNew() {
  const isScrolled = useScrolled(8);
  const pathname = usePathname();

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'border-b border-border/60 bg-background/82 shadow-sm backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60'
            : 'border-b border-transparent bg-background/30 backdrop-blur-xl'
        }`}
      >
        <div className="app-page flex h-[4.25rem] items-center justify-between gap-4 py-0">
          <div className="flex items-center gap-3">
            <DevTrendsLogo size="sm" />
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 transition-colors">
              BETA
            </Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <AnimatedCTA
              href="/technologies"
              variant="outline"
              className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary md:inline-flex"
            >
              Start Exploring
              <ArrowUpRight className="h-3.5 w-3.5" />
            </AnimatedCTA>
          </div>
        </div>
      </header>
    </>
  );
}
