import { SupabaseClient } from '@supabase/supabase-js'
import { Database, ContentSource, TrendingWindow, TrendType } from '@/types/database.types'
import { calculatePopularityScore } from './popularity-calculator'
import { applyTimeDecay } from './time-decay'

export interface TrendingDetectionOptions {
  window?: TrendingWindow
  limit?: number
  source?: ContentSource
  algorithmVersion?: string
  minConfidence?: number
}

export interface TrendingDetectionResult {
  itemId: number
  trendingScore: number
  velocity: number
  trendType: TrendType
  confidence: number
  explanation: string
}

const DEFAULT_ALGORITHM_VERSION = 'v1.0'

// Source weights for trending calculations
const SOURCE_WEIGHTS: Record<ContentSource, number> = {
  hackernews: 1.2, // HN items tend to be high quality
  rss: 1.0,        // Standard weight for RSS
  newsapi: 0.9     // NewsAPI might have more noise
}

// Time decay factors for different windows
const TIME_DECAY_FACTORS: Record<TrendingWindow, number> = {
  '15m': 0.95,  // Very recent, minimal decay
  '1h': 0.85,   // Recent, light decay
  '6h': 0.7,    // Moderate decay
  '24h': 0.5,   // Significant decay
  '7d': 0.3,    // Heavy decay for weekly trends
  '30d': 0.1    // Very heavy decay for monthly trends
}

export async function updateTrendingMetrics(
  supabase: SupabaseClient<Database>,
  options: TrendingDetectionOptions = {}
): Promise<number> {
  const {
    window = '1h',
    limit = 100,
    source,
    algorithmVersion = DEFAULT_ALGORITHM_VERSION,
    minConfidence = 0.3
  } = options

  try {
    // Get recent items for trending analysis
    const items = await getRecentItems(supabase, { window, limit, source })
    
    let updatedCount = 0
    
    // Process items in batches
    const batchSize = 20
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      for (const item of batch) {
        try {
          const trendingResult = await detectTrending(supabase, item, window, algorithmVersion)
          
          if (trendingResult.confidence >= minConfidence) {
            await saveTrendingMetric(supabase, trendingResult, window, algorithmVersion)
            updatedCount++
          }
        } catch (error) {
          console.error(`Failed to process trending for item ${item.id}:`, error)
        }
      }
    }

    return updatedCount
  } catch (error) {
    console.error('Trending metrics update failed:', error)
    throw error
  }
}

