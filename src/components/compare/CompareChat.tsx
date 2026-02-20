'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle, X, Sparkles, RotateCcw } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ChatMessage } from '@/components/ask/ChatMessage'
import { LoadingSpinner } from '@/components/ui/loading'
import { cn } from '@/lib/utils'
import type { CompareData } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface CompareChatProps {
  compareData: CompareData
  className?: string
}

interface LocalChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const SUGGESTED_QUESTIONS = [
  'Which technology is better for my career?',
  'What are the key differences between these technologies?',
  'Which one has better job prospects?',
  'Which should I learn first as a beginner?',
  'How do these compare in terms of ecosystem maturity?',
]

export function CompareChat({ compareData, className }: CompareChatProps) {
  const prefersReducedMotion = useReducedMotion()
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const techSlugs = compareData.technologies.map((t) => t.slug).sort().join('-')
      const storageKey = `devtrends_compare_chat_${techSlugs}`
      const stored = sessionStorage.getItem(storageKey)
      if (stored) return stored
      const newId = uuidv4()
      sessionStorage.setItem(storageKey, newId)
      return newId
    }
    return uuidv4()
  })
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<LocalChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastUserMessageRef = useRef<string | null>(null)

  // Cancel stream on unmount
  useEffect(() => {
    return () => { abortControllerRef.current?.abort() }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const doSend = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return

    abortControllerRef.current?.abort()
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const techNames = compareData.technologies.map((t) => t.name).join(' vs ')
    const enhancedQuestion = `Comparing ${techNames}: ${question}`
    lastUserMessageRef.current = question

    const userMessage: LocalChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    const assistantId = crypto.randomUUID()

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: enhancedQuestion, sessionId }),
        signal: abortController.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let assistantContent = ''
      let buffer = ''

      const assistantPlaceholder: LocalChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantPlaceholder])

      let streamDone = false

      while (true) {
        const { done, value } = await reader.read()
        if (done || streamDone) break

        // Buffer incomplete lines across network reads
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (!data) continue

            try {
              const parsed = JSON.parse(data)

              if (parsed.error) {
                throw new Error(parsed.error)
              }

              if (parsed.chunk) {
                assistantContent += parsed.chunk
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                )
              }

              if (parsed.done) {
                streamDone = true
                reader.cancel()
                break
              }
            } catch (e) {
              if ((e as Error).name === 'SyntaxError') continue // incomplete JSON chunk
              throw e
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return

      setError(err instanceof Error ? err.message : 'Failed to send message')
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.id === assistantId && !last.content) return prev.slice(0, -1)
        return prev
      })
    } finally {
      setIsLoading(false)
    }
  }, [compareData.technologies, isLoading, sessionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await doSend(input)
  }

  const handleSuggestedQuestion = (question: string) => {
    doSend(question)
  }

  const handleRetry = () => {
    if (lastUserMessageRef.current) {
      doSend(lastUserMessageRef.current)
    }
  }

  const techNames = compareData.technologies.map((t) => t.name).join(' vs ')

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={prefersReducedMotion ? {} : { scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 hover:border-primary/50"
          >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">Ask questions about this comparison</span>
            <span className="sm:hidden">Ask questions</span>
            <Sparkles size={14} className="text-primary/60" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-border bg-card/30 shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Ask about {techNames}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Powered by comparison data
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="max-h-[400px] min-h-[300px] space-y-4 overflow-y-auto p-4">
              {messages.length === 0 && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-muted-foreground">
                    Ask me anything about this comparison:
                  </p>
                  <div className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <motion.button
                        key={q}
                        initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        whileHover={prefersReducedMotion ? {} : { x: 4 }}
                        onClick={() => handleSuggestedQuestion(q)}
                        disabled={isLoading}
                        className="block w-full rounded-md border border-border bg-card/50 px-3 py-2 text-left text-xs text-foreground transition-all hover:border-primary/50 hover:bg-card disabled:opacity-50"
                      >
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LoadingSpinner size="sm" />
                  <span>Thinking...</span>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                  <p className="text-xs text-destructive">{error}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-1 text-xs text-destructive hover:underline"
                    >
                      <RotateCcw size={12} />
                      Retry
                    </button>
                    <button
                      onClick={() => setError(null)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t border-border p-4">
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
                  placeholder="Ask a question..."
                  aria-label="Ask a question about this comparison"
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  rows={2}
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                  className="absolute bottom-2 right-2 rounded-md bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="!border-primary-foreground/20 !border-t-primary-foreground" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>

              <p className="mt-2 text-xs text-muted-foreground">
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
