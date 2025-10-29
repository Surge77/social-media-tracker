import { z } from 'zod';

// Client-side environment variables (safe to expose to browser)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required'),
});

// Server-side environment variables (includes sensitive keys)
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
});

/**
 * Validates and returns client-side environment variables
 * Safe to use in browser environments
 */
export function getClientEnv() {
  try {
    return clientEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(
        `Missing or invalid client environment variables: ${missingVars}. ` +
        'Please check your .env file and ensure all required Supabase variables are set.'
      );
    }
    throw error;
  }
}

/**
 * Validates and returns server-side environment variables
 * Should only be used in server-side code (API routes, server components)
 */
export function getServerEnv() {
  try {
    return serverEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(
        `Missing or invalid server environment variables: ${missingVars}. ` +
        'Please check your .env file and ensure all required Supabase variables are set.'
      );
    }
    throw error;
  }
}

/**
 * Validates all environment variables at application startup
 * Call this in your main application entry point
 */
export function validateEnvironment() {
  try {
    // Always validate client variables
    getClientEnv();
    
    // Only validate server variables in server environment
    if (typeof window === 'undefined') {
      getServerEnv();
    }
    
    return true;
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw error;
  }
}

// Export types for TypeScript
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;