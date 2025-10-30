#!/usr/bin/env tsx
// Hacker News collector execution script
// Run with: npx tsx scripts/collect-hn.ts [options]
// Options:
//   --max-stories <number>  Maximum number of stories to collect (default: 30)
//   --concurrent <number>   Number of concurrent requests (default: 5)
//   --dry-run              Collect but don't store in database

// Load environment variables from .env file
import 'dotenv/config'

import { HackerNewsCollector } from '../src/lib/collectors/hackernews'
import { deduplicateAndStore } from '../src/lib/collectors/utils/deduplication'
import { logInfo, logError, logCollectionComplete } from '../src/lib/collectors/utils/logger'
import { validateCollectorEnvironment } from '../src/lib/collectors/utils/config'

interface CLIOptions {
  maxStories: number
  concurrentRequests: number
  dryRun: boolean
}

/**
 * Parses command-line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2)
  const options: CLIOptions = {
    maxStories: 30,
    concurrentRequests: 5,
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--max-stories':
        options.maxStories = parseInt(args[++i], 10)
        if (isNaN(options.maxStories) || options.maxStories < 1) {
          throw new Error('--max-stories must be a positive number')
        }
        break
      
      case '--concurrent':
        options.concurrentRequests = parseInt(args[++i], 10)
        if (isNaN(options.concurrentRequests) || options.concurrentRequests < 1) {
          throw new Error('--concurrent must be a positive number')
        }
        break
      
      case '--dry-run':
        options.dryRun = true
        break
      
      case '--help':
      case '-h':
        console.log(`
Hacker News Collector Script

Usage: npx tsx scripts/collect-hn.ts [options]

Options:
  --max-stories <number>   Maximum number of stories to collect (default: 30)
  --concurrent <number>    Number of concurrent requests (default: 5)
  --dry-run               Collect but don't store in database
  --help, -h              Show this help message

Examples:
  npx tsx scripts/collect-hn.ts
  npx tsx scripts/collect-hn.ts --max-stories 50
  npx tsx scripts/collect-hn.ts --max-stories 20 --concurrent 10
  npx tsx scripts/collect-hn.ts --dry-run
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
    
    logInfo('collect-hn', 'Starting Hacker News collection', {
      maxStories: options.maxStories,
      concurrentRequests: options.concurrentRequests,
      dryRun: options.dryRun,
    })

    // Validate environment variables (skip if dry-run)
    if (!options.dryRun) {
      try {
        validateCollectorEnvironment(false)
        logInfo('collect-hn', 'Environment validation passed')
      } catch (error) {
        logError('collect-hn', 'Environment validation failed', {
          error: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    }

    // Create collector
    const collector = new HackerNewsCollector({
      maxStories: options.maxStories,
      concurrentRequests: options.concurrentRequests,
    })

    // Collect items
    const items = await collector.collect()
    
    logInfo('collect-hn', `Collected ${items.length} items`)

    // Store items (unless dry-run)
    if (options.dryRun) {
      logInfo('collect-hn', 'Dry-run mode: skipping database storage')
      
      // Display sample items
      console.log('\nSample items:')
      items.slice(0, 3).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`)
        console.log(`   URL: ${item.url}`)
        console.log(`   Author: ${item.author || 'N/A'}`)
        console.log(`   Score: ${item.score || 0}`)
        console.log(`   Comments: ${item.comment_count || 0}`)
      })
    } else {
      const result = await deduplicateAndStore(items, 'hn')
      
      logInfo('collect-hn', 'Storage complete', {
        itemsStored: result.itemsStored,
        duplicatesSkipped: result.duplicatesSkipped,
        errors: result.errors.length,
      })

      if (result.errors.length > 0) {
        logError('collect-hn', 'Some items failed to store', {
          errors: result.errors,
        })
      }
    }

    const duration = Date.now() - startTime
    logCollectionComplete('hn', items.length, duration)
    
    console.log('\n✓ Collection completed successfully')
    process.exit(0)
  } catch (error) {
    const duration = Date.now() - startTime
    logError('collect-hn', 'Collection failed', {
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
