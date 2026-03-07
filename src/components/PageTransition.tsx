'use client'

import { motion, type Transition } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useCompactViewport } from '@/hooks/useCompactViewport'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const compact = useCompactViewport()

  const initial = reduced ? {} : compact ? { opacity: 0 } : { opacity: 0, y: 6 }
  const animate = reduced ? {} : { opacity: 1, y: 0 }
  const transition: Transition | undefined = reduced
    ? {}
    : { duration: compact ? 0.12 : 0.16, ease: [0.25, 0.46, 0.45, 0.94] as const }

  return (
    <motion.div
      key={pathname}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
