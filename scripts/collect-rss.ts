#!/usr/bin/env tsx
// RSS collector execution script
// Run with: npx tsx scripts/collect-rss.ts [options]
// Options:
//   --max-items <number>    Maximum items per feed (default: 20)
//   --max-age <number>      Maximum age in hours (default: 24)
//   --timeout <number>      Request timeout in ms (default: 15000)
//   --dry-run              Collect but don't store in database

// Load environment variables from .env file
import 'dotenv/config'

import { RSSCollector } from '../src/lib/collectors/rss'
import { deduplicateAndStore } from '../src/lib/collectors/utils/deduplication'
import { logInfo, logError, logCollectionComplete } from '../src/lib/collectors/utils/logger'
import { validateCollectorEnvironment } from '../src/lib/collectors/utils/config'

interface CLIOptions {
  maxItemsPerFeed: number
  maxAgeHours: number
  timeout: number
  dryRun: boolean
}

/**
 * Parses command-line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2)
  const options: CLIOptions = {
    maxItemsPerFeed: 20,
    maxAgeHours: 24,
    timeout: 15000,
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--max-items':
        options.maxItemsPerFeed = parseInt(args[++i], 10)
        if (isNaN(options.maxItemsPerFeed) || options.maxItemsPerFeed < 1) {
          throw new Error('--max-items must be a positive number')
        }
        break
      
      case '--max-age':
        options.maxAgeHours = parseInt(args[++i], 10)
        if (isNaN(options.maxAgeHours) || options.maxAgeHours < 1) {
          throw new Error('--max-age must be a positive number')
        }
        break
      
      case '--timeout':
        options.timeout = parseInt(args[++i], 10)
        if (isNaN(options.timeout) || options.timeout < 1000) {
          throw new Error('--timeout must be at least 1000ms')
        }
        break
      
      case '--dry-run':
        options.dryRun = true
        break
      
      case '--help':
      case '-h':
        console.log(`
RSS Collector Script

Usage: npx tsx scripts/collect-rss.ts [options]

Options:
  --max-items <number>    Maximum items per feed (default: 20)
  --max-age <number>      Maximum age in hours (default: 24)
  --timeout <number>      Request timeout in ms (default: 15000)
  --dry-run              Collect but don't store in database
  --help, -h             Show this help message

Examples:
  npx tsx scripts/collect-rss.ts
  npx tsx scripts/collect-rss.ts --max-items 30
  npx tsx scripts/collect-rss.ts --max-age 48 --timeout 20000
  npx tsx scripts/collect-rss.ts --dry-run
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
    
    logInfo('collect-rss', 'Starting RSS collection', {
      maxItemsPerFeed: options.maxItemsPerFeed,
      maxAgeHours: options.maxAgeHours,
      timeout: options.timeout,
      dryRun: options.dryRun,
    })

    // Validate environment variables (skip if dry-run)
    if (!options.dryRun) {
      try {
        validateCollectorEnvironment(false)
        logInfo('collect-rss', 'Environment validation passed')
      } catch (error) {
        logError('collect-rss', 'Environment validation failed', {
          error: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    }

    // Create collector (this will validate RSS config)
    let collector: RSSCollector
    try {
      collector = new RSSCollector({
        maxItemsPerFeed: options.maxItemsPerFeed,
        maxAgeHours: options.maxAgeHours,
        timeout: options.timeout,
      })
    } catch (error) {
      logError('collect-rss', 'Failed to initialize RSS collector', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }

    // Collect items
    const items = await collector.collect()
    
    logInfo('collect-rss', `Collected ${items.length} items`)

    // Store items (unless dry-run)
    if (options.dryRun) {
      logInfo('collect-rss', 'Dry-run mode: skipping database storage')
      
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
      const result = await deduplicateAndStore(items, 'rss')
      
      logInfo('collect-rss', 'Storage complete', {
        itemsStored: result.itemsStored,
        duplicatesSkipped: result.duplicatesSkipped,
        errors: result.errors.length,
      })

      if (result.errors.length > 0) {
        logError('collect-rss', 'Some items failed to store', {
          errors: result.errors,
        })
      }
    }

    const duration = Date.now() - startTime
    logCollectionComplete('rss', items.length, duration)
    
    console.log('\n✓ Collection completed successfully')
    process.exit(0)
  } catch (error) {
    const duration = Date.now() - startTime
    logError('collect-rss', 'Collection failed', {
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
