import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { collectFromHackerNews } from '@/lib/collectors/hackernews'
import { collectFromRSS } from '@/lib/collectors/rss'
import { collectFromNewsAPI } from '@/lib/collectors/newsapi'
import { updateTrendingMetrics } from '@/lib/trending/trend-detector'
import { rateLimit } from '@/lib/utils/rate-limit'

export interface CollectionRequest {
  source?: 'hackernews' | 'rss' | 'newsapi' | 'all'
  limit?: number
  since?: string
  forceUpdate?: boolean
}

export interface CollectionResponse {
  success: boolean
  processed: number
  errors: string[]
  lastUpdated: string
  sources: {
    hackernews?: { processed: number; errors: string[] }
    rss?: { processed: number; errors: string[] }
    newsapi?: { processed: number; errors: string[] }
  }
  trending: {
    updated: number
    errors: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResult = await rateLimit(request, {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      keyGenerator: (req) => req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous'
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      )
    }

    const body: CollectionRequest = await request.json()
    const { source = 'all', limit = 50, since, forceUpdate = false } = body

    const supabase = createSupabaseServerClient()
    const response: CollectionResponse = {
      success: true,
      processed: 0,
      errors: [],
      lastUpdated: new Date().toISOString(),
      sources: {},
      trending: { updated: 0, errors: [] }
    }

    // Collect from specified sources
    if (source === 'all' || source === 'hackernews') {
      try {
        const hnResult = await collectFromHackerNews(supabase, { limit, since, forceUpdate })
        response.sources.hackernews = hnResult
        response.processed += hnResult.processed
        response.errors.push(...hnResult.errors)
      } catch (error) {
        const errorMsg = `Hacker News collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        response.errors.push(errorMsg)
        response.sources.hackernews = { processed: 0, errors: [errorMsg] }
      }
    }

    if (source === 'all' || source === 'rss') {
      try {
        const rssResult = await collectFromRSS(supabase, { limit, since, forceUpdate })
        response.sources.rss = rssResult
        response.processed += rssResult.processed
        response.errors.push(...rssResult.errors)
      } catch (error) {
        const errorMsg = `RSS collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        response.errors.push(errorMsg)
        response.sources.rss = { processed: 0, errors: [errorMsg] }
      }
    }

    if (source === 'all' || source === 'newsapi') {
      try {
        const newsApiResult = await collectFromNewsAPI(supabase, { limit, since, forceUpdate })
        response.sources.newsapi = newsApiResult
        response.processed += newsApiResult.processed
        response.errors.push(...newsApiResult.errors)
      } catch (error) {
        const errorMsg = `NewsAPI collection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        response.errors.push(errorMsg)
        response.sources.newsapi = { processed: 0, errors: [errorMsg] }
      }
    }

    // Update trending metrics after collection
    try {
      const trendingResult = await updateTrendingMetrics(supabase, {
        window: '1h',
        limit: 100,
        source: source === 'all' ? undefined : source
      })
      response.trending.updated = trendingResult
    } catch (error) {
      const errorMsg = `Trending update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      response.trending.errors.push(errorMsg)
      response.errors.push(errorMsg)
    }

    // Determine overall success
    response.success = response.errors.length === 0 || response.processed > 0

    const statusCode = response.success ? 200 : 207 // 207 for partial success
    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    console.error('Collection API error:', error)
    return NextResponse.json(
      {
        success: false,
        processed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        lastUpdated: new Date().toISOString(),
        sources: {},
        trending: { updated: 0, errors: [] }
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') as CollectionRequest['source'] || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const since = searchParams.get('since') || undefined
    const forceUpdate = searchParams.get('forceUpdate') === 'true'

    // Convert GET to POST logic
    return POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ source, limit, since, forceUpdate }),
      headers: { 'Content-Type': 'application/json' }
    }))
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    )
  }
}