import React from 'react'
import Footer from '@/components/Footer'
import { DashboardHeader } from '@/components/DashboardHeader'
import { AskAIWidget } from '@/components/ask/AskAIWidget'
import { PageTransition } from '@/components/PageTransition'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader />

      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>

      <Footer />

      {/* Floating Ask AI widget — visible on all dashboard pages */}
      <AskAIWidget />
    </div>
  )
}
