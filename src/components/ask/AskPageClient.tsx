'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, RotateCcw, Plus } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAIChat } from '@/hooks/useAIChat'
import { ChatMessage } from '@/components/ask/ChatMessage'
import { SuggestedQuestions } from '@/components/ask/SuggestedQuestions'
import { HyperText } from '@/components/ui/hyper-text'
import { BorderBeam } from '@/components/ui/border-beam'
import { BlurFade } from '@/components/ui/blur-fade'
import { ShimmerButton } from '@/components/ui/shimmer-button'
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
    <div className="app-page-chat py-6 sm:py-8 lg:py-10">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.5 }}
      >
        <div className="app-section-tight">
          <p className="app-eyebrow mb-3">Decision support</p>
          <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold sm:text-3xl"><HyperText text="Ask DevTrends AI" /></h1>
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 rounded-xl border border-border/70 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus size={13} />
                New chat
              </button>
            )}
          </div>
          <p className="app-muted-copy max-w-2xl">
            Get personalized career guidance and technology comparisons from the same live dataset that powers the rest of DevTrends.
          </p>
        </div>

        {messages.length === 0 && (
          <SuggestedQuestions
            onSelectQuestion={handleSuggestedQuestion}
            disabled={isStreaming}
          />
        )}

        <div className="space-y-4">
          {/* Chat messages */}
          <div className="app-surface relative min-h-[360px] max-h-[68dvh] space-y-4 overflow-y-auto p-4 sm:min-h-[420px] sm:max-h-[600px] sm:p-6">
            {isStreaming && (
              <div className="mobile-noise-hidden">
                <BorderBeam size={400} duration={4} colorFrom="#f97316" colorTo="#f59e0b" />
              </div>
            )}
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <p>Start a conversation by asking a question below</p>
              </div>
            )}

            {messages.map((message, i) => (
              <BlurFade key={message.id} delay={0} duration={0.35}>
                <ChatMessage
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              </BlurFade>
            ))}

            {error && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
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
          <form onSubmit={handleSubmit} className="app-surface relative p-3 sm:p-4">
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
              className="w-full resize-none overflow-hidden rounded-2xl border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              rows={3}
              style={{ minHeight: '72px' }}
              disabled={isStreaming}
            />

            <ShimmerButton
              type="submit"
              disabled={!input.trim() || isStreaming}
              aria-label="Send message"
              className="absolute bottom-6 right-6 p-2"
            >
              <Send className="w-4 h-4" />
            </ShimmerButton>
          </form>

          <p id="chat-input-hint" className="text-xs text-muted-foreground text-center">
            Press Enter to send · Shift+Enter for new line · AI responses are based on current trend data
          </p>
        </div>
      </motion.div>
    </div>
  )
}
