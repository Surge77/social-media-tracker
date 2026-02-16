'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Terminal, Activity, TrendingUp, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'TRENDS', href: '/technologies', icon: TrendingUp },
  { label: 'JOBS', href: '/jobs', icon: Activity },
  { label: 'ROADMAP', href: '/roadmap', icon: Terminal },
]

export function TerminalHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={prefersReducedMotion ? {} : { y: -100 }}
        animate={prefersReducedMotion ? {} : { y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-terminal-surface/80 backdrop-blur-xl border-b border-terminal-border shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-terminal-cyan/20 blur-xl group-hover:bg-terminal-cyan/30 transition-all" />
                <Terminal className="w-6 h-6 text-terminal-cyan relative" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-bold text-terminal-text text-lg leading-none">
                  DevTrends
                </span>
                <span className="font-mono text-[10px] text-terminal-text-muted uppercase tracking-wider leading-none">
                  v2.0.1
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative px-4 py-2 font-mono text-sm text-terminal-text-dim hover:text-terminal-cyan transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <link.icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{link.label}</span>
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-terminal-cyan group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              {/* Connection status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-terminal-surface border border-terminal-border rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-green" />
                </span>
                <span className="text-xs font-mono text-terminal-text-dim">LIVE</span>
              </div>

              {/* Login button */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                className="hidden sm:block px-4 py-2 bg-terminal-cyan/10 border border-terminal-cyan text-terminal-cyan font-mono text-sm rounded-lg hover:bg-terminal-cyan hover:text-terminal-bg transition-all"
              >
                {'> LOGIN'}
              </motion.button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-terminal-text hover:text-terminal-cyan transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          className="fixed top-16 left-0 right-0 z-40 bg-terminal-surface/95 backdrop-blur-xl border-b border-terminal-border md:hidden"
        >
          <nav className="max-w-7xl mx-auto px-4 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-terminal-text-dim hover:text-terminal-cyan hover:bg-terminal-bg rounded-lg transition-all font-mono"
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}

            <div className="pt-4 border-t border-terminal-border">
              <button className="w-full px-4 py-3 bg-terminal-cyan/10 border border-terminal-cyan text-terminal-cyan font-mono rounded-lg hover:bg-terminal-cyan hover:text-terminal-bg transition-all">
                {'> LOGIN'}
              </button>
            </div>
          </nav>
        </motion.div>
      )}
    </>
  )
}
