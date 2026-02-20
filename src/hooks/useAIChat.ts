'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface UseAIChatReturn {
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  sendMessage: (question: string) => Promise<void>
  clearError: () => void
}

/**
 * React hook for SSE streaming chat with "Ask DevTrends"
 */
export function useAIChat(sessionId: string): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cancel any in-progress stream on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim()) return
      if (isStreaming) return

      // Cancel any previous in-flight request
      abortControllerRef.current?.abort()
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setIsStreaming(true)
      setError(null)

      // Add user message immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content: question,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, userMessage])

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

        // Add placeholder for assistant message
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, assistantMessage])

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

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

                  // Update the assistant message
                  setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: assistantContent
                    }
                    return updated
                  })
                }

                if (parsed.done) {
                  // Streaming complete
                  reader.cancel()
                  break
                }
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
                continue
              }
            }
          }
        }
      } catch (err) {
        // Ignore abort errors — user navigated away intentionally
        if ((err as Error).name === 'AbortError') return

        setError((err as Error).message)

        // Remove the placeholder assistant message if it failed
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1]
          if (lastMsg.role === 'assistant' && !lastMsg.content) {
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

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearError
  }
}
