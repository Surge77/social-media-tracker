/**
 * GET /api/ai/feedback/analyze
 *
 * Analyze feedback patterns and quality metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { analyzeFeedback } from '@/lib/ai/feedback-analyzer'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Get optional days parameter
    const searchParams = req.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30', 10)

    // Analyze feedback
    const analysis = await analyzeFeedback(supabase, days)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('[FeedbackAnalysis] Error:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
