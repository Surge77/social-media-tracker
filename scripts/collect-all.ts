#!/usr/bin/env tsx
// Unified collection orchestrator
// Runs all collectors in sequence with configuration and error handling
// Run with: npx tsx scripts/collect-all.ts [options]

import { HackerNewsCollector } from '../src/lib/collectors/hackernews'
import { RSSCollector } from '../src/lib/collectors/rss'
import { NewsAPICollector } from '../src/lib/collectors/newsapi'
import { deduplicateAndStore } from '../src/lib/collectors/utils/deduplication'
import { logInfo, logError, logWarn } from '../src/lib/collectors/utils/logger'
import { validateCollectorEnvironment, loadCollectorConfig } from '../src/lib/collectors/utils/config'
import type { CollectorSource, CollectionResult } from '../src/types/collector.types'

interface CLIOptions {
  collectors: CollectorSource[]
  dryRun: boolean
  continueOnError: boolean
  useConfig: boolean
}

interface CollectorExecutionResult {
  source: CollectorSource
  success: boolean
  itemsCollected: number
  itemsStored: number
  duplicatesSkipped: number
  errors: string[]
  duration: number
}

/**
 * Parses command-line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2)
  const options: CLIOptions = {
    collectors: ['hn', 'rss', 'newsapi'],
    dryRun: false,
    continueOnError: true,
    useConfig: true,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--collectors':
        const collectorsArg = args[++i]
        options.collectors = collectorsArg.split(',').map(c => c.trim()) as CollectorSource[]
        
        // Validate collector names
        const validCollectors: CollectorSource[] = ['hn', 'rss', 'newsapi']
        const invalidCollectors = options.collectors.filter(c => !validCollectors.includes(c))
        if (invalidCollectors.length > 0) {
          throw new Error(`Invalid collectors: ${invalidCollectors.join(', ')}. Valid: ${validCollectors.join(', ')}`)
        }
        break
      
      case '--dry-run':
        options.dryRun = true
        break
      
      case '--stop-on-error':
        options.continueOnError = false
        break
      
      case '--no-config':
        options.useConfig = false
        break
      
      case '--help':
      case '-h':
        console.log(`
Unified Collection Orchestrator

Runs multiple collectors in sequence with configuration and error handling.

Usage: npx tsx scripts/collect-all.ts [options]

Options:
  --collectors <list>    Comma-separated list of collectors to run (default: hn,rss,newsapi)
                        Valid: hn, rss, newsapi
  --dry-run             Collect but don't store in database
  --stop-on-error       Stop execution if any collector fails (default: continue)
  --no-config           Don't use collector.config.json (use defaults)
  --help, -h            Show this help message

Examples:
  npx tsx scripts/collect-all.ts
  npx tsx scripts/collect-all.ts --collectors hn,rss
  npx tsx scripts/collect-all.ts --dry-run
  npx tsx scripts/collect-all.ts --stop-on-error
  npx tsx scripts/collect-all.ts --no-config
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
 * Executes Hacker News collector
 */
