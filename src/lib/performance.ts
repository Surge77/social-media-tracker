'use client';

import React from 'react';

interface PerformanceMetrics {
  routeChangeStart: number;
  routeChangeComplete: number;
  componentMountStart: number;
  componentMountComplete: number;
  dataFetchStart: number;
  dataFetchComplete: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('Navigation Performance:', {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
            });
          }
        });
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (e) {
        console.warn('Navigation observer not supported');
      }

      // Observe resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('/_next/static/chunks/')) {
            const resourceEntry = entry as PerformanceResourceTiming;
            console.log('Chunk Load Performance:', {
              name: entry.name.split('/').pop(),
              duration: entry.duration,
              size: resourceEntry.transferSize || 0,
            });
          }
        });
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }
  }

  // Mark the start of a route change
  markRouteChangeStart(route: string) {
    this.metrics.routeChangeStart = performance.now();
    console.log(`Route change started: ${route}`);
  }

  // Mark the completion of a route change
  markRouteChangeComplete(route: string) {
    this.metrics.routeChangeComplete = performance.now();
    const duration = this.metrics.routeChangeComplete - (this.metrics.routeChangeStart || 0);
    console.log(`Route change completed: ${route} (${duration.toFixed(2)}ms)`);
    
    // Log warning if route change is slow
    if (duration > 1000) {
      console.warn(`Slow route change detected: ${route} took ${duration.toFixed(2)}ms`);
    }
  }

  // Mark component mount start
  markComponentMountStart(componentName: string) {
    this.metrics.componentMountStart = performance.now();
    console.log(`Component mount started: ${componentName}`);
  }

  // Mark component mount complete
  markComponentMountComplete(componentName: string) {
    this.metrics.componentMountComplete = performance.now();
    const duration = this.metrics.componentMountComplete - (this.metrics.componentMountStart || 0);
    console.log(`Component mount completed: ${componentName} (${duration.toFixed(2)}ms)`);
    
    // Log warning if component mount is slow
    if (duration > 500) {
      console.warn(`Slow component mount detected: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  }

  // Mark data fetch start
  markDataFetchStart(endpoint: string) {
    this.metrics.dataFetchStart = performance.now();
    console.log(`Data fetch started: ${endpoint}`);
  }

  // Mark data fetch complete
  markDataFetchComplete(endpoint: string, success: boolean = true) {
    this.metrics.dataFetchComplete = performance.now();
    const duration = this.metrics.dataFetchComplete - (this.metrics.dataFetchStart || 0);
    const status = success ? 'completed' : 'failed';
    console.log(`Data fetch ${status}: ${endpoint} (${duration.toFixed(2)}ms)`);
    
    // Log warning if data fetch is slow
    if (duration > 2000) {
      console.warn(`Slow data fetch detected: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
  }

  // Get current metrics
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  // Get Web Vitals
  getWebVitals() {
    if (typeof window === 'undefined') return null;

    return {
      // First Contentful Paint
      fcp: this.getPerformanceEntry('first-contentful-paint'),
      // Largest Contentful Paint
      lcp: this.getPerformanceEntry('largest-contentful-paint'),
      // First Input Delay would need to be measured differently
      // Cumulative Layout Shift would need to be measured differently
    };
  }

  private getPerformanceEntry(name: string) {
    if (typeof window === 'undefined') return null;
    
    const entries = performance.getEntriesByName(name);
    return entries.length > 0 ? entries[0].startTime : null;
  }

  // Clean up observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return performanceMonitor;
}

// Higher-order component for monitoring component performance
export function withPerformanceMonitoring<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> {
  return function PerformanceMonitoredComponent(props: T) {
    const monitor = usePerformanceMonitor();
    
    React.useEffect(() => {
      monitor.markComponentMountStart(componentName);
      
      return () => {
        monitor.markComponentMountComplete(componentName);
      };
    }, [monitor]);

    return React.createElement(WrappedComponent, props);
  };
}

// Route change monitoring for Next.js
export function useRouteChangeMonitoring() {
  React.useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      performanceMonitor.markRouteChangeStart(url);
    };

    const handleRouteChangeComplete = (url: string) => {
      performanceMonitor.markRouteChangeComplete(url);
    };

    // These would be used with Next.js router events
    // router.events.on('routeChangeStart', handleRouteChangeStart);
    // router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      // router.events.off('routeChangeStart', handleRouteChangeStart);
      // router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, []);
}

// Bundle size analysis helper
export function logBundleInfo() {
  if (typeof window === 'undefined') return;

  // Log information about loaded chunks
  const scripts = document.querySelectorAll('script[src*="_next/static/chunks/"]');
  console.log(`Loaded chunks: ${scripts.length}`);
  
  scripts.forEach((script, index) => {
    const src = script.getAttribute('src');
    if (src) {
      console.log(`Chunk ${index + 1}: ${src.split('/').pop()}`);
    }
  });
}