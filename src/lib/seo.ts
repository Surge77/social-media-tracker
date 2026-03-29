import type { Metadata } from 'next'

export const SITE_NAME = 'DevTrends'
export const SITE_URL = 'https://www.devtrends.pro'
export const LEGACY_HOSTS = ['devtrends.dev', 'www.devtrends.dev', 'devtrends.pro'] as const

function normalizePath(path: string): string {
  if (!path || path === '/') return '/'
  return path.startsWith('/') ? path : `/${path}`
}

export function absoluteUrl(path = '/'): string {
  return new URL(normalizePath(path), SITE_URL).toString()
}

export function withCanonicalMetadata(path: string, metadata: Metadata): Metadata {
  const canonical = absoluteUrl(path)

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
    },
    openGraph: metadata.openGraph
      ? {
          ...metadata.openGraph,
          url: canonical,
          siteName: metadata.openGraph.siteName ?? SITE_NAME,
        }
      : undefined,
  }
}
