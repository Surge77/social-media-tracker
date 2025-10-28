// Type definitions for feed functionality

export interface FeedFilters {
  sources?: string[];
  window?: string;
  sort?: string;
  search?: string;
  limit?: number;
  page?: number;
}

export interface FeedParams {
  sources?: string;    // "hn,reddit,rss"
  window?: string;     // "1h", "24h", "7d"
  sort?: string;       // "trending", "velocity", "popular"
  search?: string;     // search query
  limit?: number;      // items per page
  page?: number;       // pagination
}

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  score: number;
  comments: number;
  velocity: number;
  source: string;
  timeAgo: string;
  views: number;
  chips: string[];
  chipTypes: string[];
}

export interface FeedResponse {
  items: FeedItem[];
  total: number;
  hasMore: boolean;
  nextPage?: number;
}

export interface FilterContextType {
  filters: FeedFilters;
  updateSources: (sources: string[]) => void;
  updateWindow: (window: string) => void;
  updateSort: (sort: string) => void;
  updateSearch: (search: string) => void;
  updatePage: (page: number) => void;
  resetFilters: () => void;
  updateFilters: (filters: Partial<FeedFilters>) => void;
}