/**
 * POST /api/ai/digest/generate
 *
 * Cron-triggered endpoint to generate weekly digest
 * Runs every Monday at 3am UTC
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createKeyManager } from '@/lib/ai/key-manager'
import { generateWeeklyDigest } from '@/lib/ai/generators/weekly-digest'
import { resilientAICall } from '@/lib/ai/resilient-call'

export async function POST(req: NextRequest) {
  // Verify cron secret (optional for local dev)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const keyManager = createKeyManager()

  // Check for force parameter
  const searchParams = req.nextUrl.searchParams
  const force = searchParams.get('force') === 'true'

  try {
    // Get the most recent score date to determine digest period
    const { data: latestScoreData } = await supabase
      .from('daily_scores')
      .select('score_date')
      .order('score_date', { ascending: false })
      .limit(1)
      .single()

    if (!latestScoreData) {
      return NextResponse.json(
        { error: 'No score data available' },
        { status: 400 }
      )
    }

    const latestDate = new Date(latestScoreData.score_date)
    const weekStart = latestDate.toISOString().split('T')[0]

    console.log('[DigestGeneration] Latest score date:', weekStart)

    // Check if digest already exists for this date (unless force=true)
    if (!force) {
      const { data: existing } = await supabase
        .from('weekly_digests')
        .select('id')
        .eq('week_start', weekStart)
        .single()

      if (existing) {
        return NextResponse.json({
          message: 'Digest already exists for this period',
          weekStart
        })
      }
    } else {
      // Delete existing digest if force regenerating
      await supabase
        .from('weekly_digests')
        .delete()
        .eq('week_start', weekStart)
    }

    // Fetch all technologies with their most recent scores
    const { data: technologies, error: techError } = await supabase
      .from('technologies')
      .select(`
        id,
        slug,
        name,
        category,
        first_appeared,
        daily_scores!inner (
          composite_score,
          momentum,
          jobs_score,
          score_date
        )
      `)
      .eq('is_active', true)
      .eq('daily_scores.score_date', weekStart)

    console.log('[DigestGeneration] Technologies query result:', {
      count: technologies?.length || 0,
      error: techError
    })

    if (!technologies || technologies.length === 0) {
      return NextResponse.json(
        { error: 'No technology data available', debug: { weekStart, techError } },
        { status: 400 }
      )
    }

    // Transform data for digest generation
    const techData = technologies
      .map(t => {
        const scores = Array.isArray(t.daily_scores) ? t.daily_scores[0] : t.daily_scores
        return {
          id: t.id,
          slug: t.slug,
          name: t.name,
          category: t.category,
          first_appeared: t.first_appeared,
          composite_score: Number(scores.composite_score),
          momentum: Number(scores.momentum),
          jobs_score: Number(scores.jobs_score)
        }
      })
      .sort((a, b) => b.composite_score - a.composite_score) // Sort by score descending

    // Generate digest
    const digest = await resilientAICall(
      'digest',
      (provider) => generateWeeklyDigest(latestDate, techData, provider, supabase),
      keyManager
    )

    // Store in database
    const { error: insertError } = await supabase
      .from('weekly_digests')
      .insert({
        week_start: weekStart,
        digest_data: digest,
        model_used: 'mixed',
        generated_at: new Date().toISOString()
      })

    if (insertError) {
      throw new Error(`Failed to insert digest: ${insertError.message}`)
    }

    return NextResponse.json({
      message: 'Weekly digest generated successfully',
      weekStart,
      sectionCount: digest.sections.length
    })
  } catch (error) {
    console.error('[DigestGeneration] Error:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
