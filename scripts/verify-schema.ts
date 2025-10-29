#!/usr/bin/env tsx
/**
 * Verification script for unified data fetch schema and types
 * This script validates that all types, schemas, and configurations are properly set up
 */

import { ItemDTOSchema, RSSConfigSchema, CollectorConfigSchema } from '../src/types/collector.types'
import { loadCollectorConfig, loadRSSConfig } from '../src/lib/collectors/utils/config'
import { validateItemDTO } from '../src/lib/collectors/utils/validation'

console.log('🔍 Verifying Unified Data Fetch Schema Setup...\n')

// Test 1: Validate ItemDTO Schema
console.log('✓ Test 1: ItemDTO Schema Validation')
try {
  const validItem = {
    source: 'hn',
    title: 'Test Article',
    url: 'https://example.com/article',
    published_at: new Date().toISOString(),
    author: 'Test Author',
    excerpt: 'This is a test excerpt',
    score: 100,
    comment_count: 50,
  }
  
  const validated = validateItemDTO(validItem)
  console.log('  ✓ Valid ItemDTO passes validation')
  console.log(`  ✓ Validated item: ${validated.title}`)
} catch (error) {
  console.error('  ✗ ItemDTO validation failed:', error)
  process.exit(1)
}

// Test 2: Validate invalid ItemDTO is rejected
console.log('\n✓ Test 2: Invalid ItemDTO Rejection')
try {
  const invalidItem = {
    source: 'invalid',
    title: '',
    url: 'not-a-url',
  }
  
  validateItemDTO(invalidItem)
  console.error('  ✗ Invalid ItemDTO should have been rejected')
  process.exit(1)
} catch (error) {
  console.log('  ✓ Invalid ItemDTO correctly rejected')
}

// Test 3: Load and validate collector configuration
console.log('\n✓ Test 3: Collector Configuration')
try {
  const config = loadCollectorConfig()
  console.log('  ✓ Collector config loaded successfully')
  console.log(`  ✓ HN max stories: ${config.hn.maxStories}`)
  console.log(`  ✓ RSS timeout: ${config.rss.timeout}ms`)
  console.log(`  ✓ NewsAPI page size: ${config.newsapi.pageSize}`)
} catch (error) {
  console.error('  ✗ Collector config validation failed:', error)
  process.exit(1)
}

// Test 4: Load and validate RSS configuration
console.log('\n✓ Test 4: RSS Configuration')
try {
  const rssConfig = loadRSSConfig()
  console.log('  ✓ RSS config loaded successfully')
  console.log(`  ✓ Number of RSS sources: ${rssConfig.sources.length}`)
  console.log(`  ✓ Max items per feed: ${rssConfig.maxItemsPerFeed}`)
  console.log(`  ✓ Max age hours: ${rssConfig.maxAgeHours}`)
  
  // List sources
  rssConfig.sources.forEach((source, index) => {
    console.log(`  ✓ Source ${index + 1}: ${source.name} (${source.url})`)
  })
} catch (error) {
  console.error('  ✗ RSS config validation failed:', error)
  process.exit(1)
}

// Test 5: Validate all source types
console.log('\n✓ Test 5: Source Type Validation')
const sources = ['hn', 'rss', 'newsapi'] as const
sources.forEach(source => {
  try {
    const item = {
      source,
      title: `Test ${source} item`,
      url: `https://example.com/${source}`,
      published_at: new Date().toISOString(),
    }
    validateItemDTO(item)
    console.log(`  ✓ Source type '${source}' is valid`)
  } catch (error) {
    console.error(`  ✗ Source type '${source}' validation failed:`, error)
    process.exit(1)
  }
})

console.log('\n✅ All schema verification tests passed!')
console.log('\n📋 Summary:')
console.log('  • ItemDTO schema is properly defined and validated')
console.log('  • Collector configuration is valid')
console.log('  • RSS configuration is valid')
console.log('  • All source types (hn, rss, newsapi) are supported')
console.log('\n🎉 Schema setup is complete and ready for collector implementation!')
