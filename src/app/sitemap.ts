import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/technologies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blockchain`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quiz/web3-path`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Dynamic technology pages
  try {
    const supabase = await createSupabaseServerClient()
    const { data: technologies } = await supabase
      .from('technologies')
      .select('slug, updated_at')
      .eq('is_active', true)

    const techPages: MetadataRoute.Sitemap = (technologies ?? []).map((tech) => ({
      url: `${baseUrl}/technologies/${tech.slug}`,
      lastModified: new Date(tech.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...techPages]
  } catch {
    return staticPages
  }
}
