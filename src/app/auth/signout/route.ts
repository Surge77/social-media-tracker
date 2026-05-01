import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()

  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/`, { status: 302 })
}
