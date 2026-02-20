import { NextRequest } from 'next/server'
import { fetchTrendingRepos, fetchHNBuzz, annotateBuzz } from '@/lib/api/github-trending'

export async function GET(request: NextRequest) {
  try {
    const lang = request.nextUrl.searchParams.get('lang') ?? 'all'
    const period = (request.nextUrl.searchParams.get('period') ?? '7d') as '24h' | '7d' | '30d'

    const [repos, buzz] = await Promise.all([
      fetchTrendingRepos(lang, period),
      fetchHNBuzz(),
    ])

    const annotated = annotateBuzz(repos, buzz)

    // HN-buzzing repos float to the top, sorted by points
    const sorted = [
      ...annotated.filter((r) => r.hn_points).sort((a, b) => (b.hn_points ?? 0) - (a.hn_points ?? 0)),
      ...annotated.filter((r) => !r.hn_points),
    ]

    return Response.json({ repos: sorted, buzz }, {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
