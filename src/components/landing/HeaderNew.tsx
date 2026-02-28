'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo';
import { ThemePrismSwitch } from '../ThemePrismSwitch';
import { useScrolled } from '@/hooks/useScrolled';

const navItems = [
  { label: 'Technologies', href: '/technologies' },
  { label: 'Compare', href: '/compare' },
  { label: 'Repos', href: '/repos' },
  { label: 'Languages', href: '/languages' },
  { label: 'Ask AI', href: '/ask' },
];

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

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60'
            : 'border-b border-transparent bg-transparent shadow-none backdrop-blur-0'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 py-3">
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
              <div className="hidden md:flex items-center gap-4">
                <Link 
                  href="/methodology" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Methodology
                </Link>
                <Link
                  href="/technologies"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-4 py-1.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                >
                  Start Exploring
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <div className="w-px h-4 bg-border/60 mx-1" />
              </div>

              <ThemePrismSwitch />
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="md:hidden h-9 w-9 rounded-xl border-border/60 bg-background/70 backdrop-blur-sm"
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
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
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            <motion.aside
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="fixed right-0 top-0 z-[70] h-dvh w-[86vw] max-w-[380px] border-l border-border/50 bg-background/95 p-5 shadow-2xl backdrop-blur-2xl md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
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
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="mt-5 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`group flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                        isActive 
                          ? 'border-primary/40 bg-primary/10 text-primary' 
                          : 'border-border/40 bg-card/50 text-foreground hover:border-primary/40 hover:bg-primary/5'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className={`h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                    </Link>
                  );
                })}
              </nav>

            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

