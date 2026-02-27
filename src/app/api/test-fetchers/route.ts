import { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchGitHubData } from '@/lib/api/github'
import { fetchHackerNewsData } from '@/lib/api/hackernews'
import { fetchStackOverflowData } from '@/lib/api/stackoverflow'
import { fetchPackageDownloads } from '@/lib/api/packages'
import { fetchDevToData } from '@/lib/api/devto'
import { fetchRedditData } from '@/lib/api/reddit'
import { fetchRSSData } from '@/lib/api/rss'
import { fetchJobsData } from '@/lib/api/jobs'
import type { Technology } from '@/types'

/**
 * Test API route for Day 3 & Day 4 fetchers
 *
 * Usage:
 * - GET /api/test-fetchers?source=github&limit=3&insert=false
 * - GET /api/test-fetchers?source=packages&limit=5&insert=true
 * - GET /api/test-fetchers?source=devto&limit=3
 *
 * Query params:
 * - source: 'github' | 'hackernews' | 'stackoverflow' | 'packages' | 'devto' | 'reddit' | 'rss' (required)
 * - limit: number of technologies to test (default: 5)
 * - insert: 'true' to insert into database, 'false' to just return data (default: false)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const source = searchParams.get('source')
  const limit = parseInt(searchParams.get('limit') || '5', 10)
  const shouldInsert = searchParams.get('insert') === 'true'

  const validSources = ['github', 'hackernews', 'stackoverflow', 'packages', 'devto', 'reddit', 'rss', 'jobs']
  if (!source || !validSources.includes(source)) {
    return Response.json(
      { error: `Invalid or missing source parameter. Must be one of: ${validSources.join(', ')}` },
      { status: 400 }
    )
  }

  try {
    const supabase = createSupabaseAdminClient()

    // Fetch a small sample of active technologies
    const { data: technologies, error: fetchError } = await supabase
      .from('technologies')
      .select('*')
      .eq('is_active', true)
      .limit(limit)

    if (fetchError) {
      return Response.json({ error: fetchError.message }, { status: 500 })
    }

    if (!technologies || technologies.length === 0) {
      return Response.json({ error: 'No technologies found' }, { status: 404 })
    }

    // Run the appropriate fetcher
    let result
    const startTime = Date.now()

    switch (source) {
      case 'github':
        result = await fetchGitHubData(technologies as Technology[])
        break
      case 'hackernews':
        result = await fetchHackerNewsData(technologies as Technology[])
        break
      case 'stackoverflow':
        result = await fetchStackOverflowData(technologies as Technology[])
        break
      case 'packages':
        result = await fetchPackageDownloads(technologies as Technology[])
        break
      case 'devto':
        result = await fetchDevToData(technologies as Technology[])
        break
      case 'reddit':
        result = await fetchRedditData(technologies as Technology[])
        break
      case 'rss':
        result = await fetchRSSData(technologies as Technology[])
        break
      case 'jobs':
        result = await fetchJobsData(technologies as Technology[])
        break
      default:
        return Response.json({ error: 'Invalid source' }, { status: 400 })
    }

    const duration = Date.now() - startTime

    // Optionally upsert into database (handles duplicates)
    let insertedCount = 0
    if (shouldInsert && result.dataPoints.length > 0) {
      const { error: insertError } = await supabase
        .from('data_points')
        .upsert(result.dataPoints, { onConflict: 'technology_id,source,metric,measured_at' })

      if (insertError) {
        return Response.json(
          {
            error: `Failed to upsert data: ${insertError.message}`,
            fetchResult: result,
            duration,
          },
          { status: 500 }
        )
      }

      insertedCount = result.dataPoints.length
    }

    return Response.json({
      success: true,
      source: result.source,
      technologiesTested: technologies.length,
      dataPointsGenerated: result.dataPoints.length,
      dataPointsInserted: insertedCount,
      errors: result.errors,
      duration: `${duration}ms`,
      sampleDataPoints: result.dataPoints.slice(0, 10), // Show first 10 for inspection
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMsg }, { status: 500 })
  }
}
