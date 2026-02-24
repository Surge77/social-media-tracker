import React from 'react'
import Footer from '@/components/Footer'
import { DashboardHeader } from '@/components/DashboardHeader'
import { AskAIWidget } from '@/components/ask/AskAIWidget'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      {/* Main Content */}
      <main>{children}</main>

      <Footer />

      {/* Floating Ask AI widget — visible on all dashboard pages */}
      <AskAIWidget />
    </div>
  )
}
