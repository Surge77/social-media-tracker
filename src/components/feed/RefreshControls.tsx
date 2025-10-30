'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils/time';

interface RefreshControlsProps {
  isRefetching: boolean;
  onRefresh: () => void;
  totalItems?: number;
  lastUpdated?: Date;
  disabled?: boolean;
}

const RefreshControls = ({
  isRefetching,
  onRefresh,
  totalItems,
  lastUpdated,
  disabled = false,
}: RefreshControlsProps) => {
  const isButtonDisabled = disabled || isRefetching;

  return (
    <div className="flex items-center justify-between mb-4 p-3 rounded-lg border border-border bg-card">
      {/* Left: Status indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={`h-2 w-2 rounded-full ${
            isRefetching
              ? 'bg-primary animate-pulse-glow'
              : 'bg-success animate-pulse-glow'
          }`}
          aria-hidden="true"
        />
        <span role="status" aria-live="polite" aria-atomic="true">
          {isRefetching ? (
            'Updating feed...'
          ) : (
            <>
              Live feed
              {totalItems !== undefined && ` • ${totalItems} items`}
              {lastUpdated && ` • Updated ${formatRelativeTime(lastUpdated)}`}
            </>
          )}
        </span>
      </div>

      {/* Right: Refresh button */}
      <Button
        onClick={onRefresh}
        disabled={isButtonDisabled}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        aria-label="Refresh feed"
        aria-busy={isRefetching}
      >
        <RefreshCw
          className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        <span>{isRefetching ? 'Refreshing...' : 'Refresh'}</span>
      </Button>
    </div>
  );
};

export default RefreshControls;
