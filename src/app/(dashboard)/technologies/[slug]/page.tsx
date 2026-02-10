import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { TechnologyDetailClient } from '@/components/technologies/TechnologyDetailClient'

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
      return { title: 'Technology Not Found' }
    }

    return {
      title: tech.name,
      description: `${tech.name} developer trends: GitHub activity, community buzz, job market demand, and ecosystem health. ${tech.description}`,
      openGraph: {
        title: `${tech.name} — DevTrends`,
        description: tech.description,
      },
    }
  } catch {
    return { title: 'Technology Details' }
  }
}

export default function TechnologyDetailPage() {
  return <TechnologyDetailClient />
}
