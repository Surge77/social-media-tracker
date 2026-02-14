'use client'

import React from 'react'
import Link from 'next/link'
import { TrendingUp, Github, Twitter, Linkedin, Mail } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Technologies', href: '/technologies' },
        { name: 'Compare', href: '/compare' },
        { name: 'Methodology', href: '/methodology' },
        { name: 'API', href: '/api/technologies' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/methodology' },
        { name: 'Data Sources', href: '/methodology' },
        { name: 'Changelog', href: '/#changelog' },
        { name: 'Status', href: '/monitoring' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/#about' },
        { name: 'Blog', href: '/#blog' },
        { name: 'Careers', href: '/#careers' },
        { name: 'Contact', href: '/#contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/#privacy' },
        { name: 'Terms of Service', href: '/#terms' },
        { name: 'Cookie Policy', href: '/#cookies' },
        { name: 'Licenses', href: '/#licenses' },
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
    <footer className="border-t bg-card/50">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">DevTrends</span>
            </Link>
            <p className="mb-4 text-sm text-muted-foreground">
              Developer Career Intelligence Platform. Track technology trends to make smarter learning and career decisions.
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background transition-colors hover:border-primary hover:bg-primary/5"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2">
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

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© {currentYear} DevTrends. All rights reserved.</p>
          <p className="text-xs">
            Built with Next.js, TypeScript, Supabase • Data updated daily
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
