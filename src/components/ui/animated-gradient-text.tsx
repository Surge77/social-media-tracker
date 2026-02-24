import { cn } from '@/lib/utils'
import type { ReactNode, CSSProperties } from 'react'

interface AnimatedGradientTextProps {
  children: ReactNode
  className?: string
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full px-4 py-1.5',
        'bg-background/80 backdrop-blur-sm text-sm font-medium',
        className,
      )}
    >
      {/* Animated gradient border via mask trick */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={
          {
            background: 'linear-gradient(90deg, #f97316, #f59e0b, #ea580c, #f97316)',
            backgroundSize: '300% 100%',
            animation: 'agt-border 3s ease infinite',
            padding: '1px',
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          } as CSSProperties
        }
      />
      {children}
    </div>
  )
}
