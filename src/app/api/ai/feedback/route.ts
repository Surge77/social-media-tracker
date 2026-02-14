/**
 * POST /api/ai/feedback
 *
 * Submit feedback on an AI-generated insight.
 * Body: { insightId: string, helpful: boolean, reason?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { logTelemetry } from '@/lib/ai/telemetry'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body?.insightId || typeof body.helpful !== 'boolean') {
    return NextResponse.json(
      { error: 'Missing insightId or helpful field' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseAdminClient()

  const { error } = await supabase.from('insight_feedback').insert({
    insight_id: body.insightId,
    user_id: null, // anonymous for MVP
    helpful: body.helpful,
    reason: body.reason ?? null,
  })

  if (error) {
    console.error('[Feedback] Insert failed:', error)
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    )
  }

  logTelemetry(
    {
      event: 'feedback_received',
      provider: 'none',
      model: 'none',
      use_case: 'feedback',
      latency_ms: null,
      token_input: null,
      token_output: null,
      quality_score: null,
      error: null,
      metadata: {
        insightId: body.insightId,
        helpful: body.helpful,
        reason: body.reason,
      },
    },
    supabase
  )

  return NextResponse.json({ success: true })
}
