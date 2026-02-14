/**
 * GET /api/ai/prompts - List all prompt keys or get all versions of a specific prompt
 * POST /api/ai/prompts - Create new prompt version
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  getAllPromptKeys,
  getPromptVersions,
  createPromptVersion,
  initializeDefaultPrompts
} from '@/lib/ai/prompt-manager'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const searchParams = req.nextUrl.searchParams
    const promptKey = searchParams.get('key')
    const initialize = searchParams.get('initialize')

    // Initialize defaults if requested
    if (initialize === 'true') {
      await initializeDefaultPrompts(supabase)
      return NextResponse.json({ message: 'Default prompts initialized' })
    }

    // If key provided, get all versions
    if (promptKey) {
      const versions = await getPromptVersions(supabase, promptKey)
      return NextResponse.json({ promptKey, versions })
    }

    // Otherwise, get all keys
    const keys = await getAllPromptKeys(supabase)
    return NextResponse.json({ keys })
  } catch (error) {
    console.error('[PromptsAPI] Error:', error)

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

    const { promptType, content } = body

    if (!promptType || !content) {
      return NextResponse.json(
        { error: 'promptType and content are required' },
        { status: 400 }
      )
    }

    const version = await createPromptVersion(supabase, {
      promptType,
      content
    })

    return NextResponse.json(version)
  } catch (error) {
    console.error('[PromptsAPI] Error creating prompt:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
