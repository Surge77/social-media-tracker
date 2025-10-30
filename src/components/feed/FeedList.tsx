'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TimeWindowPills from "../TimeWindowPills";
import FeedItem from "../FeedItem";
import FeedSkeleton from './FeedSkeleton';
import FeedError from './FeedError';
import RefreshControls from './RefreshControls';
import { FeedResponse } from './types';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface FeedListProps {
  data?: FeedResponse;
  isLoading?: boolean;
  error?: Error | null;
  onLoadMore?: () => void;
  onRetry?: () => void;
  showTimeWindowPills?: boolean;
  isRetrying?: boolean;
  lastUpdated?: Date;
}

const FeedList = ({ 
  data, 
  isLoading = false, 
  error = null, 
  onLoadMore, 
  onRetry,
  showTimeWindowPills = true,
  isRetrying = false,
  lastUpdated
}: FeedListProps) => {
  const [retryCount, setRetryCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const handleRetry = () => {
    if (onRetry) {
      setRetryCount(prev => prev + 1);
      onRetry();
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-6 space-y-6">
        {showTimeWindowPills && (
          <div className="space-y-4">
            <TimeWindowPills />
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow"></span>
              <span>Loading feed...</span>
            </div>
          </div>
        )}

        <FeedSkeleton itemCount={6} showHeader={false} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-6 space-y-6">
        {showTimeWindowPills && (
          <div className="space-y-4">
            <TimeWindowPills />
          </div>
        )}
        
        <div className="py-8">
          <FeedError 
            error={error} 
            onRetry={handleRetry}
            isRetrying={isRetrying}
            retryCount={retryCount}
          />
        </div>
      </main>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <main className="flex-1 p-6 space-y-6">
        {showTimeWindowPills && (
          <div className="space-y-4">
            <TimeWindowPills />
          </div>
        )}
        
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-muted-foreground">No items found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Refresh controls - only shown when not loading and no error */}
      <RefreshControls
        isRefetching={isRetrying}
        onRefresh={onRetry || (() => {})}
        totalItems={data?.total}
        lastUpdated={lastUpdated}
      />

      {showTimeWindowPills && (
        <div className="space-y-4">
          <TimeWindowPills />
        </div>
      )}

      <motion.div 
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={prefersReducedMotion ? {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.2 } }
        } : {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2
            }
          }
        }}
      >
        {data.items.map((item) => (
          <motion.div
            key={item.id}
            variants={prefersReducedMotion ? {
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.2 } }
            } : {
              hidden: { 
                opacity: 0, 
                y: 20,
                scale: 0.95
              },
              visible: { 
                opacity: 1, 
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }
            }}
            whileHover={prefersReducedMotion ? {} : { 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          >
            <FeedItem {...item} />
          </motion.div>
        ))}
      </motion.div>

      {data.hasMore && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={onLoadMore}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Load More ({data.total - data.items.length} remaining) ↓
          </button>
        </div>
      )}
    </main>
  );
};

export default FeedList;