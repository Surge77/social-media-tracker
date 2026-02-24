'use client'

import React from 'react'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail, Activity } from 'lucide-react'
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo'
import { DotPattern } from '@/components/ui/dot-pattern'

const NAV_SECTIONS = [
  {
    title: 'Product',
    links: [
      { name: 'Technologies', href: '/technologies' },
      { name: 'Compare', href: '/compare' },
      { name: 'Repos', href: '/repos' },
      { name: 'Languages', href: '/languages' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { name: 'Ask AI', href: '/ask' },
      { name: 'Quiz', href: '/quiz' },
      { name: 'Digest', href: '/digest' },
      { name: 'Methodology', href: '/methodology' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'Home', href: '/' },
      { name: 'Contact', href: 'mailto:hello@devtrends.io' },
    ],
  },
]

const SOCIALS = [
  { name: 'GitHub',   href: 'https://github.com',   Icon: Github },
  { name: 'Twitter',  href: 'https://twitter.com',   Icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com',  Icon: Linkedin },
  { name: 'Email',    href: 'mailto:hello@devtrends.io', Icon: Mail },
]

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-border/40 bg-background/95">
      {/* Dot pattern background */}
      <DotPattern className="opacity-30" />

      {/* Orange gradient rule at top */}
      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />

      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 pt-12 sm:pt-14 pb-0">

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-5">

          {/* Brand column — spans 2 cols */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex mb-5">
              <DevTrendsLogo size="md" />
            </Link>
            <p className="max-w-[260px] text-sm leading-relaxed text-muted-foreground mb-6">
              Developer Career Intelligence Platform. Know what to learn before the market moves.
            </p>

            {/* Social icons */}
            <div className="flex gap-2">
              {SOCIALS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border/50 bg-card/30 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-foreground hover:scale-110"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="col-span-1">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {section.title}
              </p>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    >
                      <span className="h-px w-0 bg-primary transition-all duration-200 group-hover:w-3" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="relative mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/30 py-4 sm:flex-row">
          <p className="text-xs text-muted-foreground/60">
            © {year} DevTrends. All rights reserved.
          </p>
          {/* Live data badge */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <Activity size={10} className="animate-pulse" />
              14 live data sources
            </span>
            <span className="font-mono text-[11px] text-muted-foreground/40">
              v0.1.0
            </span>
          </div>
        </div>
      </div>

      {/* Giant decorative wordmark — fades bottom-to-transparent */}
      <div
        className="pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <p
          className="text-center font-black uppercase leading-none tracking-tighter"
          style={{
            fontSize: 'clamp(3.5rem, 14vw, 9.5rem)',
            background: 'linear-gradient(to bottom, hsl(var(--foreground)/0.06) 0%, transparent 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginTop: '-0.1em',
            paddingBottom: '0.05em',
          }}
        >
          DEVTRENDS
        </p>
      </div>
    </footer>
  )
}

export default Footer
