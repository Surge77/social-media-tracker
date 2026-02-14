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
   * Get or create a conversation for a session
   */
  async getOrCreateConversation(
    sessionId: string,
    supabase: SupabaseClient
  ): Promise<Conversation> {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      return {
        sessionId: data.session_id,
        messages: Array.isArray(data.messages) ? data.messages as ChatMessage[] : [],
        technologiesDiscussed: Array.isArray(data.technologies_discussed)
          ? data.technologies_discussed
          : []
      }
    }

    // Create new conversation
    const newConversation: Conversation = {
      sessionId,
      messages: [],
      technologiesDiscussed: []
    }

    await supabase.from('conversations').insert({
      session_id: sessionId,
      messages: [],
      technologies_discussed: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    return newConversation
  }

  /**
   * Add a message to the conversation
   */
  async addMessage(
    sessionId: string,
    message: ChatMessage,
    supabase: SupabaseClient
  ): Promise<void> {
    const conversation = await this.getOrCreateConversation(sessionId, supabase)

    const updatedMessages = [...conversation.messages, message]

    // Extract technologies from the message
    const mentionedTechs = this.extractTechnologies(message.content)
    const allTechs = Array.from(
      new Set([...conversation.technologiesDiscussed, ...mentionedTechs])
    )

    await supabase
      .from('conversations')
      .update({
        messages: updatedMessages,
        technologies_discussed: allTechs,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
  }

  /**
   * Build context prompt from conversation history
   * Keeps last N messages, summarizes older ones if needed
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

    context += `Current question: ${currentQuestion}`

    return context
  }

  /**
   * Extract technology names from text
   * Simple pattern matching for common tech names
   */
  extractTechnologies(text: string): string[] {
    const lowerText = text.toLowerCase()
    const techs: string[] = []

    // Common technologies to detect
    const techKeywords = [
      'react', 'vue', 'angular', 'svelte', 'next', 'nuxt',
      'node', 'express', 'nest', 'fastify',
      'typescript', 'javascript', 'python', 'rust', 'go', 'java',
      'postgres', 'mysql', 'mongodb', 'redis',
      'docker', 'kubernetes', 'terraform',
      'aws', 'azure', 'gcp',
      'django', 'flask', 'fastapi', 'rails',
      'graphql', 'rest',
      'webpack', 'vite', 'turbopack',
      'tailwind', 'sass', 'css'
    ]

    for (const tech of techKeywords) {
      // Check for whole word matches
      const regex = new RegExp(`\\b${tech}\\b`, 'i')
      if (regex.test(lowerText)) {
        techs.push(tech)
      }
    }

    return techs
  }
}
