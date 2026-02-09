import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS. ONLY use in server-side cron jobs.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
