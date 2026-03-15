import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createKeyManager } from '@/lib/ai/key-manager'
import { resilientAICall } from '@/lib/ai/resilient-call'
import { checkRateLimit, rateLimitHeaders } from '@/lib/ai/rate-limiter'
import { fallbackJobsSummary, generateJobsSummary } from '@/lib/ai/generators/jobs-summary'
import { getJobsOverview } from '@/lib/jobs/intelligence'

export async function GET(req: NextRequest) {
  const supabase = createSupabaseAdminClient()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rlResult = await checkRateLimit('/api/ai/jobs-summary', ip, supabase)
  if (!rlResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    )
  }

  try {
    const overview = await getJobsOverview(supabase)
    const cacheKey = 'jobs_summary_overview'
    const { data: cached } = await supabase
      .from('ai_insights')
      .select('insight_data, generated_at')
      .eq('comparison_key', cacheKey)
      .eq('insight_type', 'jobs_summary')
      .single()

    if (cached) {
      const ageHours = (Date.now() - new Date(cached.generated_at).getTime()) / 3_600_000
      if (ageHours < 12) {
        return NextResponse.json(
          { summary: cached.insight_data, cached: true },
          { headers: rateLimitHeaders(rlResult) }
        )
      }
    }

    const keyManager = createKeyManager()
    const summary = await resilientAICall(
      'summary',
      (provider) => generateJobsSummary(overview, provider),
      keyManager
    ).catch(() => fallbackJobsSummary(overview))

    await supabase.from('ai_insights').upsert(
      {
        comparison_key: cacheKey,
        insight_type: 'jobs_summary',
        insight_data: summary,
        model_used: 'mixed',
        prompt_version: 1,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'comparison_key,insight_type' }
    )

    return NextResponse.json(
      { summary, cached: false },
      { headers: rateLimitHeaders(rlResult) }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
