import fs from 'node:fs'
import path from 'node:path'
import nextConfig from '../../../next.config'
import robots from '@/app/robots'
import { LEGACY_HOSTS, SITE_URL } from '@/lib/seo'

describe('SEO domain configuration', () => {
  it('pins the canonical host to the production .pro domain across metadata files', () => {
    const layoutSource = fs.readFileSync(
      path.join(process.cwd(), 'src/app/layout.tsx'),
      'utf8'
    )
    const sitemapSource = fs.readFileSync(
      path.join(process.cwd(), 'src/app/sitemap.ts'),
      'utf8'
    )

    expect(SITE_URL).toBe('https://www.devtrends.pro')

    expect(layoutSource).toContain('metadataBase: new URL(SITE_URL)')
    expect(layoutSource).not.toContain('devtrends.dev')

    expect(sitemapSource).toContain('const baseUrl = SITE_URL')
    expect(sitemapSource).not.toContain('devtrends.dev')

    expect(robots().sitemap).toBe('https://www.devtrends.pro/sitemap.xml')
  })

  it('includes the Google Search Console verification token in root metadata', () => {
    const layoutSource = fs.readFileSync(
      path.join(process.cwd(), 'src/app/layout.tsx'),
      'utf8'
    )

    expect(layoutSource).toContain("google: 'HJZOWekjSh07-2FrEQOHeOUB2Tn05Il_8agggR7fjsg'")
  })

  it('redirects legacy hosts to the canonical www.devtrends.pro domain', async () => {
    const redirects = await nextConfig.redirects?.()

    expect(redirects).toBeDefined()

    expect(LEGACY_HOSTS).toEqual([
      'devtrends.dev',
      'www.devtrends.dev',
      'devtrends.pro',
    ])

    for (const host of LEGACY_HOSTS) {
      expect(redirects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            source: '/:path*',
            has: [{ type: 'host', value: host }],
            destination: 'https://www.devtrends.pro/:path*',
            permanent: true,
          }),
        ])
      )
    }
  })
})
