'use client';

import Link from 'next/link';
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo';

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

export default function FooterNew() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-8">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <DevTrendsLogo size="sm" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The intelligence layer for your technical career. Powered by real data, built for developers.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
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
            <Link href="https://github.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              GitHub
            </Link>
            <Link href="https://twitter.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Twitter/X
            </Link>
            <Link href="https://discord.com" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Discord
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
