'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { useState } from 'react';
import AnimatedLayout from '@/components/AnimatedLayout';
import PerformanceProvider from '@/components/PerformanceProvider';
import PerformanceDashboard from '@/components/PerformanceDashboard';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Global defaults for all queries
        staleTime: 30000, // 30 seconds
        refetchOnWindowFocus: false, // Disable automatic refetch on window focus by default
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors, but retry on 5xx errors
          if (error && 'status' in error && typeof error.status === 'number') {
            if (error.status >= 400 && error.status < 500) {
              return false;
            }
          }
          return failureCount < 3;
        },
      },
    },
  }));

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