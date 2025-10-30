import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoRefreshOptions {
  enabled: boolean;           // Enable/disable auto-refresh
  interval: number;           // Refresh interval in milliseconds
  onRefresh: () => void;      // Callback to trigger data refetch
}

interface UseAutoRefreshReturn {
  isRefreshing: boolean;      // Current refresh state
  lastRefreshTime: Date | null; // Last successful refresh
  pause: () => void;          // Pause auto-refresh
  resume: () => void;         // Resume auto-refresh
}

export function useAutoRefresh(options: UseAutoRefreshOptions): UseAutoRefreshReturn {
  const { enabled, interval, onRefresh } = options;
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  // Pause function
  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  // Resume function
  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Handle refresh execution
  const executeRefresh = useCallback(async () => {
    if (!enabled || isPaused || !isVisibleRef.current) {
      return;
    }

    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefreshTime(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [enabled, isPaused, onRefresh]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      
      // If page becomes visible and auto-refresh is enabled, trigger a refresh
      if (isVisibleRef.current && enabled && !isPaused) {
        executeRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isPaused, executeRefresh]);

  // Set up interval for auto-refresh
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only set up interval if enabled and not paused
    if (enabled && !isPaused) {
      intervalRef.current = setInterval(() => {
        executeRefresh();
      }, interval);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isPaused, interval, executeRefresh]);

  return {
    isRefreshing,
    lastRefreshTime,
    pause,
    resume,
  };
}
