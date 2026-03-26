'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo';
import { useMagneticHover } from '@/hooks/useMagneticHover';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const footerLinks = {
  Product: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Technologies', href: '/technologies' },
    { name: 'Job Market', href: '/jobs' },
    { name: 'Roadmap', href: '/roadmap' },
  ],
  Company: [
    { name: 'About', href: '#about' },
    { name: 'Blog', href: '#blog' },
    { name: 'Careers', href: '#careers' },
    { name: 'Contact', href: '#contact' },
  ],
  Legal: [
    { name: 'Privacy', href: '#privacy' },
    { name: 'Terms', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
  ],
};

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com' },
  { name: 'Twitter/X', href: 'https://twitter.com' },
  { name: 'Discord', href: 'https://discord.com' },
];

/** Animated underline link — line expands from center on hover */
function AnimatedLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      {children}
      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-center scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </Link>
  );
}

/** Social link with magnetic hover pull */
function MagneticSocialLink({ href, name }: { href: string; name: string }) {
  const { x, y, handlePointerMove, handlePointerLeave } = useMagneticHover(0.35);

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x, y }}
      className="inline-block"
    >
      <Link
        href={href}
        className="text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        {name}
      </Link>
    </motion.div>
  );
}

export default function FooterNew() {
  const currentYear = new Date().getFullYear();
  const prefersReducedMotion = useReducedMotion();

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-muted/20 to-background overflow-hidden">
      {/* DEVTRENDS watermark — slow horizontal drift */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.04]">
          <motion.span
            className="text-[12vw] font-black tracking-tighter text-foreground whitespace-nowrap select-none"
            animate={{ x: ['-2%', '2%', '-2%'] }}
            transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
          >
            DEVTRENDS
          </motion.span>
        </div>
      )}

      <div className="container relative mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <DevTrendsLogo size="sm" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Technology trend data for developers who want to know what to learn before it becomes obvious.
            </p>
          </div>

          {/* Link columns with animated underlines */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <AnimatedLink href={link.href}>{link.name}</AnimatedLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} DevTrends. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <MagneticSocialLink key={social.name} href={social.href} name={social.name} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
