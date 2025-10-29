// Deduplication engine for collector items
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ItemDTO, CollectionResult, CollectorSource } from '@/types/collector.types'
import type { ItemInsert } from '@/types/database.types'
import { logInfo, logDuplicateSkipped, logError } from './logger'

/**
 * Result of a deduplication and storage operation
 */
export interface DeduplicationResult {
  itemsStored: number
  duplicatesSkipped: number
  errors: string[]
}

/**
 * Checks if URLs already exist in the database
 * @param urls - Array of URLs to check
 * @returns Set of URLs that already exist
 */
export async function checkExistingUrls(urls: string[]): Promise<Set<string>> {
  if (urls.length === 0) {
    return new Set()
  }

  try {
    const supabase = createSupabaseServerClient()
    
    // Query in batches to avoid URL length limits
    const batchSize = 100
    const existingUrls = new Set<string>()

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('items')
        .select('url')
        .in('url', batch)

      if (error) {
        logError('deduplication', `Failed to check existing URLs: ${error.message}`)
        throw error
      }

      if (data) {
        data.forEach(item => existingUrls.add(item.url))
      }
    }

    return existingUrls
  } catch (error) {
    logError('deduplication', 'Error checking existing URLs', {
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

/**
 * Converts ItemDTO to database insert format
 */
function itemDTOToInsert(item: ItemDTO): ItemInsert {
  return {
    source: item.source,
    title: item.title,
    url: item.url,
    excerpt: item.excerpt || null,
    author: item.author || null,
    score: item.score || 0,
    comment_count: item.comment_count || 0,
    published_at: item.published_at,
  }
}

/**
 * Stores items in the database with deduplication
 * @param items - Array of ItemDTO objects to store
 * @param source - The collector source for logging
 * @returns Deduplication result with counts
 */
export async function deduplicateAndStore(
  items: ItemDTO[],
  source: CollectorSource
): Promise<DeduplicationResult> {
  const result: DeduplicationResult = {
    itemsStored: 0,
    duplicatesSkipped: 0,
    errors: [],
  }

  if (items.length === 0) {
    return result
  }

  try {
    // Check which URLs already exist
    const urls = items.map(item => item.url)
    const existingUrls = await checkExistingUrls(urls)

    // Filter out duplicates
    const newItems = items.filter(item => {
      if (existingUrls.has(item.url)) {
        logDuplicateSkipped(source, item.url)
        result.duplicatesSkipped++
        return false
      }
      return true
    })

    if (newItems.length === 0) {
      logInfo(source, 'No new items to store (all duplicates)')
      return result
    }

    // Insert new items
    const supabase = createSupabaseServerClient()
    const insertData = newItems.map(itemDTOToInsert)

    const { data, error } = await supabase
      .from('items')
      .insert(insertData)
      .select('id')

    if (error) {
      logError(source, `Failed to insert items: ${error.message}`)
      result.errors.push(error.message)
      throw error
    }

    result.itemsStored = data?.length || 0
    logInfo(source, `Stored ${result.itemsStored} new items`, {
      duplicatesSkipped: result.duplicatesSkipped,
    })

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logError(source, `Deduplication and storage failed: ${errorMessage}`)
    result.errors.push(errorMessage)
    return result
  }
}

/**
 * Stores items one by one with individual error handling
 * Use this when you want to continue processing even if some items fail
 * @param items - Array of ItemDTO objects to store
 * @param source - The collector source for logging
 * @returns Deduplication result with counts
 */
export async function deduplicateAndStoreIndividually(
  items: ItemDTO[],
  source: CollectorSource
): Promise<DeduplicationResult> {
  const result: DeduplicationResult = {
    itemsStored: 0,
    duplicatesSkipped: 0,
    errors: [],
  }

  if (items.length === 0) {
    return result
  }

  const supabase = createSupabaseServerClient()

  for (const item of items) {
    try {
      // Check if URL exists
      const { data: existing } = await supabase
        .from('items')
        .select('id')
        .eq('url', item.url)
        .single()

      if (existing) {
        logDuplicateSkipped(source, item.url)
        result.duplicatesSkipped++
        continue
      }

      // Insert the item
      const insertData = itemDTOToInsert(item)
      const { error } = await supabase
        .from('items')
        .insert(insertData)

      if (error) {
        // Check if it's a unique constraint violation (race condition)
        if (error.code === '23505') {
          logDuplicateSkipped(source, item.url)
          result.duplicatesSkipped++
        } else {
          logError(source, `Failed to insert item: ${error.message}`, { url: item.url })
          result.errors.push(`${item.url}: ${error.message}`)
        }
      } else {
        result.itemsStored++
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError(source, `Error processing item: ${errorMessage}`, { url: item.url })
      result.errors.push(`${item.url}: ${errorMessage}`)
    }
  }

  logInfo(source, `Stored ${result.itemsStored} new items`, {
    duplicatesSkipped: result.duplicatesSkipped,
    errors: result.errors.length,
  })

  return result
}

/**
 * Creates a collection result from deduplication result
 */
export function createCollectionResult(
  source: CollectorSource,
  itemsCollected: number,
  deduplicationResult: DeduplicationResult,
  duration: number
): CollectionResult {
  return {
    source,
    itemsCollected,
    itemsStored: deduplicationResult.itemsStored,
    duplicatesSkipped: deduplicationResult.duplicatesSkipped,
    errors: deduplicationResult.errors,
    duration,
    timestamp: new Date().toISOString(),
  }
}
