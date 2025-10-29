import { createClient } from '@supabase/supabase-js';
import { getServerEnv } from '../env';
import type { Database } from '@/types/database.types';

/**
 * Supabase client for server-side operations
 * Uses service role key with elevated permissions
 * Should ONLY be used in server-side code (API routes, server components)
 * 
 * WARNING: Never expose this client to the browser as it bypasses RLS
 */
export function createSupabaseServerClient() {
  const env = getServerEnv();
  
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // Disable realtime for server client to reduce overhead
    realtime: {
      params: {
        eventsPerSecond: 0,
      },
    },
  });
}

/**
 * Creates a Supabase client with user context for server-side operations
 * This maintains RLS policies while running on the server
 * Use this when you need to perform operations on behalf of a specific user
 */
export function createSupabaseServerClientWithAuth(accessToken: string) {
  const env = getServerEnv();
  
  const client = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
  
  return client;
}

// Export the type for use throughout the application
export type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;