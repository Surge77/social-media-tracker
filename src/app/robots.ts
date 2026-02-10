import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/api/seed-history', '/api/test', '/api/test-fetchers'],
    },
    sitemap: 'https://devtrends.dev/sitemap.xml',
  }
}
