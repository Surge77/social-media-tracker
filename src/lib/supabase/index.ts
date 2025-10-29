// Client-side exports
export { supabase, createSupabaseClient } from './client';
export type { SupabaseClient } from './client';

// Server-side exports
export { 
  createSupabaseServerClient, 
  createSupabaseServerClientWithAuth 
} from './server';
export type { SupabaseServerClient } from './server';

// Environment validation exports
export { 
  getClientEnv, 
  getServerEnv, 
  validateEnvironment 
} from '../env';
export type { ClientEnv, ServerEnv } from '../env';

// Database operations exports
export * from './queries';
export * from './filters';
export * from './trending';