#!/usr/bin/env tsx
// NewsAPI collector execution script
// Run with: npx tsx scripts/collect-newsapi.ts [options]
// Options:
//   --country <code>       Country code (default: us)
//   --category <name>      Category name (default: technology)
//   --page-size <number>   Number of articles (default: 50)
//   --dry-run             Collect but don't store in database

import { NewsAPICollector } from '../src/lib/collectors/newsapi'
import { deduplicateAndStore } from '../src/lib/collectors/utils/deduplication'
import { logInfo, logError, logCollectionComplete } from '../src/lib/collectors/utils/logger'
import { validateCollectorEnvironment } from '../src/lib/collectors/utils/config'

interface CLIOptions {
  country: string
  category: string
  pageSize: number
  dryRun: boolean
}

/**
 * Parses command-line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2)
  const options: CLIOptions = {
    country: 'us',
    category: 'technology',
    pageSize: 50,
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--country':
        options.country = args[++i]
        if (!options.country || options.country.length !== 2) {
          throw new Error('--country must be a 2-letter country code (e.g., us, gb)')
        }
        break
      
      case '--category':
        options.category = args[++i]
        const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology']
        if (!validCategories.includes(options.category)) {
          throw new Error(`--category must be one of: ${validCategories.join(', ')}`)
        }
        break
      
      case '--page-size':
        options.pageSize = parseInt(args[++i], 10)
        if (isNaN(options.pageSize) || options.pageSize < 1 || options.pageSize > 100) {
          throw new Error('--page-size must be between 1 and 100')
        }
        break
      
      case '--dry-run':
        options.dryRun = true
        break
      
      case '--help':
      case '-h':
        console.log(`
NewsAPI Collector Script

Usage: npx tsx scripts/collect-newsapi.ts [options]

Options:
  --country <code>       Country code (default: us)
                        Valid: ae, ar, at, au, be, bg, br, ca, ch, cn, co, cu, cz, de, eg, fr, gb, gr, hk, hu, id, ie, il, in, it, jp, kr, lt, lv, ma, mx, my, ng, nl, no, nz, ph, pl, pt, ro, rs, ru, sa, se, sg, si, sk, th, tr, tw, ua, us, ve, za
  --category <name>      Category name (default: technology)
                        Valid: business, entertainment, general, health, science, sports, technology
  --page-size <number>   Number of articles (default: 50, max: 100)
  --dry-run             Collect but don't store in database
  --help, -h            Show this help message

Examples:
  npx tsx scripts/collect-newsapi.ts
  npx tsx scripts/collect-newsapi.ts --country gb --category business
  npx tsx scripts/collect-newsapi.ts --page-size 100
  npx tsx scripts/collect-newsapi.ts --dry-run
`)
        process.exit(0)
        break
      
      default:
        console.error(`Unknown option: ${arg}`)
        console.error('Use --help for usage information')
        process.exit(1)
    }
  }

  return options
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now()
  
  try {
    // Parse command-line arguments
    const options = parseArgs()
    
    logInfo('collect-newsapi', 'Starting NewsAPI collection', {
      country: options.country,
      category: options.category,
      pageSize: options.pageSize,
      dryRun: options.dryRun,
    })

    // Validate environment variables (skip if dry-run)
    if (!options.dryRun) {
      try {
        validateCollectorEnvironment(true) // NewsAPI requires NEWSAPI_KEY
        logInfo('collect-newsapi', 'Environment validation passed')
      } catch (error) {
        logError('collect-newsapi', 'Environment validation failed', {
          error: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    }

    // Create collector
    const collector = new NewsAPICollector({
      country: options.country,
      category: options.category,
      pageSize: options.pageSize,
    })

    // Collect items
    const items = await collector.collect()
    
    logInfo('collect-newsapi', `Collected ${items.length} items`)

    // Store items (unless dry-run)
    if (options.dryRun) {
      logInfo('collect-newsapi', 'Dry-run mode: skipping database storage')
      
      // Display sample items
      console.log('\nSample items:')
      items.slice(0, 3).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`)
        console.log(`   URL: ${item.url}`)
        console.log(`   Published: ${item.published_at}`)
        console.log(`   Author: ${item.author || 'N/A'}`)
        console.log(`   Excerpt: ${item.excerpt?.substring(0, 100) || 'N/A'}...`)
      })
    } else {
      const result = await deduplicateAndStore(items, 'newsapi')
      
      logInfo('collect-newsapi', 'Storage complete', {
        itemsStored: result.itemsStored,
        duplicatesSkipped: result.duplicatesSkipped,
        errors: result.errors.length,
      })

      if (result.errors.length > 0) {
        logError('collect-newsapi', 'Some items failed to store', {
          errors: result.errors,
        })
      }
    }

    const duration = Date.now() - startTime
    logCollectionComplete('newsapi', items.length, duration)
    
    console.log('\n✓ Collection completed successfully')
    process.exit(0)
  } catch (error) {
    const duration = Date.now() - startTime
    logError('collect-newsapi', 'Collection failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
    })
    
    console.error('\n✗ Collection failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run the script
main()
