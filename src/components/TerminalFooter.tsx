'use client'

import React from 'react'
import Link from 'next/link'
import { Terminal, Github, Twitter, Linkedin, Mail } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Technologies', href: '/technologies' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Roadmap', href: '/roadmap' },
    { label: 'API', href: '/api' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Methodology', href: '/methodology' },
    { label: 'Data Sources', href: '/sources' },
    { label: 'FAQ', href: '/faq' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Security', href: '/security' },
  ],
}

const socialLinks = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@devtrends.dev', label: 'Email' },
]

export function TerminalFooter() {
  return (
    <footer className="relative border-t border-terminal-border bg-terminal-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-terminal-cyan/20 blur-xl group-hover:bg-terminal-cyan/30 transition-all" />
                <Terminal className="w-8 h-8 text-terminal-cyan relative" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-bold text-terminal-text text-xl leading-none">
                  DevTrends
                </span>
                <span className="font-mono text-xs text-terminal-text-muted uppercase tracking-wider leading-none mt-1">
                  Intelligence Terminal
                </span>
              </div>
            </Link>

            <p className="text-sm text-terminal-text-dim font-sans max-w-xs leading-relaxed">
              Real-time developer career intelligence. Track 200+ technologies across 8 data sources.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-terminal-text-muted hover:text-terminal-cyan transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-xs text-terminal-text-muted uppercase tracking-wider font-mono">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-terminal-text-dim hover:text-terminal-cyan transition-colors font-sans"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section - Terminal style */}
        <div className="pt-8 border-t border-terminal-border">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot terminal-dot-red" />
              <div className="terminal-dot terminal-dot-amber" />
              <div className="terminal-dot terminal-dot-green" />
              <span className="ml-auto text-xs text-terminal-text-muted font-mono">
                system://info
              </span>
            </div>

            <div className="p-4 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-terminal-text-dim">
                <span className="text-terminal-green">$</span>
                <span>system.version</span>
                <span className="text-terminal-cyan">v2.0.1</span>
              </div>

              <div className="flex items-center gap-2 text-terminal-text-dim">
                <span className="text-terminal-green">$</span>
                <span>system.status</span>
                <span className="text-terminal-green">OPERATIONAL</span>
              </div>

              <div className="flex items-center gap-2 text-terminal-text-dim">
                <span className="text-terminal-green">$</span>
                <span>data_sources.active</span>
                <span className="text-terminal-cyan">8/8</span>
              </div>

              <div className="flex items-center gap-2 text-terminal-text-dim">
                <span className="text-terminal-green">$</span>
                <span>uptime</span>
                <span className="text-terminal-green">99.9%</span>
              </div>

              <div className="pt-4 border-t border-terminal-border text-terminal-text-muted">
                © {new Date().getFullYear()} DevTrends. All rights reserved.
                {' · '}
                Built for developers by developers.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
    </footer>
  )
}
