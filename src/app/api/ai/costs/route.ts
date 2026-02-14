/**
 * GET /api/ai/costs - Get cost summary and budget status
 * PUT /api/ai/costs - Update budget configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { calculateCostSummary, updateBudgets } from '@/lib/ai/cost-tracker'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const searchParams = req.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30', 10)

    const summary = await calculateCostSummary(supabase, days)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('[CostTracking] Error:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await req.json()

    const { dailyBudget, monthlyBudget } = body

    if (typeof dailyBudget !== 'number' || typeof monthlyBudget !== 'number') {
      return NextResponse.json(
        { error: 'Invalid budget values' },
        { status: 400 }
      )
    }

    if (dailyBudget < 0 || monthlyBudget < 0) {
      return NextResponse.json(
        { error: 'Budget values must be positive' },
        { status: 400 }
      )
    }

    await updateBudgets(supabase, dailyBudget, monthlyBudget)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CostTracking] Error updating budgets:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
