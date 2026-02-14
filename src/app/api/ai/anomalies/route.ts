/**
 * GET /api/ai/anomalies
 *
 * Returns recent unresolved anomalies across all technologies
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const searchParams = req.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)

  // Fetch unresolved anomalies with technology details
  const { data, error } = await supabase
    .from('anomaly_events')
    .select(`
      id,
      detected_at,
      anomaly_type,
      severity,
      metric,
      deviation_sigma,
      ai_explanation,
      technology:technologies (
        slug,
        name
      )
    `)
    .eq('resolved', false)
    .order('severity', { ascending: false })
    .order('detected_at', { ascending: false })
    .limit(limit)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch anomalies' },
      { status: 500 }
    )
  }

  // Transform the response
  const anomalies = (data ?? []).map(anomaly => ({
    id: anomaly.id,
    technology: Array.isArray(anomaly.technology)
      ? anomaly.technology[0]
      : anomaly.technology,
    detectedAt: anomaly.detected_at,
    anomalyType: anomaly.anomaly_type,
    severity: anomaly.severity,
    metric: anomaly.metric,
    deviationSigma: anomaly.deviation_sigma,
    aiExplanation: anomaly.ai_explanation
  }))

  return NextResponse.json({ anomalies })
}
