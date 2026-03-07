'use client'

import { useSyncExternalStore } from 'react'

export function useCompactViewport(query = '(max-width: 767px)'): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', onStoreChange)
      return () => mediaQuery.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}
