import type { NextConfig } from 'next'
import { LEGACY_HOSTS } from './src/lib/seo'

const nextConfig: NextConfig = {
  async redirects() {
    return LEGACY_HOSTS.map((host) => ({
      source: '/:path*',
      has: [{ type: 'host' as const, value: host }],
      destination: 'https://www.devtrends.pro/:path*',
      permanent: true,
    }))
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.llama.fi https://api.github.com https://www.googleapis.com https://i.ytimg.com https://img.youtube.com https://api.stackexchange.com https://www.reddit.com https://oauth.reddit.com https://api.reddit.com https://dev.to https://api.coingecko.com https://api.etherscan.io https://api.hasdata.com https://serpapi.com https://libraries.io https://api.npms.io https://api.npmjs.org https://hn.algolia.com",
              "object-src 'none'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'github.githubassets.com' },
      { protocol: 'https', hostname: 'icons.llama.fi' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'libraries.io' },
      { protocol: 'https', hostname: 'media2.dev.to' },
      { protocol: 'https', hostname: 'news.ycombinator.com' },
      { protocol: 'https', hostname: 'redditinc.com' },
      { protocol: 'https', hostname: 'static-production.npmjs.com' },
      { protocol: 'https', hostname: 'stackoverflow.com' },
      { protocol: 'https', hostname: 'zunastatic-abf.kxcdn.com' },
    ],
  },
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-collapsible',
      '@radix-ui/react-label',
      '@radix-ui/react-progress',
      '@radix-ui/react-slot',
      '@radix-ui/primitive',
      '@radix-ui/react-compose-refs',
      '@radix-ui/react-context',
      '@radix-ui/react-id',
      '@radix-ui/react-presence',
      '@radix-ui/react-primitive',
      'lucide-react',
      'framer-motion',
      'recharts',
    ],
  },
}

export default nextConfig
