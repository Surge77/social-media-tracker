#!/usr/bin/env tsx
// Configuration validation script
// Validates all configuration files and environment variables
// Run with: npx tsx scripts/validate-config.ts

import { validateAllConfiguration, printValidationResults } from '../src/lib/collectors/utils/config'

interface ValidationOptions {
  checkNewsAPI: boolean
  checkRSS: boolean
  verbose: boolean
}

/**
 * Parses command-line arguments
 */
function parseArgs(): ValidationOptions {
  const args = process.argv.slice(2)
  const options: ValidationOptions = {
    checkNewsAPI: false,
    checkRSS: false,
    verbose: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--newsapi':
        options.checkNewsAPI = true
        break
      
      case '--rss':
        options.checkRSS = true
        break
      
      case '--all':
        options.checkNewsAPI = true
        options.checkRSS = true
        break
      
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      
      case '--help':
      case '-h':
        console.log(`
Configuration Validation Script

Validates configuration files and environment variables for the unified data fetch system.

Usage: npx tsx scripts/validate-config.ts [options]

Options:
  --newsapi          Validate NewsAPI configuration (requires NEWSAPI_KEY)
  --rss              Validate RSS sources configuration
  --all              Validate all configurations (newsapi + rss)
  --verbose, -v      Show detailed validation information
  --help, -h         Show this help message

Examples:
  npx tsx scripts/validate-config.ts
  npx tsx scripts/validate-config.ts --all
  npx tsx scripts/validate-config.ts --newsapi --rss
  npx tsx scripts/validate-config.ts --verbose

Exit Codes:
  0 - All validations passed
  1 - Validation failed (errors found)
  2 - Validation passed with warnings
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
 * Prints detailed configuration information
 */
function printDetailedInfo(options: ValidationOptions): void {
  console.log('Configuration Validation Details')
  console.log('='.repeat(60))
  console.log()
  
  console.log('Environment Variables:')
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set'}`)
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Not set'}`)
  
  if (options.checkNewsAPI) {
    const newsApiKey = process.env.NEWSAPI_KEY || process.env.NEWS_API_KEY
    console.log(`  NEWSAPI_KEY: ${newsApiKey ? '✓ Set' : '✗ Not set'}`)
  }
  
  console.log()
  console.log('Configuration Files:')
  console.log(`  config/collector.config.json: Checking...`)
  
  if (options.checkRSS) {
    console.log(`  config/rss_sources.json: Checking...`)
  }
  
  console.log()
  console.log('='.repeat(60))
  console.log()
}

/**
 * Main validation function
 */
async function main() {
  try {
    const options = parseArgs()
    
    console.log('\n🔍 Validating Configuration...\n')
    
    if (options.verbose) {
      printDetailedInfo(options)
    }

    // Run validation
    const result = validateAllConfiguration({
      checkCollectorConfig: true,
      checkRSSConfig: options.checkRSS,
      checkNewsAPI: options.checkNewsAPI,
    })

    // Print results
    printValidationResults(result)

    // Determine exit code
    if (!result.valid) {
      console.error('❌ Configuration validation failed. Please fix the errors above.\n')
      process.exit(1)
    } else if (result.warnings.length > 0) {
      console.log('⚠️  Configuration validation passed with warnings.\n')
      process.exit(2)
    } else {
      console.log('✅ All configuration checks passed successfully!\n')
      process.exit(0)
    }
  } catch (error) {
    console.error('\n❌ Validation script failed:\n')
    console.error(error instanceof Error ? error.message : String(error))
    console.error()
    process.exit(1)
  }
}

// Run the script
main()
