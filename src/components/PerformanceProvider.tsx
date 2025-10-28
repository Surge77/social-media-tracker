'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { performanceMonitor, logBundleInfo } from '@/lib/performance';

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export default function PerformanceProvider({ children }: PerformanceProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Log bundle information on initial load
    if (process.env.NODE_ENV === 'development') {
      logBundleInfo();
    }
  }, []);

  useEffect(() => {
    // Monitor route changes
    performanceMonitor.markRouteChangeStart(pathname);
    
    // Use a small delay to ensure the route change is complete
    const timer = setTimeout(() => {
      performanceMonitor.markRouteChangeComplete(pathname);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  return <>{children}</>;
}