import { getCachedTechnologiesResponse } from '@/lib/server/technology-data'

/**
 * GET /api/technologies
 *
 * Returns all active technologies with their latest scores, 30-day sparklines,
 * rank changes (vs 7 days ago), and honest AI summaries.
 */
export async function GET() {
  try {
    const response = await getCachedTechnologiesResponse()
    return Response.json(
      response,
      { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMsg }, { status: 500 })
  }
}
