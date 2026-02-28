/**
 * Web3/blockchain job market data.
 * Sources:
 *   - Web3.career RSS (no key)
 *   - CryptoJobsList RSS (no key)
 *   - Existing Adzuna integration (filter by blockchain keywords)
 */

import Parser from 'rss-parser'

const parser = new Parser()

const BLOCKCHAIN_JOB_FEEDS = [
  { name: 'Web3.career',    url: 'https://web3.career/remote-jobs.rss' },
  { name: 'CryptoJobsList', url: 'https://cryptojobslist.com/rss.xml' },
]

const SC_KEYWORDS = [
  'solidity', 'vyper', 'smart contract', 'foundry', 'hardhat',
  'anchor', 'move', 'cairo', 'ink!', 'defi', 'web3', 'blockchain',
  'ethereum', 'solana', 'polkadot', 'evm', 'rust solana',
]

export interface BlockchainJobPosting {
  title: string
  company: string | null
  url: string
  techKeywords: string[]
  postedAt: string
  isRemote: boolean
}

export async function fetchBlockchainJobs(): Promise<BlockchainJobPosting[]> {
  const results: BlockchainJobPosting[] = []

  await Promise.allSettled(
    BLOCKCHAIN_JOB_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url)
        for (const item of parsed.items.slice(0, 30)) {
          const text = `${item.title ?? ''} ${item.contentSnippet ?? ''}`.toLowerCase()
          const matchedKeywords = SC_KEYWORDS.filter((kw) => text.includes(kw))
          if (matchedKeywords.length === 0) continue

          results.push({
            title: item.title ?? 'Untitled',
            company: item.creator ?? null,
            url: item.link ?? '',
            techKeywords: matchedKeywords,
            postedAt: item.pubDate ?? new Date().toISOString(),
            isRemote: text.includes('remote'),
          })
        }
      } catch {
        // Feed failed — skip silently
      }
    })
  )

  return results
}

/**
 * Count job postings per tech slug from the combined RSS feeds.
 * Returns: Map<slug, count>
 */
export async function fetchBlockchainJobCounts(): Promise<Map<string, number>> {
  const jobs = await fetchBlockchainJobs()
  const counts = new Map<string, number>()

  const SLUG_KEYWORD_MAP: Record<string, string[]> = {
    'solidity':         ['solidity', 'smart contract', 'evm'],
    'foundry':          ['foundry'],
    'hardhat':          ['hardhat'],
    'anchor-framework': ['anchor', 'solana'],
    'move-lang':        ['move', 'aptos', 'sui'],
    'cairo-lang':       ['cairo', 'starknet'],
    'uniswap':          ['uniswap', 'defi'],
    'aave':             ['aave', 'defi'],
    'chainlink':        ['chainlink', 'oracle'],
    'wagmi':            ['wagmi', 'web3', 'ethereum frontend'],
  }

  for (const [slug, keywords] of Object.entries(SLUG_KEYWORD_MAP)) {
    const count = jobs.filter((j) =>
      j.techKeywords.some((kw) => keywords.some((k) => kw.includes(k)))
    ).length
    counts.set(slug, count)
  }

  return counts
}
