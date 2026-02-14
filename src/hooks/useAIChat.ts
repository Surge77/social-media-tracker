'use client'

import { useState, useCallback } from 'react'

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

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim()) return
      if (isStreaming) return

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
          })
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

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

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
