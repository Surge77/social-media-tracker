'use client';

import { useState, useEffect } from 'react';
import { performanceMonitor } from '@/lib/performance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>({});
  const [webVitals, setWebVitals] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics());
      setWebVitals(performanceMonitor.getWebVitals());
    };

    // Update metrics every second
    const interval = setInterval(updateMetrics, 1000);
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-3 py-2 rounded-full text-xs font-medium shadow-lg hover:bg-primary/90 transition-colors"
        title="Toggle Performance Dashboard"
      >
        📊 Perf
      </button>

      {/* Performance dashboard */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 w-80 max-h-96 overflow-y-auto">
          <Card className="bg-background/95 backdrop-blur-sm border shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                Performance Monitor
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {/* Route Performance */}
              <div>
                <h4 className="font-medium mb-1">Route Changes</h4>
                {metrics.routeChangeStart && metrics.routeChangeComplete ? (
                  <div className="flex justify-between">
                    <span>Last transition:</span>
                    <Badge variant="outline" className="text-xs">
                      {(metrics.routeChangeComplete - metrics.routeChangeStart).toFixed(0)}ms
                    </Badge>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No route changes yet</span>
                )}
              </div>

              {/* Component Performance */}
              <div>
                <h4 className="font-medium mb-1">Component Mounts</h4>
                {metrics.componentMountStart && metrics.componentMountComplete ? (
                  <div className="flex justify-between">
                    <span>Last mount:</span>
                    <Badge variant="outline" className="text-xs">
                      {(metrics.componentMountComplete - metrics.componentMountStart).toFixed(0)}ms
                    </Badge>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No mounts tracked</span>
                )}
              </div>

              {/* Data Fetching */}
              <div>
                <h4 className="font-medium mb-1">Data Fetching</h4>
                {metrics.dataFetchStart && metrics.dataFetchComplete ? (
                  <div className="flex justify-between">
                    <span>Last fetch:</span>
                    <Badge variant="outline" className="text-xs">
                      {(metrics.dataFetchComplete - metrics.dataFetchStart).toFixed(0)}ms
                    </Badge>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No fetches tracked</span>
                )}
              </div>

              {/* Web Vitals */}
              <div>
                <h4 className="font-medium mb-1">Web Vitals</h4>
                <div className="space-y-1">
                  {webVitals.fcp && (
                    <div className="flex justify-between">
                      <span>FCP:</span>
                      <Badge 
                        variant={webVitals.fcp < 1800 ? "default" : "destructive"} 
                        className="text-xs"
                      >
                        {webVitals.fcp.toFixed(0)}ms
                      </Badge>
                    </div>
                  )}
                  {webVitals.lcp && (
                    <div className="flex justify-between">
                      <span>LCP:</span>
                      <Badge 
                        variant={webVitals.lcp < 2500 ? "default" : "destructive"} 
                        className="text-xs"
                      >
                        {webVitals.lcp.toFixed(0)}ms
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <h4 className="font-medium mb-1">Memory</h4>
                {(performance as any).memory ? (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Used:</span>
                      <Badge variant="outline" className="text-xs">
                        {((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <Badge variant="outline" className="text-xs">
                        {((performance as any).memory.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not available</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}