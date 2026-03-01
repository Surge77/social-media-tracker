import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createKeyManager } from '@/lib/ai/key-manager'
import { resilientAICall } from '@/lib/ai/resilient-call'
import { generateRecommendation } from '@/lib/ai/generators/recommendation'
import type { RecommendationResult } from '@/lib/ai/generators/recommendation'
import { checkRateLimit, rateLimitHeaders } from '@/lib/ai/rate-limiter'

export async function GET(req: NextRequest) {
  const goal = req.nextUrl.searchParams.get('goal') || 'learning'
  const focus = req.nextUrl.searchParams.get('focus') || 'frontend'
  const level = req.nextUrl.searchParams.get('level') || 'beginner'

  const supabase = createSupabaseAdminClient()

  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rlResult = await checkRateLimit('/api/ai/recommend', ip, supabase)
  if (!rlResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    )
  }

  // Cache check (optional, let's keep it simple for now or cache for 1 hour)
  const cacheKey = `recommend_${goal}_${focus}_${level}`
  const { data: cached } = await supabase
    .from('ai_insights')
    .select('insight_data, generated_at')
    .eq('comparison_key', cacheKey)
    .eq('insight_type', 'recommendation')
    .single()

  if (cached) {
    const ageHours = (Date.now() - new Date(cached.generated_at).getTime()) / 3_600_000
    if (ageHours < 24) {
      return NextResponse.json(
        { recommendation: cached.insight_data, cached: true },
        { headers: rateLimitHeaders(rlResult) }
      )
    }
  }

  try {
    const keyManager = createKeyManager()
    const recommendation = await resilientAICall<RecommendationResult>(
      'recommendation',
      (provider) => generateRecommendation(goal, focus, level, provider, supabase),
      keyManager
    )

    // Cache the recommendation
    await supabase.from('ai_insights').upsert(
      {
        comparison_key: cacheKey,
        insight_type: 'recommendation',
        insight_data: recommendation,
        model_used: 'mixed',
        prompt_version: 1,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'comparison_key,insight_type' }
    )

    return NextResponse.json(
      { recommendation, cached: false },
      { headers: rateLimitHeaders(rlResult) }
    )
  } catch (error) {
    console.error('[API Recommendation] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 503 }
    )
  }
}
