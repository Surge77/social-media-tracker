'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo';
import { ThemePrismSwitch } from '../ThemePrismSwitch';
import { useScrolled } from '@/hooks/useScrolled';
import { cn } from '@/lib/utils';

const NAV_SECTIONS = [
  {
    title: 'Explore',
    links: [
      { label: 'Technologies', href: '/technologies' },
      { label: 'Compare', href: '/compare' },
      { label: 'Repos', href: '/repos' },
      { label: 'Languages', href: '/languages' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { label: 'Ask AI', href: '/ask' },
      { label: 'Methodology', href: '/methodology' },
    ],
  },
] as const;

export default function HeaderNew() {
  const isScrolled = useScrolled(8);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

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

          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/technologies" className={cn('rounded-full px-3 py-2 text-sm font-medium transition-colors', isActive('/technologies') ? 'bg-muted/60 text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              Technologies
            </Link>
            <Link href="/compare" className={cn('rounded-full px-3 py-2 text-sm font-medium transition-colors', isActive('/compare') ? 'bg-muted/60 text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              Compare
            </Link>
            <Link href="/repos" className={cn('rounded-full px-3 py-2 text-sm font-medium transition-colors', isActive('/repos') ? 'bg-muted/60 text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              Repos
            </Link>
            <Link href="/ask" className={cn('rounded-full px-3 py-2 text-sm font-medium transition-colors', isActive('/ask') ? 'bg-muted/60 text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              Ask AI
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/technologies"
              className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary md:inline-flex"
            >
              Start Exploring
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <ThemePrismSwitch />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-border/60 bg-background/70 backdrop-blur-sm lg:hidden"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              key="overlay"
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />

            <motion.aside
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="safe-bottom fixed right-0 top-0 z-[70] flex h-dvh w-[min(92vw,24rem)] flex-col border-l border-border/70 bg-background/96 px-4 pb-5 pt-4 shadow-2xl backdrop-blur-2xl lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-2.5">
                  <DevTrendsLogo size="sm" />
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                    OPEN BETA
                  </Badge>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-xl"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 flex-1 space-y-5 overflow-y-auto">
                {NAV_SECTIONS.map((section) => (
                  <section key={section.title} className="space-y-2">
                    <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
                      {section.title}
                    </p>
                    <div className="space-y-2">
                      {section.links.map((item) => {
                        const active = Boolean(isActive(item.href));

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                              'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all',
                              active
                                ? 'border-primary/40 bg-primary/10 text-foreground shadow-[inset_0_0_0_1px_rgba(249,115,22,0.18)]'
                                : 'border-border/60 bg-card/35 text-foreground/90 hover:border-primary/25 hover:bg-card/60'
                            )}
                          >
                            <span>{item.label}</span>
                            <ArrowUpRight className={cn('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground')} />
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <div className="grid gap-2 border-t border-border/50 pt-4">
                <Link
                  href="/technologies"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <span>Open technology explorer</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/quiz/learn-next"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/40 px-4 py-3 text-sm font-medium text-foreground"
                >
                  <span>Take the career quiz</span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
