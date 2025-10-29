import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Health check endpoint to verify Supabase configuration
 * Tests both environment validation and server client creation
 */
export async function GET() {
  try {
    // Test server client creation and basic connectivity
    const supabase = createSupabaseServerClient();
    
    // Simple query to test connection (this will fail if database isn't set up yet, but that's expected)
    const { error } = await supabase.from('items').select('count').limit(1);
    
    return NextResponse.json({
      status: 'ok',
      message: 'Supabase configuration is valid',
      timestamp: new Date().toISOString(),
      database_connection: error ? 'not_ready' : 'connected',
      error_details: error?.message || null,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Supabase configuration failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}