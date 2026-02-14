/**
 * GET /api/ai/experiments/[testKey] - Get test details
 * PATCH /api/ai/experiments/[testKey] - Cancel test or apply winner
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { activateVersion } from '@/lib/ai/prompt-manager'
import type { ABTest } from '@/lib/ai/ab-testing'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ testKey: string }> }
) {
  try {
    const { testKey } = await context.params
    const supabase = await createSupabaseServerClient()

    const { data } = await supabase
      .from('system_config')
      .select('config_value')
      .eq('config_key', testKey)
      .single()

    if (!data) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data.config_value)
  } catch (error) {
    console.error('[ExperimentsAPI] Error:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ testKey: string }> }
) {
  try {
    const { testKey } = await context.params
    const supabase = await createSupabaseServerClient()
    const body = await req.json()

    const { action } = body

    const { data } = await supabase
      .from('system_config')
      .select('config_value')
      .eq('config_key', testKey)
      .single()

    if (!data) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    const test = data.config_value as ABTest

    if (action === 'cancel') {
      test.status = 'cancelled'
      test.completedAt = new Date().toISOString()

      await supabase
        .from('system_config')
        .update({ config_value: test })
        .eq('config_key', testKey)

      return NextResponse.json({ success: true, test })
    }

    if (action === 'apply_winner') {
      if (!test.winner) {
        return NextResponse.json(
          { error: 'No winner determined yet' },
          { status: 400 }
        )
      }

      // Activate the winning version
      const winningVersion =
        test.winner === 'A' ? test.variantA.version : test.variantB.version

      await activateVersion(supabase, test.promptKey, winningVersion)

      // Mark test as completed
      test.status = 'completed'
      test.completedAt = new Date().toISOString()

      await supabase
        .from('system_config')
        .update({ config_value: test })
        .eq('config_key', testKey)

      return NextResponse.json({
        success: true,
        appliedVersion: winningVersion,
        test
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "cancel" or "apply_winner"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[ExperimentsAPI] Error:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
