'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAIChat } from '@/hooks/useAIChat'
import { ChatMessage } from '@/components/ask/ChatMessage'
import { SuggestedQuestions } from '@/components/ask/SuggestedQuestions'
import { LoadingSpinner } from '@/components/ui/loading'
import { v4 as uuidv4 } from 'uuid'

export function AskPageClient() {
  const prefersReducedMotion = useReducedMotion()
  const [sessionId] = useState(() => {
    // Try to get session ID from sessionStorage, or create new one
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('devtrends_chat_session')
      if (stored) return stored
      const newId = uuidv4()
      sessionStorage.setItem('devtrends_chat_session', newId)
      return newId
    }
    return uuidv4()
  })

  const { messages, isStreaming, error, sendMessage, clearError } = useAIChat(sessionId)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    await sendMessage(input)
    setInput('')
    inputRef.current?.focus()
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Ask DevTrends AI</h1>
        <p className="text-muted-foreground mb-8">
          Get personalized career advice and technology insights powered by real-time trend data.
        </p>

        {messages.length === 0 && (
          <SuggestedQuestions onSelectQuestion={handleSuggestedQuestion} />
        )}

        <div className="space-y-4">
          {/* Chat messages */}
          <div className="min-h-[400px] max-h-[600px] overflow-y-auto rounded-lg border bg-card p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>Start a conversation by asking a question below</p>
              </div>
            )}

            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                <p className="text-sm text-destructive">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-xs text-destructive hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Ask about technologies, career advice, or learning paths..."
              className="w-full rounded-lg border bg-background px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              rows={3}
              disabled={isStreaming}
            />

            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="absolute bottom-3 right-3 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isStreaming ? (
                <LoadingSpinner size="sm" className="!border-primary-foreground/20 !border-t-primary-foreground" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            AI responses are based on current trend data. Always verify important career decisions.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
