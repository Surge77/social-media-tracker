'use client';

import { useState, useEffect } from 'react';
import { InsightsSidebar, FeedContainer } from "@/components/LazyComponents";
import { useTrending } from '@/hooks/useTrending';
import { useFeedContext } from '@/components/feed/FeedContext';
import FeedList from '@/components/feed/FeedList';
import FeedSearch from '@/components/feed/FeedSearch';

function TrendingContent() {
  const { filters } = useFeedContext();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Convert FeedFilters to FeedParams for the API
  const params = {
    sources: filters.sources?.join(','),
    window: filters.window,
    sort: filters.sort,
    search: filters.search,
    limit: filters.limit,
    page: filters.page,
  };

  const { data, isLoading, error, isError, refetch, isRefetching, dataUpdatedAt } = useTrending(params);

  // Update last updated timestamp when data changes
  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  const handleRetry = () => {
    refetch();
  };

  const handleLoadMore = () => {
    // This would be implemented for pagination
    console.log('Load more requested');
  };

  return (
    <>
      <div className="mb-6">
        <FeedSearch />
      </div>
      <FeedList
        data={data}
        isLoading={isLoading}
        error={isError ? error : null}
        onRetry={handleRetry}
        onLoadMore={data?.hasMore ? handleLoadMore : undefined}
        isRetrying={isRefetching}
        showTimeWindowPills={true}
        lastUpdated={lastUpdated}
      />
    </>
  );
}

export default function TrendingPage() {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Trending Now</h2>
            <p className="text-muted-foreground">
              Discover what&apos;s trending across the web in real-time
            </p>
          </div>
          <FeedContainer>
            <TrendingContent />
          </FeedContainer>
        </div>
      </div>
      <div className="w-80 border-l border-border">
        <InsightsSidebar />
      </div>
    </div>
  );
}