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
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row mb-4">
            <p>© {currentYear} DevTrends. All rights reserved.</p>
            <p className="text-xs">Data updated daily from 8+ sources</p>
          </div>

          {/* Tech Stack Icons */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mr-2">Built with:</p>
            <div className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
              {/* Next.js */}
              <div className="group relative" title="Next.js">
                <svg viewBox="0 0 180 180" className="w-5 h-5">
                  <mask id="nextMask"><circle cx="90" cy="90" r="90" fill="currentColor"/></mask>
                  <g mask="url(#nextMask)"><circle cx="90" cy="90" r="90"/><path d="M149.508 157.52L69.142 54H54v71.97h12.114V69.384l73.885 95.461a90.304 90.304 0 009.509-7.325z" fill="url(#nextGrad)"/><path d="M115 54h12v72h-12z" fill="url(#nextGrad2)"/></g>
                  <defs><linearGradient id="nextGrad" x1="109" y1="116.5" x2="144.5" y2="160.5"><stop stopColor="#fff"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient><linearGradient id="nextGrad2" x1="121" y1="54" x2="120.799" y2="106.875"><stop stopColor="#fff"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient></defs>
                </svg>
              </div>

              {/* TypeScript */}
              <div className="group relative" title="TypeScript">
                <svg viewBox="0 0 256 256" className="w-5 h-5">
                  <rect width="256" height="256" fill="#3178C6" rx="28"/>
                  <path d="M150.518 200.475v27.62c4.492 2.302 9.805 4.028 15.938 5.179 6.133 1.151 12.597 1.726 19.393 1.726 6.622 0 12.914-.633 18.874-1.899 5.96-1.266 11.187-3.352 15.678-6.257 4.492-2.906 8.048-6.704 10.669-11.394 2.62-4.689 3.93-10.486 3.93-17.391 0-5.006-.749-9.394-2.246-13.163a30.748 30.748 0 0 0-6.479-10.055c-2.821-2.935-6.205-5.567-10.149-7.898-3.945-2.33-8.394-4.531-13.347-6.602-3.628-1.497-6.881-2.949-9.761-4.359-2.879-1.41-5.327-2.848-7.342-4.316-2.016-1.467-3.571-3.021-4.665-4.661-1.094-1.64-1.641-3.495-1.641-5.567 0-1.899.489-3.61 1.468-5.135s2.362-2.834 4.147-3.927c1.785-1.094 3.973-1.942 6.565-2.547 2.591-.604 5.471-.906 8.638-.906 2.304 0 4.737.173 7.299.518 2.563.345 5.14.877 7.732 1.597a53.669 53.669 0 0 1 7.558 2.719 41.7 41.7 0 0 1 6.781 3.797v-25.807c-4.204-1.611-8.797-2.805-13.778-3.582-4.981-.777-10.697-1.165-17.147-1.165-6.565 0-12.784.705-18.658 2.115-5.874 1.409-11.043 3.61-15.506 6.602-4.463 2.993-7.99 6.805-10.582 11.437-2.591 4.632-3.887 10.17-3.887 16.615 0 8.228 2.375 15.248 7.127 21.06 4.751 5.811 11.963 10.731 21.638 14.759a291.458 291.458 0 0 1 10.625 4.575c3.283 1.496 6.119 3.049 8.509 4.66 2.39 1.611 4.276 3.366 5.658 5.265 1.382 1.899 2.073 4.057 2.073 6.474a9.901 9.901 0 0 1-1.296 4.963c-.863 1.524-2.174 2.848-3.93 3.97-1.756 1.122-3.945 1.999-6.565 2.632-2.62.633-5.687.95-9.2.95-5.989 0-11.92-1.05-17.794-3.151-5.875-2.1-11.317-5.25-16.327-9.451Zm-46.036-68.733H140V109H41v22.742h35.345V233h28.137V131.742Z" fill="#FFF"/>
                </svg>
              </div>

              {/* Supabase */}
              <div className="group relative" title="Supabase">
                <svg viewBox="0 0 109 113" className="w-5 h-5">
                  <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874l-43.151 54.347Z" fill="url(#supaGrad1)"/>
                  <path d="M63.708 110.284c-2.86 3.601-8.658 1.628-8.727-2.97l-1.007-67.251h45.22c8.19 0 12.758 9.46 7.665 15.874l-43.151 54.347Z" fillOpacity=".2" fill="url(#supaGrad2)"/>
                  <path d="M45.317 2.071c2.86-3.601 8.657-1.628 8.726 2.97l.442 67.251H9.83c-8.19 0-12.759-9.46-7.665-15.875L45.317 2.072Z" fill="#3ECF8E"/>
                  <defs><linearGradient id="supaGrad1" x1="53.974" x2="94.163" y1="54.974" y2="71.829"><stop stopColor="#249361"/><stop offset="1" stopColor="#3ECF8E"/></linearGradient><linearGradient id="supaGrad2" x1="36.156" x2="54.484" y1="30.578" y2="65.081"><stop/><stop offset="1" stopOpacity="0"/></linearGradient></defs>
                </svg>
              </div>

              {/* Tailwind */}
              <div className="group relative" title="Tailwind CSS">
                <svg viewBox="0 0 256 154" className="w-6 h-6">
                  <defs><linearGradient x1="-2.778%" y1="32%" x2="100%" y2="67.556%" id="tailGrad"><stop stopColor="#2298BD" offset="0%"/><stop stopColor="#0ED7B5" offset="100%"/></linearGradient></defs>
                  <path d="M128 0C93.867 0 72.533 17.067 64 51.2 76.8 34.133 91.733 27.733 108.8 32c9.737 2.434 16.697 9.499 24.401 17.318C145.751 62.057 160.275 76.8 192 76.8c34.133 0 55.467-17.067 64-51.2-12.8 17.067-27.733 23.467-44.8 19.2-9.737-2.434-16.697-9.499-24.401-17.318C174.249 14.743 159.725 0 128 0ZM64 76.8C29.867 76.8 8.533 93.867 0 128c12.8-17.067 27.733-23.467 44.8-19.2 9.737 2.434 16.697 9.499 24.401 17.318C81.751 138.857 96.275 153.6 128 153.6c34.133 0 55.467-17.067 64-51.2-12.8 17.067-27.733 23.467-44.8 19.2-9.737-2.434-16.697-9.499-24.401-17.318C110.249 91.543 95.725 76.8 64 76.8Z" fill="url(#tailGrad)"/></svg>
              </div>

              {/* Framer Motion */}
              <div className="group relative" title="Framer Motion">
                <svg viewBox="0 0 256 384" className="w-4 h-6">
                  <path d="M0 0h256v128H128L0 0z" fill="#59529D"/>
                  <path d="M0 128h128l128 128H128v128L0 256V128z" fill="#5271B4"/>
                  <path d="M128 128h128v128H128z" fill="#BB4592"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
