'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface UseAIChatReturn {
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  sendMessage: (question: string) => Promise<void>
  retryLastMessage: () => Promise<void>
  clearSession: () => void
  clearError: () => void
}

/**
 * React hook for SSE streaming chat with "Ask DevTrends"
 */
export function useAIChat(initialSessionId: string): UseAIChatReturn {
  const [sessionId, setSessionId] = useState(initialSessionId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastUserMessageRef = useRef<string | null>(null)

  // Cancel any in-progress stream on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearSession = useCallback(() => {
    abortControllerRef.current?.abort()
    setMessages([])
    setError(null)
    setIsStreaming(false)
    lastUserMessageRef.current = null
    // Generate a new session ID so the server creates a fresh conversation
    const newId = crypto.randomUUID()
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('devtrends_chat_session', newId)
    }
    setSessionId(newId)
  }, [])

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim()) return
      if (isStreaming) return

      // Cancel any previous in-flight request
      abortControllerRef.current?.abort()
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      lastUserMessageRef.current = question

      setIsStreaming(true)
      setError(null)

      // Add user message immediately with stable ID
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: question,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, userMessage])

      // Placeholder for assistant message — added before streaming starts
      const assistantId = crypto.randomUUID()

      try {
        const response = await fetch('/api/ai/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            question,
            sessionId
          }),
          signal: abortController.signal,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to send message')
        }

        // Handle SSE stream
        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response stream')
        }

        const decoder = new TextDecoder()
        let assistantContent = ''
        let buffer = ''

        // Add placeholder for assistant message with stable ID
        const assistantPlaceholder: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, assistantPlaceholder])

        let streamDone = false

        while (true) {
          const { done, value } = await reader.read()

          // Break on underlying stream end OR on done signal from server
          if (done || streamDone) break

          // Buffer incomplete lines across chunks (fixes split SSE events)
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? '' // Keep last incomplete line for next iteration

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)

              try {
                const parsed = JSON.parse(data)

                if (parsed.error) {
                  throw new Error(parsed.error)
                }

                if (parsed.chunk) {
                  assistantContent += parsed.chunk

                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantId
                        ? { ...msg, content: assistantContent }
                        : msg
                    )
                  )
                }

                if (parsed.done) {
                  streamDone = true
                  reader.cancel()
                  break // breaks inner for loop; outer while checks streamDone
                }
              } catch (e) {
                if ((e as Error).name === 'SyntaxError') continue // incomplete JSON, skip
                throw e // re-throw real errors
              }
            }
          }
        }
      } catch (err) {
        // Ignore abort errors — user navigated away or started new session
        if ((err as Error).name === 'AbortError') return

        setError((err as Error).message)

        // Remove empty placeholder assistant message on failure
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last?.id === assistantId && !last.content) {
            return prev.slice(0, -1)
          }
          return prev
        })
      } finally {
        setIsStreaming(false)
      }
    },
    [sessionId, isStreaming]
  )

  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current || isStreaming) return
    await sendMessage(lastUserMessageRef.current)
  }, [sendMessage, isStreaming])

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    retryLastMessage,
    clearSession,
    clearError
  }
}