async function executeHNCollector(
  config: any,
  dryRun: boolean
): Promise<CollectorExecutionResult> {
  const startTime = Date.now()
  const source: CollectorSource = 'hn'
  
  try {
    logInfo('orchestrator', 'Starting Hacker News collector')
    
    const collector = new HackerNewsCollector({
      maxStories: config?.hn?.maxStories || 30,
      concurrentRequests: config?.hn?.concurrentRequests || 5,
    })

    const items = await collector.collect()
    
    if (dryRun) {
      logInfo('orchestrator', `HN: Collected ${items.length} items (dry-run, not stored)`)
      return {
        source,
        success: true,
        itemsCollected: items.length,
        itemsStored: 0,
        duplicatesSkipped: 0,
        errors: [],
        duration: Date.now() - startTime,
      }
    }

    const result = await deduplicateAndStore(items, source)
    
    return {
      source,
      success: true,
      itemsCollected: items.length,
      itemsStored: result.itemsStored,
      duplicatesSkipped: result.duplicatesSkipped,
      errors: result.errors,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    logError('orchestrator', 'Hacker News collector failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    
    return {
      source,
      success: false,
      itemsCollected: 0,
      itemsStored: 0,
      duplicatesSkipped: 0,
      errors: [error instanceof Error ? error.message : String(error)],
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Executes RSS collector
 */
async function executeRSSCollector(
  config: any,
  dryRun: boolean
): Promise<CollectorExecutionResult> {
  const startTime = Date.now()
  const source: CollectorSource = 'rss'
  
  try {
    logInfo('orchestrator', 'Starting RSS collector')
    
    const collector = new RSSCollector({
      timeout: config?.rss?.timeout || 15000,
      maxItemsPerFeed: config?.rss?.maxItemsPerFeed || 20,
      maxAgeHours: config?.rss?.maxAgeHours || 24,
    })

    const items = await collector.collect()
    
    if (dryRun) {
      logInfo('orchestrator', `RSS: Collected ${items.length} items (dry-run, not stored)`)
      return {
        source,
        success: true,
        itemsCollected: items.length,
        itemsStored: 0,
        duplicatesSkipped: 0,
        errors: [],
        duration: Date.now() - startTime,
      }
    }

    const result = await deduplicateAndStore(items, source)
    
    return {
      source,
      success: true,
      itemsCollected: items.length,
      itemsStored: result.itemsStored,
      duplicatesSkipped: result.duplicatesSkipped,
      errors: result.errors,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    logError('orchestrator', 'RSS collector failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    
    return {
      source,
      success: false,
      itemsCollected: 0,
      itemsStored: 0,
      duplicatesSkipped: 0,
      errors: [error instanceof Error ? error.message : String(error)],
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Executes NewsAPI collector
 */
async function executeNewsAPICollector(
  config: any,
  dryRun: boolean
): Promise<CollectorExecutionResult> {
  const startTime = Date.now()
  const source: CollectorSource = 'newsapi'
  
  try {
    logInfo('orchestrator', 'Starting NewsAPI collector')
    
    const collector = new NewsAPICollector({
      country: config?.newsapi?.country || 'us',
      category: config?.newsapi?.category || 'technology',
      pageSize: config?.newsapi?.pageSize || 50,
    })

    const items = await collector.collect()
    
    if (dryRun) {
      logInfo('orchestrator', `NewsAPI: Collected ${items.length} items (dry-run, not stored)`)
      return {
        source,
        success: true,
        itemsCollected: items.length,
        itemsStored: 0,
        duplicatesSkipped: 0,
        errors: [],
        duration: Date.now() - startTime,
      }
    }

    const result = await deduplicateAndStore(items, source)
    
    return {
      source,
      success: true,
      itemsCollected: items.length,
      itemsStored: result.itemsStored,
      duplicatesSkipped: result.duplicatesSkipped,
      errors: result.errors,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    logError('orchestrator', 'NewsAPI collector failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    
    return {
      source,
      success: false,
      itemsCollected: 0,
      itemsStored: 0,
      duplicatesSkipped: 0,
      errors: [error instanceof Error ? error.message : String(error)],
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Prints summary of collection results
 */
function printSummary(results: CollectorExecutionResult[], totalDuration: number) {
  console.log('\n' + '='.repeat(60))
  console.log('COLLECTION SUMMARY')
  console.log('='.repeat(60))
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(`\nTotal collectors run: ${results.length}`)
  console.log(`Successful: ${successful}`)
  console.log(`Failed: ${failed}`)
  console.log(`Total duration: ${(totalDuration / 1000).toFixed(2)}s`)
  
  console.log('\nDetailed Results:')
  console.log('-'.repeat(60))
  
  results.forEach(result => {
    const status = result.success ? '✓' : '✗'
    const durationSec = (result.duration / 1000).toFixed(2)
    
    console.log(`\n${status} ${result.source.toUpperCase()}`)
    console.log(`  Duration: ${durationSec}s`)
    console.log(`  Items collected: ${result.itemsCollected}`)
    console.log(`  Items stored: ${result.itemsStored}`)
    console.log(`  Duplicates skipped: ${result.duplicatesSkipped}`)
    
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.length}`)
      result.errors.slice(0, 3).forEach(err => {
        console.log(`    - ${err}`)
      })
      if (result.errors.length > 3) {
        console.log(`    ... and ${result.errors.length - 3} more`)
      }
    }
  })
  
  console.log('\n' + '='.repeat(60))
  
  // Calculate totals
  const totalCollected = results.reduce((sum, r) => sum + r.itemsCollected, 0)
  const totalStored = results.reduce((sum, r) => sum + r.itemsStored, 0)
  const totalDuplicates = results.reduce((sum, r) => sum + r.duplicatesSkipped, 0)
  
  console.log('\nTotals:')
  console.log(`  Items collected: ${totalCollected}`)
  console.log(`  Items stored: ${totalStored}`)
  console.log(`  Duplicates skipped: ${totalDuplicates}`)
  console.log('='.repeat(60) + '\n')
}

/**
 * Main execution function
 */
async function main() {
  const overallStartTime = Date.now()
  
  try {
    // Parse command-line arguments
    const options = parseArgs()
    
    logInfo('orchestrator', 'Starting unified collection', {
      collectors: options.collectors,
      dryRun: options.dryRun,
      continueOnError: options.continueOnError,
      useConfig: options.useConfig,
    })

    // Validate environment variables (skip if dry-run)
    if (!options.dryRun) {
      try {
        // Check which collectors need which env vars
        const needsNewsAPI = options.collectors.includes('newsapi')
        validateCollectorEnvironment(needsNewsAPI)
        logInfo('orchestrator', 'Environment validation passed')
      } catch (error) {
        logError('orchestrator', 'Environment validation failed', {
          error: error instanceof Error ? error.message : String(error),
        })
        throw error
      }
    }

    // Load configuration if requested
    let config: any = null
    if (options.useConfig) {
      try {
        config = loadCollectorConfig()
        logInfo('orchestrator', 'Loaded collector configuration', {
          hn: config.hn,
          rss: config.rss,
          newsapi: config.newsapi,
        })
      } catch (error) {
        logWarn('orchestrator', 'Failed to load configuration, using defaults', {
          error: error instanceof Error ? error.message : String(error),
        })
        // Continue with defaults
      }
    }

    // Execute collectors in sequence
    const results: CollectorExecutionResult[] = []
    
    for (const collectorName of options.collectors) {
      let result: CollectorExecutionResult
      
      switch (collectorName) {
        case 'hn':
          result = await executeHNCollector(config, options.dryRun)
          break
        
        case 'rss':
          result = await executeRSSCollector(config, options.dryRun)
          break
        
        case 'newsapi':
          result = await executeNewsAPICollector(config, options.dryRun)
          break
        
        default:
          logError('orchestrator', `Unknown collector: ${collectorName}`)
          continue
      }
      
      results.push(result)
      
      // Stop on error if requested
      if (!result.success && !options.continueOnError) {
        logError('orchestrator', `Stopping execution due to ${collectorName} failure`)
        break
      }
    }

    const totalDuration = Date.now() - overallStartTime
    
    // Print summary
    printSummary(results, totalDuration)
    
    // Determine exit code
    const hasFailures = results.some(r => !r.success)
    if (hasFailures) {
      logWarn('orchestrator', 'Collection completed with failures')
      process.exit(1)
    } else {
      logInfo('orchestrator', 'Collection completed successfully')
      process.exit(0)
    }
  } catch (error) {
    const totalDuration = Date.now() - overallStartTime
    logError('orchestrator', 'Collection orchestration failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: totalDuration,
    })
    
    console.error('\n✗ Collection orchestration failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run the script
main()