async function getRecentItems(
  supabase: SupabaseClient<Database>,
  options: { window: TrendingWindow; limit: number; source?: ContentSource }
): Promise<any[]> {
  const { window, limit, source } = options
  
  // Calculate time threshold based on window
  const now = new Date()
  const timeThreshold = new Date(now.getTime() - getWindowMilliseconds(window))
  
  let query = supabase
    .from('items')
    .select(`
      id,
      source,
      title,
      url,
      score,
      comment_count,
      published_at,
      created_at,
      updated_at,
      content_popularity (
        engagement_count,
        share_count,
        comment_count,
        view_count,
        popularity_score,
        trending_velocity
      )
    `)
    .gte('published_at', timeThreshold.toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (source) {
    query = query.eq('source', source)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch recent items: ${error.message}`)
  }

  return data || []
}

async function detectTrending(
  supabase: SupabaseClient<Database>,
  item: any,
  window: TrendingWindow,
  algorithmVersion: string
): Promise<TrendingDetectionResult> {
  // Calculate base popularity score
  const popularityScore = await calculatePopularityScore(
    item.score || 0,
    item.comment_count || 0,
    item.content_popularity?.[0]?.engagement_count || 0,
    item.content_popularity?.[0]?.share_count || 0,
    item.content_popularity?.[0]?.view_count || 0,
    item.source
  )

  // Apply time decay
  const publishedAt = new Date(item.published_at)
  const decayedScore = applyTimeDecay(popularityScore, publishedAt, window)

  // Calculate velocity (rate of change)
  const velocity = await calculateVelocity(supabase, item.id, window)

  // Apply source weight
  const sourceWeight = SOURCE_WEIGHTS[item.source as ContentSource] || 1.0
  const weightedScore = decayedScore * sourceWeight

  // Calculate final trending score
  const trendingScore = weightedScore + (velocity * 0.3) // 30% weight to velocity

  // Determine trend type and confidence
  const { trendType, confidence } = determineTrendType(trendingScore, velocity, popularityScore)

  // Generate explanation
  const explanation = generateTrendingExplanation(
    item,
    trendingScore,
    velocity,
    trendType,
    sourceWeight,
    decayedScore
  )

  return {
    itemId: item.id,
    trendingScore,
    velocity,
    trendType,
    confidence,
    explanation
  }
}

async function calculateVelocity(
  supabase: SupabaseClient<Database>,
  itemId: number,
  window: TrendingWindow
): Promise<number> {
  // Get previous trending metrics for this item
  const { data: previousMetrics } = await supabase
    .from('trending_metrics')
    .select('trending_score, created_at')
    .eq('item_id', itemId)
    .eq('window', window)
    .order('created_at', { ascending: false })
    .limit(2)

  if (!previousMetrics || previousMetrics.length < 2) {
    return 0 // No previous data to calculate velocity
  }

  const [current, previous] = previousMetrics
  const timeDiff = new Date(current.created_at).getTime() - new Date(previous.created_at).getTime()
  const scoreDiff = current.trending_score - previous.trending_score

  // Calculate velocity as score change per hour
  const hoursElapsed = timeDiff / (1000 * 60 * 60)
  return hoursElapsed > 0 ? scoreDiff / hoursElapsed : 0
}

function determineTrendType(
  trendingScore: number,
  velocity: number,
  popularityScore: number
): { trendType: TrendType; confidence: number } {
  let trendType: TrendType
  let confidence: number

  if (velocity > 10 && trendingScore > 50) {
    trendType = 'viral'
    confidence = Math.min(0.95, (velocity + trendingScore) / 100)
  } else if (velocity > 5) {
    trendType = 'rising'
    confidence = Math.min(0.85, velocity / 20)
  } else if (trendingScore > 30 && velocity > -2) {
    trendType = 'hot'
    confidence = Math.min(0.8, trendingScore / 50)
  } else if (trendingScore > 15 && velocity > -5) {
    trendType = 'sustained'
    confidence = Math.min(0.7, trendingScore / 30)
  } else {
    trendType = 'sustained'
    confidence = 0.2
  }

  return { trendType, confidence }
}

function generateTrendingExplanation(
  item: any,
  trendingScore: number,
  velocity: number,
  trendType: TrendType,
  sourceWeight: number,
  decayedScore: number
): string {
  const parts = []

  // Base explanation
  parts.push(`This ${item.source} item has a trending score of ${trendingScore.toFixed(1)}`)

  // Velocity explanation
  if (velocity > 5) {
    parts.push(`with high velocity (${velocity.toFixed(1)}/hour), indicating rapid growth`)
  } else if (velocity > 0) {
    parts.push(`with positive velocity (${velocity.toFixed(1)}/hour), showing steady growth`)
  } else if (velocity < -2) {
    parts.push(`with negative velocity (${velocity.toFixed(1)}/hour), indicating decline`)
  }

  // Source weight explanation
  if (sourceWeight > 1) {
    parts.push(`boosted by ${item.source} quality factor`)
  } else if (sourceWeight < 1) {
    parts.push(`adjusted for ${item.source} noise factor`)
  }

  // Trend type explanation
  switch (trendType) {
    case 'viral':
      parts.push('classified as viral due to exceptional growth')
      break
    case 'rising':
      parts.push('classified as rising due to strong upward momentum')
      break
    case 'hot':
      parts.push('classified as hot due to high engagement')
      break
    case 'sustained':
      parts.push('classified as sustained due to consistent performance')
      break
  }

  return parts.join(', ') + '.'
}

async function saveTrendingMetric(
  supabase: SupabaseClient<Database>,
  result: TrendingDetectionResult,
  window: TrendingWindow,
  algorithmVersion: string
): Promise<void> {
  const { error } = await supabase
    .from('trending_metrics')
    .upsert({
      item_id: result.itemId,
      window,
      trending_score: result.trendingScore,
      velocity: result.velocity,
      trend_type: result.trendType,
      confidence_score: result.confidence,
      algorithm_version: algorithmVersion,
      decay_factor: TIME_DECAY_FACTORS[window],
      source_weight: SOURCE_WEIGHTS[await getItemSource(supabase, result.itemId)] || 1.0,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'item_id,window,algorithm_version'
    })

  if (error) {
    throw new Error(`Failed to save trending metric: ${error.message}`)
  }
}

async function getItemSource(supabase: SupabaseClient<Database>, itemId: number): Promise<ContentSource> {
  const { data, error } = await supabase
    .from('items')
    .select('source')
    .eq('id', itemId)
    .single()

  if (error || !data) {
    return 'rss' // Default fallback
  }

  return data.source as ContentSource
}

function getWindowMilliseconds(window: TrendingWindow): number {
  switch (window) {
    case '15m': return 15 * 60 * 1000
    case '1h': return 60 * 60 * 1000
    case '6h': return 6 * 60 * 60 * 1000
    case '24h': return 24 * 60 * 60 * 1000
    case '7d': return 7 * 24 * 60 * 60 * 1000
    case '30d': return 30 * 24 * 60 * 60 * 1000
    default: return 60 * 60 * 1000
  }
}