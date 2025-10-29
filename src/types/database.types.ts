// TypeScript types generated from Supabase database schema
// This file contains all database table types and utility types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: number
          source: 'hn' | 'rss' | 'newsapi'
          external_id: string | null
          title: string
          url: string
          excerpt: string | null
          author: string | null
          score: number
          comment_count: number
          published_at: string
          created_at: string
          updated_at: string
          raw_data: Json | null
          search_vector: unknown | null
        }
        Insert: {
          id?: number
          source: 'hn' | 'rss' | 'newsapi'
          external_id?: string | null
          title: string
          url: string
          excerpt?: string | null
          author?: string | null
          score?: number
          comment_count?: number
          published_at: string
          created_at?: string
          updated_at?: string
          raw_data?: Json | null
          search_vector?: unknown | null
        }
        Update: {
          id?: number
          source?: 'hn' | 'rss' | 'newsapi'
          external_id?: string | null
          title?: string
          url?: string
          excerpt?: string | null
          author?: string | null
          score?: number
          comment_count?: number
          published_at?: string
          created_at?: string
          updated_at?: string
          raw_data?: Json | null
          search_vector?: unknown | null
        }
        Relationships: []
      }

      content_popularity: {
        Row: {
          id: number
          item_id: number
          source: 'hn' | 'rss' | 'newsapi'
          engagement_count: number
          share_count: number
          comment_count: number
          view_count: number
          popularity_score: number
          trending_velocity: number
          peak_engagement_time: string | null
          last_engagement_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          item_id: number
          source: 'hn' | 'rss' | 'newsapi'
          engagement_count?: number
          share_count?: number
          comment_count?: number
          view_count?: number
          popularity_score?: number
          trending_velocity?: number
          peak_engagement_time?: string | null
          last_engagement_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          item_id?: number
          source?: 'hn' | 'rss' | 'newsapi'
          engagement_count?: number
          share_count?: number
          comment_count?: number
          view_count?: number
          popularity_score?: number
          trending_velocity?: number
          peak_engagement_time?: string | null
          last_engagement_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_popularity_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }

      trending_metrics: {
        Row: {
          id: number
          item_id: number
          window: '15m' | '1h' | '6h' | '24h' | '7d' | '30d'
          trending_score: number
          velocity: number | null
          peak_time: string | null
          category: string | null
          algorithm_version: string
          trend_type: 'rising' | 'hot' | 'viral' | 'sustained'
          confidence_score: number
          decay_factor: number
          source_weight: number
          created_at: string
        }
        Insert: {
          id?: number
          item_id: number
          window: '15m' | '1h' | '6h' | '24h' | '7d' | '30d'
          trending_score: number
          velocity?: number | null
          peak_time?: string | null
          category?: string | null
          algorithm_version?: string
          trend_type?: 'rising' | 'hot' | 'viral' | 'sustained'
          confidence_score?: number
          decay_factor?: number
          source_weight?: number
          created_at?: string
        }
        Update: {
          id?: number
          item_id?: number
          window?: '15m' | '1h' | '6h' | '24h' | '7d' | '30d'
          trending_score?: number
          velocity?: number | null
          peak_time?: string | null
          category?: string | null
          algorithm_version?: string
          trend_type?: 'rising' | 'hot' | 'viral' | 'sustained'
          confidence_score?: number
          decay_factor?: number
          source_weight?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trending_metrics_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      upsert_item: {
        Args: {
          p_source: string
          p_external_id?: string
          p_title: string
          p_url: string
          p_excerpt?: string | null
          p_author?: string | null
          p_score?: number
          p_comment_count?: number
          p_published_at?: string
          p_raw?: Json | null
        }
        Returns: number
      }
      calculate_trending_score: {
        Args: {
          p_score: number
          p_comment_count: number
          p_published_at: string
          p_window?: string
          p_source?: string
          p_algorithm_version?: string
        }
        Returns: number
      }
      update_trending_metrics: {
        Args: {
          p_window?: string
          p_limit?: number
          p_source?: string | null
          p_algorithm_version?: string
        }
        Returns: number
      }
      search_items: {
        Args: {
          p_query: string
          p_source?: string | null
          p_limit?: number
          p_offset?: number
          p_include_popularity?: boolean
        }
        Returns: {
          id: number
          source: string
          title: string
          url: string
          excerpt: string | null
          author: string | null
          score: number
          comment_count: number
          published_at: string
          rank: number
          popularity_score: number | null
          trending_velocity: number | null
        }[]
      }
      get_trending_items: {
        Args: {
          p_window?: string
          p_limit?: number
          p_offset?: number
          p_source?: string | null
          p_trend_type?: string | null
          p_algorithm_version?: string
        }
        Returns: {
          id: number
          source: string
          title: string
          url: string
          excerpt: string | null
          author: string | null
          score: number
          comment_count: number
          published_at: string
          trending_score: number
          velocity: number | null
          trend_type: string
          confidence_score: number
          popularity_score: number | null
        }[]
      }
      get_popular_content: {
        Args: {
          p_source?: string | null
          p_limit?: number
          p_offset?: number
          p_min_score?: number
        }
        Returns: {
          id: number
          source: string
          title: string
          url: string
          excerpt: string | null
          author: string | null
          score: number
          comment_count: number
          published_at: string
          popularity_score: number
          trending_velocity: number
          peak_engagement_time: string | null
        }[]
      }
      calculate_popularity_score: {
        Args: {
          p_engagement_count?: number
          p_share_count?: number
          p_comment_count?: number
          p_view_count?: number
          p_source?: string
        }
        Returns: number
      }
      upsert_content_popularity: {
        Args: {
          p_item_id: number
          p_source: string
          p_engagement_count?: number
          p_share_count?: number
          p_comment_count?: number
          p_view_count?: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for easier usage
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// Application-specific type aliases for easier usage
export type Item = Tables<'items'>
export type ItemInsert = TablesInsert<'items'>
export type ItemUpdate = TablesUpdate<'items'>

export type ContentPopularity = Tables<'content_popularity'>
export type ContentPopularityInsert = TablesInsert<'content_popularity'>
export type ContentPopularityUpdate = TablesUpdate<'content_popularity'>

export type TrendingMetric = Tables<'trending_metrics'>
export type TrendingMetricInsert = TablesInsert<'trending_metrics'>
export type TrendingMetricUpdate = TablesUpdate<'trending_metrics'>

// Extended types with relationships
export type ItemWithTrending = Item & {
  trending_metrics?: TrendingMetric[]
  content_popularity?: ContentPopularity
}

export type ItemWithPopularity = Item & {
  content_popularity: ContentPopularity
}

// Function return types
export type SearchResult = Database['public']['Functions']['search_items']['Returns'][0]
export type TrendingResult = Database['public']['Functions']['get_trending_items']['Returns'][0]
export type PopularContentResult = Database['public']['Functions']['get_popular_content']['Returns'][0]

// Source type for content sources (updated for new sources)
export type ContentSource = Item['source']

// Window type for trending calculations (updated for new windows)
export type TrendingWindow = TrendingMetric['window']

// Trend type for categorizing trending content
export type TrendType = TrendingMetric['trend_type']

// Algorithm version for trending calculations
export type AlgorithmVersion = TrendingMetric['algorithm_version']

// Trending algorithm types
export interface TrendingAlgorithmConfig {
  version: AlgorithmVersion
  sourceWeights: Record<ContentSource, number>
  timeDecayFactors: Record<TrendingWindow, number>
  engagementWeights: {
    score: number
    comments: number
    shares: number
    views: number
  }
}

// Popularity metrics interface
export interface PopularityMetrics {
  score: number
  velocity: number
  confidence: number
  trendType: TrendType
  peakTime?: string
  sourceWeight: number
}

// Content discovery filters
export interface ContentFilters {
  sources?: ContentSource[]
  trendTypes?: TrendType[]
  timeWindow?: TrendingWindow
  minScore?: number
  minConfidence?: number
  dateRange?: {
    start: string
    end: string
  }
}

// API interfaces for new trending data
export interface TrendingApiResponse {
  items: TrendingResult[]
  pagination: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
  filters: ContentFilters
  algorithm: {
    version: AlgorithmVersion
    lastUpdated: string
  }
}

export interface PopularContentApiResponse {
  items: PopularContentResult[]
  pagination: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
  metrics: {
    averageScore: number
    totalEngagement: number
    sourceBreakdown: Record<ContentSource, number>
  }
}