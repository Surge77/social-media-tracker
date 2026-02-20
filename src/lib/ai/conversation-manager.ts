/**
 * Conversation Manager
 *
 * Manages conversation context for "Ask DevTrends" chat.
 * Keeps last N messages in context, summarizes older messages to fit token budget.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Conversation {
  sessionId: string
  messages: ChatMessage[]
  technologiesDiscussed: string[]
}

export class ConversationManager {
  constructor(private maxMessages: number = 10) {}

  /**
   * Get or create a conversation for a session.
   * Uses maybeSingle() so missing rows return null rather than throwing.
   * Uses upsert to prevent race condition on concurrent first-requests.
   */
  async getOrCreateConversation(
    sessionId: string,
    supabase: SupabaseClient
  ): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[ConversationManager] Failed to fetch conversation:', error.message)
    }

    if (data) {
      return {
        sessionId: data.session_id,
        messages: Array.isArray(data.messages) ? data.messages as ChatMessage[] : [],
        technologiesDiscussed: Array.isArray(data.technologies_discussed)
          ? data.technologies_discussed
          : []
      }
    }

    // Create new conversation — upsert prevents duplicate-key errors on concurrent requests
    const { error: upsertError } = await supabase.from('conversations').upsert(
      {
        session_id: sessionId,
        messages: [],
        technologies_discussed: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'session_id', ignoreDuplicates: true }
    )

    if (upsertError) {
      console.error('[ConversationManager] Failed to create conversation:', upsertError.message)
    }

    return {
      sessionId,
      messages: [],
      technologiesDiscussed: []
    }
  }

  /**
   * Add a message using a pre-fetched conversation (avoids redundant round-trip).
   * Prefer this over addMessage when the caller already has the Conversation object.
   */
  async addMessageWithConversation(
    conversation: Conversation,
    message: ChatMessage,
    supabase: SupabaseClient
  ): Promise<void> {
    const updatedMessages = [...conversation.messages, message]

    const mentionedTechs = this.extractTechnologies(message.content)
    const allTechs = Array.from(
      new Set([...conversation.technologiesDiscussed, ...mentionedTechs])
    )

    const { error } = await supabase
      .from('conversations')
      .update({
        messages: updatedMessages,
        technologies_discussed: allTechs,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', conversation.sessionId)

    if (error) {
      console.error('[ConversationManager] Failed to save message:', error.message)
    }

    // Mutate the in-memory conversation so subsequent addMessageWithConversation
    // calls in the same request see the latest state
    conversation.messages = updatedMessages
    conversation.technologiesDiscussed = allTechs
  }

  /**
   * Add a message to the conversation (re-fetches conversation from DB).
   * Use addMessageWithConversation when the Conversation object is already available.
   */
  async addMessage(
    sessionId: string,
    message: ChatMessage,
    supabase: SupabaseClient
  ): Promise<void> {
    const conversation = await this.getOrCreateConversation(sessionId, supabase)
    await this.addMessageWithConversation(conversation, message, supabase)
  }

  /**
   * Build context prompt from conversation history.
   * When currentQuestion is empty, returns only the prior turns block.
   */
  buildContextPrompt(conversation: Conversation, currentQuestion: string): string {
    const messages = conversation.messages

    if (messages.length === 0) {
      return currentQuestion
    }

    // Keep last 6 messages (3 exchanges) for context
    const recentMessages = messages.slice(-6)

    let context = 'Previous conversation:\n\n'

    for (const msg of recentMessages) {
      context += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`
    }

    if (currentQuestion) {
      context += `Current question: ${currentQuestion}`
    }

    return context.trimEnd()
  }

  /**
   * Extract technology names from text.
   * Simple whole-word pattern matching for common tech names.
   */
  extractTechnologies(text: string): string[] {
    const lowerText = text.toLowerCase()
    const techs: string[] = []

    // Common technologies to detect — ordered most-specific first to reduce false positives
    const techKeywords = [
      'typescript', 'javascript',
      'react', 'vue', 'angular', 'svelte',
      'nextjs', 'next.js', 'nuxt',
      'nodejs', 'node.js', 'express', 'nestjs', 'fastify',
      'python', 'rust', 'golang', 'java', 'kotlin', 'swift',
      'postgres', 'postgresql', 'mysql', 'mongodb', 'redis',
      'docker', 'kubernetes', 'terraform',
      'aws', 'azure', 'gcp',
      'django', 'flask', 'fastapi', 'rails',
      'graphql',
      'webpack', 'vite', 'turbopack',
      'tailwind', 'sass',
    ]

    for (const tech of techKeywords) {
      const escaped = tech.replace('.', '\\.').replace('+', '\\+')
      const regex = new RegExp(`\\b${escaped}\\b`, 'i')
      if (regex.test(lowerText)) {
        // Normalize to slug form
        techs.push(tech.replace('.js', '').replace('.', '-').toLowerCase())
      }
    }

    return [...new Set(techs)]
  }
}
