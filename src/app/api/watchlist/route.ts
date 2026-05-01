import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ slugs: [] })

  const { data } = await supabase
    .from('watchlist_items')
    .select('tech_slug')
    .eq('user_id', user.id)

  return NextResponse.json({ slugs: data?.map(r => r.tech_slug) ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await request.json() as { slug: string }
  await supabase.from('watchlist_items').upsert(
    { user_id: user.id, tech_slug: slug },
    { onConflict: 'user_id,tech_slug' }
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await request.json() as { slug: string }
  await supabase
    .from('watchlist_items')
    .delete()
    .eq('user_id', user.id)
    .eq('tech_slug', slug)
  return NextResponse.json({ ok: true })
}
