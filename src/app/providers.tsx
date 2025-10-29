'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { useState, useEffect } from 'react';
import AnimatedLayout from '@/components/AnimatedLayout';
import PerformanceProvider from '@/components/PerformanceProvider';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import { validateEnvironment } from '@/lib/supabase';
import { CategorizedError, ErrorCategory, ErrorSeverity } from '@/lib/supabase/error-handling';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Global defaults for all queries
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: false, // Disable automatic refetch on window focus by default
        retry: (failureCount, error) => {
          // Handle CategorizedError instances
          if (error instanceof CategorizedError) {
            return error.retryable && failureCount < 3;
          }
          
          // Handle API errors with status codes
          if (error && 'status' in error && typeof error.status === 'number') {
            if (error.status >= 400 && error.status < 500) {
              return false; // Don't retry client errors
            }
            return failureCount < 3; // Retry server errors
          }
          
          // Default retry logic
          return failureCount < 3;
        },
        retryDelay: (attemptIndex, error) => {
          // Handle CategorizedError instances
          if (error instanceof CategorizedError) {
            if (error.category === ErrorCategory.RATE_LIMIT) {
              return 60000; // Wait 1 minute for rate limit errors
            }
            if (error.category === ErrorCategory.NETWORK) {
              return Math.min(1000 * 2 ** attemptIndex, 10000); // Exponential backoff for network errors
            }
          }
          
          // Default exponential backoff
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        },
      },
      mutations: {
        retry: (failureCount, error) => {
          // Be more conservative with mutations
          if (error instanceof CategorizedError) {
            return error.retryable && failureCount < 2;
          }
          return failureCount < 2;
        },
      },
    },
  }));

  // Validate environment variables on client startup
  useEffect(() => {
    try {
      validateEnvironment();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      // In a production app, you might want to show an error boundary here
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PerformanceProvider>
          <AnimatedLayout>
            {children}
          </AnimatedLayout>
        </PerformanceProvider>
        <PerformanceDashboard />
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}