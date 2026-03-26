import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireDevelopmentOnly } from '@/lib/http/route-guards'

export async function GET() {
  const guard = requireDevelopmentOnly(process.env)
  if (guard) return guard

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('technologies')
    .select('slug, name, category')
    .limit(5)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ count: data.length, sample: data })
}
