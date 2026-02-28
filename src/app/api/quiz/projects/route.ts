/**
 * GET /api/quiz/projects?slug=react&goal=get-job&level=beginner
 *
 * Returns an AI-generated weekend project idea for the given technology.
 * Cache-first: checks ai_insights table (insight_type = 'project-idea').
 * Cache TTL: 30 days.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createKeyManager } from '@/lib/ai/key-manager'
import { resilientAICall } from '@/lib/ai/resilient-call'
import { generateProjectIdea, getFallbackProjectIdea } from '@/lib/ai/generators/project-ideas'
import type { ProjectIdea } from '@/lib/ai/generators/project-ideas'

const CACHE_DAYS = 30

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  const goal = searchParams.get('goal') ?? 'side-project'
  const level = searchParams.get('level') ?? 'intermediate'

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  // Find technology
  const { data: tech } = await supabase
    .from('technologies')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!tech) {
    return NextResponse.json({ error: 'Technology not found' }, { status: 404 })
  }

  // Build a stable cache key incorporating goal + level
  const insightMetadata = `${goal}:${level}`
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - CACHE_DAYS)

  // Check cache
  const { data: cached } = await supabase
    .from('ai_insights')
    .select('content, generated_at')
    .eq('technology_id', tech.id)
    .eq('insight_type', 'project-idea')
    .eq('model_used', insightMetadata)
    .gt('generated_at', cutoffDate.toISOString())
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  if (cached?.content) {
    try {
      const idea = JSON.parse(cached.content) as ProjectIdea
      return NextResponse.json({ idea, cached: true })
    } catch {
      // corrupt cache — fall through to generate
    }
  }

  // Generate with AI
  try {
    const keyManager = createKeyManager()

    const idea = await resilientAICall(
      'batch_insight',
      (provider) => generateProjectIdea(slug, tech.name, goal, level, provider),
      keyManager
    )

    // Cache result
    await supabase.from('ai_insights').upsert({
      technology_id: tech.id,
      insight_type: 'project-idea',
      model_used: insightMetadata,
      content: JSON.stringify(idea),
      generated_at: new Date().toISOString(),
    }, {
      onConflict: 'technology_id,insight_type,model_used',
    })

    return NextResponse.json({ idea, cached: false })
  } catch (err) {
    console.error('[quiz/projects] AI generation failed:', err)
    // Return fallback without caching
    const idea = getFallbackProjectIdea(slug, level)
    return NextResponse.json({ idea, cached: false, fallback: true })
  }
}
