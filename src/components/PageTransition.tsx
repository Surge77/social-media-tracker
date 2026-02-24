'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduced  = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={reduced ? {} : { opacity: 0, y: 10 }}
      animate={reduced ? {} : { opacity: 1, y: 0 }}
      transition={reduced ? {} : { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}
