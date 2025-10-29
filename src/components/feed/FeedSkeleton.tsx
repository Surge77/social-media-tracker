'use client';

import FeedItemSkeleton from './FeedItemSkeleton';
import { Skeleton } from "@/components/ui/skeleton";

interface FeedSkeletonProps {
  itemCount?: number;
  showHeader?: boolean;
}

const FeedSkeleton = ({ itemCount = 6, showHeader = true }: FeedSkeletonProps) => {
  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="space-y-4">
          {/* Time window pills skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-12 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-14 rounded-full" />
            <Skeleton className="h-8 w-12 rounded-full" />
          </div>
          
          {/* Status indicator skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      )}

      {/* Feed items skeleton with staggered animation */}
      <div className="space-y-4">
        {Array.from({ length: itemCount }).map((_, index) => (
          <FeedItemSkeleton key={index} index={index} />
        ))}
      </div>
    </div>
  );
};

export default FeedSkeleton;