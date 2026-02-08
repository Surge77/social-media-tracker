'use client';

import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    { name: 'Privacy', href: '#privacy' },
    { name: 'Terms', href: '#terms' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">DevTrends</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {currentYear} DevTrends. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
