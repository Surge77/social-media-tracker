import { Metadata } from 'next'
import { MonitoringClient } from '@/components/monitoring/MonitoringClient'

export const metadata: Metadata = {
  title: 'AI Monitoring | DevTrends',
  description: 'Real-time AI system health monitoring and performance metrics'
}

export default function MonitoringPage() {
  return <MonitoringClient />
}
