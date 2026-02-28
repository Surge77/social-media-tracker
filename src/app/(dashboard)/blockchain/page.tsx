import type { Metadata } from 'next'
import { BlockchainPageClient } from './BlockchainPageClient'

export const metadata: Metadata = {
  title: 'Blockchain Developer Intelligence | DevTrends',
  description:
    'Chain TVL rankings, smart contract language trends, and Web3 job market data for developers.',
}

export default function BlockchainPage() {
  return <BlockchainPageClient />
}
