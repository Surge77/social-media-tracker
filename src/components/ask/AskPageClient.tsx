'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, RotateCcw, Plus } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAIChat } from '@/hooks/useAIChat'
import { ChatMessage } from '@/components/ask/ChatMessage'
import { SuggestedQuestions } from '@/components/ask/SuggestedQuestions'
import { v4 as uuidv4 } from 'uuid'

function getOrCreateSessionId(): string {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('devtrends_chat_session')
    if (stored) return stored
    const newId = uuidv4()
    sessionStorage.setItem('devtrends_chat_session', newId)
    return newId
  }
  return uuidv4()
}

export function AskPageClient() {
  const prefersReducedMotion = useReducedMotion()
  const [initialSessionId] = useState(getOrCreateSessionId)

  const { messages, isStreaming, error, sendMessage, retryLastMessage, clearSession, clearError } =
    useAIChat(initialSessionId)

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea to content (up to max height)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    setInput(el.value)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    const question = input
    setInput('')
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    await sendMessage(question)
    inputRef.current?.focus()
  }

  // Auto-send when a suggested question is clicked
  const handleSuggestedQuestion = useCallback((question: string) => {
    sendMessage(question)
  }, [sendMessage])

  const handleNewChat = useCallback(() => {
    clearSession()
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    inputRef.current?.focus()
  }, [clearSession])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Ask DevTrends AI</h1>
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus size={13} />
              New chat
            </button>
          )}
        </div>
        <p className="text-muted-foreground mb-8">
          Get personalized career advice and technology insights powered by real-time trend data.
        </p>

        {messages.length === 0 && (
          <SuggestedQuestions
            onSelectQuestion={handleSuggestedQuestion}
            disabled={isStreaming}
          />
        )}

        <div className="space-y-4">
          {/* Chat messages */}
          <div className="min-h-[400px] max-h-[600px] overflow-y-auto rounded-lg border bg-card p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>Start a conversation by asking a question below</p>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                <p className="text-sm text-destructive">{error}</p>
                <div className="mt-2 flex gap-3">
                  <button
                    onClick={retryLastMessage}
                    disabled={isStreaming}
                    className="flex items-center gap-1.5 text-xs text-destructive hover:underline disabled:opacity-50"
                  >
                    <RotateCcw size={12} />
                    Retry
                  </button>
                  <button
                    onClick={clearError}
                    className="text-xs text-destructive hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              id="chat-input"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Ask about technologies, career advice, or learning paths..."
              aria-label="Ask a question"
              aria-describedby="chat-input-hint"
              className="w-full rounded-lg border bg-background px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 overflow-hidden"
              rows={3}
              style={{ minHeight: '72px' }}
              disabled={isStreaming}
            />

            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              aria-label="Send message"
              className="absolute bottom-3 right-3 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p id="chat-input-hint" className="text-xs text-muted-foreground text-center">
            Press Enter to send · Shift+Enter for new line · AI responses are based on current trend data
          </p>
        </div>
      </motion.div>
    </div>
  )
}
