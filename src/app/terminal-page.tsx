'use client'

import React from 'react'
import { TerminalHeader } from '@/components/TerminalHeader'
import { TerminalHero } from '@/components/TerminalHero'
import { ProcessList } from '@/components/ProcessList'
import { DataStream } from '@/components/DataStream'
import Footer from '@/components/Footer'

export default function TerminalLandingPage() {
  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      <TerminalHeader />
      <main>
        <TerminalHero />
        <ProcessList />
        <DataStream />
      </main>
      <Footer />
    </div>
  )
}
