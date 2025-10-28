'use client';

import { Skeleton } from "@/components/ui/skeleton";

interface FeedItemSkeletonProps {
  index?: number;
}

const FeedItemSkeleton = ({ index = 0 }: FeedItemSkeletonProps) => {
  return (
    <div 
      className="border border-border rounded-lg p-6 bg-card animate-fade-in"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animationDuration: '0.6s',
        animationFillMode: 'both'
      }}
    >
      {/* Header with title and source */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full ml-4 flex-shrink-0" />
      </div>
      
      {/* Metrics row */}
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-18" />
      </div>

      {/* Chips/tags */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-18 rounded-full" />
      </div>
    </div>
  );
};

export default FeedItemSkeleton;