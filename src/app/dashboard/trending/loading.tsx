import { Skeleton } from "@/components/ui/skeleton";
import FeedSkeleton from "@/components/feed/FeedSkeleton";

export default function TrendingLoading() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Enhanced feed skeleton with staggered animations */}
          <FeedSkeleton itemCount={6} showHeader={true} />
        </div>
      </div>
      
      {/* Insights sidebar skeleton */}
      <div className="w-80 border-l border-border p-6">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 animate-fade-in"
                  style={{ animationDelay: `${(i + 6) * 100}ms` }}
                >
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="h-4 w-full animate-fade-in" 
                  style={{ animationDelay: `${(i + 10) * 100}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}