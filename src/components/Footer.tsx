'use client'

import React from 'react'
import Link from 'next/link'
import { Activity, Github, Linkedin, Mail, Twitter } from 'lucide-react'
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo'
import { DotPattern } from '@/components/ui/dot-pattern'

const NAV_SECTIONS = [
  {
    title: 'Explore',
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
      { name: 'Digest', href: '/digest' },
      { name: 'Quiz', href: '/quiz' },
      { name: 'Methodology', href: '/methodology' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'Home', href: '/' },
      { name: 'Docs', href: '/docs' },
      { name: 'Contact', href: 'mailto:hello@devtrends.io' },
    ],
  },
] as const

const SOCIALS = [
  { name: 'GitHub', href: 'https://github.com', Icon: Github },
  { name: 'Twitter', href: 'https://twitter.com', Icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com', Icon: Linkedin },
  { name: 'Email', href: 'mailto:hello@devtrends.io', Icon: Mail },
] as const

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-border/50 bg-background/95">
      <DotPattern className="mobile-noise-hidden opacity-20" />
      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

      <div className="app-page relative pb-0 pt-10 sm:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,2fr)] lg:gap-12">
          <div className="space-y-5">
            <Link href="/" className="inline-flex">
              <DevTrendsLogo size="md" />
            </Link>
            <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-[15px]">
              Developer career intelligence built from live market signals. Track what is rising, what is stable, and what is fading before the crowd reacts.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {SOCIALS.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/35 text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/8 hover:text-foreground"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="p-4 sm:p-0">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
                  {section.title}
                </p>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border/40 py-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground/70">
            © {year} DevTrends. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <Activity size={10} className="animate-pulse" />
              14 live data sources
            </span>
            <span className="font-mono text-[11px] text-muted-foreground/45">v0.1.0</span>
          </div>
        </div>
      </div>

      <div className="mobile-noise-hidden pointer-events-none select-none overflow-hidden" aria-hidden>
        <p
          className="text-center font-black uppercase leading-none tracking-tighter"
          style={{
            fontSize: 'clamp(4rem, 12vw, 8.5rem)',
            background: 'linear-gradient(to bottom, hsl(var(--foreground)/0.05) 0%, transparent 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginTop: '-0.06em',
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
