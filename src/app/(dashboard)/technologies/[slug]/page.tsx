import type { Metadata } from 'next'
import { TechnologyDetailClient } from '@/components/technologies/TechnologyDetailClient'
import { withCanonicalMetadata } from '@/lib/seo'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const supabase = await createSupabaseServerClient()
    const { data: tech } = await supabase
      .from('technologies')
      .select('name, description, category')
      .eq('slug', slug)
      .single()

    if (!tech) {
      return withCanonicalMetadata(`/technologies/${slug}`, {
        title: 'Technology Not Found',
      })
    }

    return withCanonicalMetadata(`/technologies/${slug}`, {
      title: tech.name,
      description: `${tech.name} developer trends: GitHub activity, community buzz, job market demand, and ecosystem health. ${tech.description}`,
      openGraph: {
        title: `${tech.name} - DevTrends`,
        description: tech.description,
      },
    })
  } catch {
    return withCanonicalMetadata(`/technologies/${slug}`, {
      title: 'Technology Details',
    })
  }
}

export default function TechnologyDetailPage() {
  return <TechnologyDetailClient />
}
