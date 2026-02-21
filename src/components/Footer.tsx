'use client'

import React from 'react'
import Link from 'next/link'
import { Github, Linkedin, Mail, Twitter } from 'lucide-react'
import { DevTrendsLogo } from '@/components/shared/DevTrendsLogo'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
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
      title: 'Resources',
      links: [
        { name: 'Quiz', href: '/quiz' },
        { name: 'Ask AI', href: '/ask' },
        { name: 'Methodology', href: '/methodology' },
        { name: 'Digest', href: '/digest' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'Home', href: '/' },
        { name: 'Terminal', href: '/terminal-page' },
        { name: 'Contact', href: 'mailto:hello@devtrends.io' },
      ],
    },
  ]

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com', icon: Github },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
    { name: 'Email', href: 'mailto:hello@devtrends.io', icon: Mail },
  ]

  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center">
              <DevTrendsLogo size="sm" />
            </Link>
            <p className="mb-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Developer Career Intelligence Platform. Track technology trends to make better
              learning and career decisions.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-background transition-colors duration-200 hover:border-primary/60 hover:bg-primary/5"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-border/50 pt-4">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <p>© {currentYear} DevTrends. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
