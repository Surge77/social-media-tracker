import { createClient } from '@supabase/supabase-js';
import { getClientEnv } from '../env';
import type { Database } from '@/types/database.types';

/**
 * Supabase client for browser/client-side operations
 * Uses anonymous key and is safe for client-side use
 * Automatically handles authentication state and session management
 */
export function createSupabaseClient() {
  const env = getClientEnv();
  
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

// Create and export the client instance
export const supabase = createSupabaseClient();

// Export the type for use throughout the application
export type SupabaseClient = ReturnType<typeof createSupabaseClient>;