/**
 * POST /api/ai/ask
 *
 * Streaming chat endpoint for "Ask DevTrends"
 * Uses Server-Sent Events (SSE) for real-time streaming
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ConversationManager } from '@/lib/ai/conversation-manager'
import { sanitizeUserInput, buildSafeUserPrompt } from '@/lib/ai/safety'
import { resilientAICall } from '@/lib/ai/resilient-call'
import { createKeyManager } from '@/lib/ai/key-manager'
import { logTelemetry } from '@/lib/ai/telemetry'
import { z, ZodError } from 'zod'

const RequestSchema = z.object({
  question: z.string().min(1).max(1000),
  sessionId: z.string().uuid()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, sessionId } = RequestSchema.parse(body)

    // 1. Sanitize input
    const sanitized = sanitizeUserInput(question)
    if (sanitized.flagged) {
      return NextResponse.json(
        { error: 'Your message was flagged. Please rephrase and try again.' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    const conversationManager = new ConversationManager()
    const keyManager = createKeyManager()

    // 2. Get or create conversation
    const conversation = await conversationManager.getOrCreateConversation(
      sessionId,
      supabase
    )

    // 3. Extract mentioned technologies and fetch their latest data
    const mentionedTechs = conversationManager.extractTechnologies(sanitized.sanitized)
    let techContext = ''

    if (mentionedTechs.length > 0) {
      const { data: techs } = await supabase
        .from('technologies')
        .select(`
          name,
          slug,
          category,
          daily_scores!inner (
            composite_score,
            github_score,
            community_score,
            jobs_score,
            momentum,
            score_date
          )
        `)
        .in('slug', mentionedTechs)
        .order('daily_scores(score_date)', { ascending: false })
        .limit(5)

      if (techs && techs.length > 0) {
        techContext = '\n\nCurrent technology data:\n'
        for (const tech of techs) {
          const scores = Array.isArray(tech.daily_scores) ? tech.daily_scores[0] : tech.daily_scores
          if (scores) {
            techContext += `- ${tech.name}: Score ${scores.composite_score}/100, `
            techContext += `Momentum ${scores.momentum > 0 ? '+' : ''}${scores.momentum}, `
            techContext += `Jobs ${scores.jobs_score}/100\n`
          }
        }
      }
    }

    // 4. Build context prompt
    const contextPrompt = conversationManager.buildContextPrompt(
      conversation,
      sanitized.sanitized
    )

    const systemPrompt = `You are DevTrends AI, an expert technology career advisor.

You help developers make informed decisions about:
- Which technologies to learn
- Career trajectory and market trends
- Technology comparisons and tradeoffs
- Job market insights

Guidelines:
- Be concise and practical
- Use data when available (scores, momentum, job market stats)
- Acknowledge uncertainty when data is limited
- Consider both current state and future trends
- Focus on career impact, not just technical merits

${techContext}

Answer the user's question based on the conversation context and available data.`

    const safePrompt = buildSafeUserPrompt(contextPrompt, systemPrompt)
    const startTime = Date.now()

    // 5. Create a TransformStream for SSE
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()

    // 6. Start AI generation in background
    let fullResponse = ''

    ;(async () => {
      try {
        // For streaming, we need to use a provider that supports it
        // For MVP, we'll use Groq (supports streaming) or Cerebras
        const response = await resilientAICall(
          'chat',
          async (provider) => {
            return await provider.generateText(safePrompt, {
              maxTokens: 500,
              temperature: 0.7,
              systemPrompt
            })
          },
          keyManager
        )

        // Simulate streaming by chunking the response
        // In a real implementation, we'd use the provider's streaming API
        const words = response.split(' ')
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + (i < words.length - 1 ? ' ' : '')
          fullResponse += chunk

          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`)
          )

          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 30))
        }

        // Send done signal
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
        )

        // 7. Save messages to conversation
        await conversationManager.addMessage(
          sessionId,
          {
            role: 'user',
            content: sanitized.sanitized,
            timestamp: new Date().toISOString()
          },
          supabase
        )

        await conversationManager.addMessage(
          sessionId,
          {
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString()
          },
          supabase
        )

        // Log telemetry
        logTelemetry(
          {
            event: 'generation',
            provider: 'mixed',
            model: 'mixed',
            use_case: 'chat',
            latency_ms: Date.now() - startTime,
            token_input: null,
            token_output: null,
            quality_score: null,
            error: null,
            metadata: { session_id: sessionId }
          },
          supabase
        )
      } catch (error) {
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`
          )
        )

        logTelemetry(
          {
            event: 'error',
            provider: 'unknown',
            model: 'unknown',
            use_case: 'chat',
            latency_ms: Date.now() - startTime,
            token_input: null,
            token_output: null,
            quality_score: null,
            error: (error as Error).message,
            metadata: { session_id: sessionId }
          },
          supabase
        )
      } finally {
        await writer.close()
      }
    })()

    // 8. Return SSE response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: (error as any).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
