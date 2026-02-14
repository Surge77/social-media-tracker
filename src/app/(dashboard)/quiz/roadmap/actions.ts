'use server'

// src/app/(dashboard)/quiz/roadmap/actions.ts
// Server actions for roadmap generation

import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import type { TechnologyWithScore } from '@/types'

/**
 * Fetch all technologies with scores from Supabase
 */
export async function fetchTechnologiesWithScores(): Promise<TechnologyWithScore[]> {
  try {
    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('technologies_with_scores')
      .select('*')
      .order('composite_score', { ascending: false })

    if (error) {
      console.error('[Roadmap] Error fetching technologies:', error)
      return []
    }

    return (data as TechnologyWithScore[]) ?? []
  } catch (error) {
    console.error('[Roadmap] Error in fetchTechnologiesWithScores:', error)
    return []
  }
}
