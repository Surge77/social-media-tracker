import { getCachedTechnologyStatsResponse } from '@/lib/server/technology-data'

export async function GET() {
  try {
    const response = await getCachedTechnologyStatsResponse()
    return Response.json(
      response,
      {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}
