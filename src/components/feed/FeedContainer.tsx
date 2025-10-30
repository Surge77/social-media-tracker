'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { FeedFilters, FilterContextType } from './types';
import FeedContext from './FeedContext';

interface FeedContainerProps {
  children: React.ReactNode;
  initialFilters?: FeedFilters;
}

const FeedContainer = ({ children, initialFilters = {} }: FeedContainerProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse URL parameters into FeedFilters
  const currentFilters = useMemo((): FeedFilters => {
    if (!searchParams) {
      return {
        sources: initialFilters.sources,
        window: initialFilters.window || '24h',
        sort: initialFilters.sort || 'trending',
        search: initialFilters.search,
        limit: initialFilters.limit || 20,
        page: initialFilters.page || 1,
      };
    }

    const sourcesParam = searchParams.get('sources');
    const windowParam = searchParams.get('window');
    const sortParam = searchParams.get('sort');
    const searchParam = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');

    return {
      sources: sourcesParam ? sourcesParam.split(',') : initialFilters.sources,
      window: windowParam || initialFilters.window || '24h',
      sort: sortParam || initialFilters.sort || 'trending',
      search: searchParam || initialFilters.search,
      limit: limitParam ? parseInt(limitParam, 10) : initialFilters.limit || 20,
      page: pageParam ? parseInt(pageParam, 10) : initialFilters.page || 1,
    };
  }, [searchParams, initialFilters]);

  // Update URL parameters when filters change
  const updateFilters = useCallback((newFilters: Partial<FeedFilters>) => {
    const updatedFilters = { ...currentFilters, ...newFilters };
    const params = new URLSearchParams();

    // Add parameters to URL if they have values
    if (updatedFilters.sources && updatedFilters.sources.length > 0) {
      params.set('sources', updatedFilters.sources.join(','));
    }
    
    if (updatedFilters.window && updatedFilters.window !== '24h') {
      params.set('window', updatedFilters.window);
    }
    
    if (updatedFilters.sort && updatedFilters.sort !== 'trending') {
      params.set('sort', updatedFilters.sort);
    }
    
    if (updatedFilters.search) {
      params.set('search', updatedFilters.search);
    }
    
    if (updatedFilters.limit && updatedFilters.limit !== 20) {
      params.set('limit', updatedFilters.limit.toString());
    }
    
    if (updatedFilters.page && updatedFilters.page !== 1) {
      params.set('page', updatedFilters.page.toString());
    }

    // Update URL without page reload
    const currentPath = pathname || '/dashboard/trending';
    const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;
    router.replace(newUrl, { scroll: false });
  }, [currentFilters, pathname, router]);

  // Helper functions for specific filter updates
  const updateSources = useCallback((sources: string[]) => {
    updateFilters({ sources, page: 1 }); // Reset to page 1 when changing sources
  }, [updateFilters]);

  const updateWindow = useCallback((window: string) => {
    updateFilters({ window, page: 1 }); // Reset to page 1 when changing time window
  }, [updateFilters]);

  const updateSort = useCallback((sort: string) => {
    updateFilters({ sort, page: 1 }); // Reset to page 1 when changing sort
  }, [updateFilters]);

  const updateSearch = useCallback((search: string) => {
    updateFilters({ search, page: 1 }); // Reset to page 1 when searching
  }, [updateFilters]);

  const updatePage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  // Reset all filters to defaults
  const resetFilters = useCallback(() => {
    const currentPath = pathname || '/dashboard/trending';
    router.replace(currentPath, { scroll: false });
  }, [pathname, router]);

  // Provide filter state and handlers to children
  const filterContext: FilterContextType = {
    filters: currentFilters,
    updateSources,
    updateWindow,
    updateSort,
    updateSearch,
    updatePage,
    resetFilters,
    updateFilters,
  };

  return (
    <FeedContext.Provider value={filterContext}>
      <div data-testid="feed-container">
        {children}
      </div>
    </FeedContext.Provider>
  );
};

export default FeedContainer;