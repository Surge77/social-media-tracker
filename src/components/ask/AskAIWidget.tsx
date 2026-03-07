'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, RotateCcw, Plus, TrendingUp, Briefcase, Code, Lightbulb } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAIChat } from '@/hooks/useAIChat'
import { ChatMessage } from '@/components/ask/ChatMessage'
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

const SUGGESTED = [
  { icon: TrendingUp, question: "What's the fastest growing frontend framework?", category: 'Trends' },
  { icon: Code, question: 'Should I learn React if I already know Vue?', category: 'Learning' },
  { icon: Briefcase, question: 'Which backend framework has the best job market?', category: 'Career' },
  { icon: Lightbulb, question: 'Is TypeScript still worth learning in 2026?', category: 'Advice' },
]

export function AskAIWidget() {
  const prefersReducedMotion = useReducedMotion()
  const [isOpen, setIsOpen] = useState(false)
  const [initialSessionId] = useState(getOrCreateSessionId)

  const { messages, isStreaming, error, sendMessage, retryLastMessage, clearSession, clearError } =
    useAIChat(initialSessionId)

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Cmd+K / Ctrl+K to toggle, Escape to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    setInput(el.value)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    const question = input
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    await sendMessage(question)
    inputRef.current?.focus()
  }

  const handleSuggestion = useCallback(
    (question: string) => sendMessage(question),
    [sendMessage]
  )

  const handleNewChat = useCallback(() => {
    clearSession()
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    inputRef.current?.focus()
  }, [clearSession])

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Chat modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="modal"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-x-2 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-50 flex max-h-[calc(100dvh-6.75rem)] flex-col rounded-[26px] border border-border/70 bg-background/98 shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-5 sm:w-[min(560px,calc(100vw-2rem))] sm:max-h-[min(600px,calc(100dvh-8rem))]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5 sm:px-5 sm:py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Ask DevTrends AI</p>
                  <p className="text-xs text-muted-foreground">Live answers from current trend data</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={handleNewChat}
                    className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Plus size={12} />
                    New chat
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Suggested questions</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {SUGGESTED.map((s) => {
                      const Icon = s.icon
                      return (
                        <button
                          key={s.question}
                          onClick={() => handleSuggestion(s.question)}
                          disabled={isStreaming}
                          className="group flex flex-col gap-1.5 rounded-2xl border border-border/70 bg-card/55 p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
                        >
                          <div className="flex items-center gap-1.5">
                            <Icon size={12} className="text-primary" />
                            <span className="text-[10px] font-medium uppercase tracking-wide text-primary/70">
                              {s.category}
                            </span>
                          </div>
                          <span className="text-xs leading-snug text-foreground">{s.question}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))}

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                  <p className="text-xs text-destructive">{error}</p>
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={retryLastMessage}
                      disabled={isStreaming}
                      className="flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50"
                    >
                      <RotateCcw size={11} />
                      Retry
                    </button>
                    <button onClick={clearError} className="text-xs text-destructive hover:underline">
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="safe-bottom border-t border-border/70 px-4 py-3">
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  placeholder="Ask about technologies, careers, or trends…"
                  rows={1}
                  style={{ minHeight: '44px' }}
                  disabled={isStreaming}
                  className="w-full resize-none rounded-2xl border border-border bg-muted/30 px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  aria-label="Send"
                  className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                </button>
              </form>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
                Enter to send · Shift+Enter for new line · Esc to close
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
        aria-label="Open AI chat (Cmd+K)"
        aria-expanded={isOpen}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.9rem)] right-3 z-50 flex items-center gap-2 rounded-full border border-primary/25 bg-background/96 px-3 py-2.5 shadow-lg shadow-primary/10 transition-colors hover:border-primary/60 hover:bg-primary/5 sm:bottom-6 sm:right-6 sm:gap-2.5 sm:px-4 sm:py-3"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Sparkles
            size={13}
            className={`text-primary transition-transform ${isOpen ? 'rotate-12' : ''}`}
          />
        </div>
        <span className="text-sm font-semibold text-foreground max-[430px]:hidden">Ask AI</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </motion.button>
    </>
  )
}
