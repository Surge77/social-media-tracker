import type { Metadata } from 'next'
import { withCanonicalMetadata } from '@/lib/seo'
import { BlockchainPageClient } from './BlockchainPageClient'

export const metadata: Metadata = withCanonicalMetadata('/blockchain', {
  title: 'Blockchain Developer Intelligence',
  description:
    'Chain TVL rankings, smart contract language trends, and Web3 job market data for developers.',
})

export default function BlockchainPage() {
  return <BlockchainPageClient />
}
