/**
 * GET /api/ai/experiments - List all A/B tests
 * POST /api/ai/experiments - Create new A/B test
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createABTest } from '@/lib/ai/ab-testing'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Get all A/B tests from system_config
    const { data } = await supabase
      .from('system_config')
      .select('config_value')
      .like('config_key', 'ab_test_%')

    const tests = data?.map(d => d.config_value) || []

    return NextResponse.json({ tests })
  } catch (error) {
    console.error('[ExperimentsAPI] Error:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await req.json()

    const { promptKey, versionA, versionB, targetSampleSize } = body

    if (!promptKey || typeof versionA !== 'number' || typeof versionB !== 'number') {
      return NextResponse.json(
        { error: 'promptKey, versionA, and versionB are required' },
        { status: 400 }
      )
    }

    if (versionA === versionB) {
      return NextResponse.json(
        { error: 'versionA and versionB must be different' },
        { status: 400 }
      )
    }

    const test = await createABTest(
      supabase,
      promptKey,
      versionA,
      versionB,
      targetSampleSize
    )

    return NextResponse.json(test)
  } catch (error) {
    console.error('[ExperimentsAPI] Error creating test:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
