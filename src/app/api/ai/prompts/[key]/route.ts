/**
 * GET /api/ai/prompts/[key] - Get active prompt content
 * PUT /api/ai/prompts/[key] - Update prompt (creates new version)
 * PATCH /api/ai/prompts/[key] - Activate specific version
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  getActivePrompt,
  updatePrompt,
  activateVersion
} from '@/lib/ai/prompt-manager'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await context.params
    const supabase = await createSupabaseServerClient()

    const content = await getActivePrompt(supabase, key)

    if (!content) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ promptKey: key, content })
  } catch (error) {
    console.error('[PromptsAPI] Error getting prompt:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await context.params
    const supabase = await createSupabaseServerClient()
    const body = await req.json()

    const { content } = body

    if (!content) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      )
    }

    const version = await updatePrompt(
      supabase,
      key,
      { content }
    )

    return NextResponse.json(version)
  } catch (error) {
    console.error('[PromptsAPI] Error updating prompt:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await context.params
    const supabase = await createSupabaseServerClient()
    const body = await req.json()

    const { version } = body

    if (typeof version !== 'number') {
      return NextResponse.json(
        { error: 'version number is required' },
        { status: 400 }
      )
    }

    await activateVersion(supabase, key, version)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PromptsAPI] Error activating version:', error)

    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
