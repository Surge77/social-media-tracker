'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, Sparkles } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const prefersReducedMotion = useReducedMotion()
  const isUser = role === 'user'

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.3 }}
      className={cn(
        'flex gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        <div className="text-sm whitespace-pre-wrap break-words">
          {content || (
            // Typing indicator while waiting for first chunk
            <span className="flex items-center gap-1">
              <span className="animate-bounce delay-0 h-1.5 w-1.5 rounded-full bg-current opacity-60" />
              <span className="animate-bounce delay-150 h-1.5 w-1.5 rounded-full bg-current opacity-60" />
              <span className="animate-bounce delay-300 h-1.5 w-1.5 rounded-full bg-current opacity-60" />
            </span>
          )}
        </div>

        <div
          className={cn(
            'mt-2 text-xs opacity-60',
            isUser ? 'text-primary-foreground' : 'text-muted-foreground'
          )}
        >
          {new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  )
}
