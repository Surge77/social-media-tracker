'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SharedTitleProps {
  variant?: 'hero' | 'header';
  className?: string;
}

const SharedTitle = ({ variant = 'hero', className = '' }: SharedTitleProps) => {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const isHero = variant === 'hero';
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isHero) {
    return (
      <motion.h2 
        layoutId={prefersReducedMotion ? undefined : "main-title"}
        className={`font-bold leading-tight ${className}`}
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span className="text-foreground">See what&apos;s </span>
        <motion.span 
          layoutId={prefersReducedMotion ? undefined : "trending-text"}
          className="bg-gradient-to-r from-primary via-warning to-primary bg-clip-text text-transparent"
        >
          trending now
        </motion.span>
        <span className="text-foreground">,</span>
        <br />
        <span className="text-foreground">know </span>
        <span className="text-secondary">WHY</span>
        <span className="text-foreground"> it&apos;s trending,</span>
        <br />
        <span className="text-muted-foreground text-4xl md:text-5xl">
          without giving up your data.
        </span>
      </motion.h2>
    );
  }

  return (
    <motion.div 
      layoutId={prefersReducedMotion ? undefined : "main-title"}
      className={`flex items-center gap-2 ${className}`}
      initial={isDashboard && !prefersReducedMotion ? { opacity: 0, x: -20 } : isDashboard ? { opacity: 0 } : false}
      animate={isDashboard && !prefersReducedMotion ? { opacity: 1, x: 0 } : isDashboard ? { opacity: 1 } : {}}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <TrendingUp className="h-6 w-6 text-primary" aria-hidden="true" />
      <motion.h1 
        layoutId={prefersReducedMotion ? undefined : "trending-text"}
        className="text-xl font-bold text-foreground"
      >
        Public Trending
      </motion.h1>
    </motion.div>
  );
};

export default SharedTitle;