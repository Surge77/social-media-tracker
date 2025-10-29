'use client';

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
const LazyInsightsSidebar = lazy(() => import('@/components/InsightsSidebar'));
const LazyFeedContainer = lazy(() => import('@/components/feed/FeedContainer'));
const LazyFeedFilters = lazy(() => import('@/components/feed/FeedFilters'));

// Loading fallbacks
const InsightsSidebarSkeleton = () => (
  <div className="w-72 border-l border-border bg-background/50 backdrop-blur-sm p-6 space-y-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="glass-card rounded-xl p-4 space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const FeedContainerSkeleton = () => (
  <div className="space-y-4">
    <div className="flex gap-2 mb-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="border rounded-lg p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    ))}
  </div>
);

const FeedFiltersSkeleton = () => (
  <div className="flex gap-2 mb-4">
    <Skeleton className="h-10 w-32" />
    <Skeleton className="h-10 w-24" />
    <Skeleton className="h-10 w-28" />
    <Skeleton className="h-10 w-36" />
  </div>
);

// Wrapped components with Suspense
export const InsightsSidebar = () => (
  <Suspense fallback={<InsightsSidebarSkeleton />}>
    <LazyInsightsSidebar />
  </Suspense>
);

export const FeedContainer = ({ children, ...props }: any) => (
  <Suspense fallback={<FeedContainerSkeleton />}>
    <LazyFeedContainer {...props}>
      {children}
    </LazyFeedContainer>
  </Suspense>
);

export const FeedFilters = (props: any) => (
  <Suspense fallback={<FeedFiltersSkeleton />}>
    <LazyFeedFilters {...props} />
  </Suspense>
);