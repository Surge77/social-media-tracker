import { FeedParams, FeedResponse, FeedItem } from '@/components/feed/types';

// Mock data for development - this would be replaced with actual API calls
const mockItems: FeedItem[] = [
  {
    id: "1",
    title: "Breakthrough in Quantum Computing Achieves 1000-Qubit Milestone",
    summary: "Researchers demonstrate unprecedented quantum coherence in new superconducting processor.",
    score: 845,
    comments: 234,
    velocity: 420,
    source: "techcrunch.com",
    timeAgo: "2h 34m ago",
    views: 12500,
    chips: ["High 1h velocity", "Fresh"],
    chipTypes: ["velocity", "freshness"],
  },
  {
    id: "2",
    title: "New AI Model Outperforms GPT-4 on Reasoning Tasks",
    summary: "Open-source model achieves state-of-the-art results on mathematical and logical reasoning benchmarks.",
    score: 1290,
    comments: 456,
    velocity: 890,
    source: "arxiv.org",
    timeAgo: "45m ago",
    views: 23400,
    chips: ["Breakout! +500% spike", "High comment rate"],
    chipTypes: ["breakout", "engagement"],
  },
  {
    id: "3",
    title: "GitHub Copilot Workspace: AI-Native Development Environment",
    summary: "New IDE integrates AI-powered code generation, testing, and debugging in a unified workspace.",
    score: 567,
    comments: 123,
    velocity: 210,
    source: "github.blog",
    timeAgo: "1h 20m ago",
    views: 8900,
    chips: ["Appears in 3 sources", "Fresh"],
    chipTypes: ["multi-source", "freshness"],
  },
  {
    id: "4",
    title: "SpaceX Starship Completes First Orbital Refueling Test",
    summary: "Critical milestone achieved for Mars mission architecture with successful fuel transfer.",
    score: 2340,
    comments: 789,
    velocity: 320,
    source: "spacex.com",
    timeAgo: "4h 15m ago",
    views: 45600,
    chips: ["High 1h velocity", "High comment rate"],
    chipTypes: ["velocity", "engagement"],
  },
  {
    id: "5",
    title: "Rust 2.0 RFC Proposes Major Language Improvements",
    summary: "Community discusses new features including async traits, generic const expressions, and more.",
    score: 432,
    comments: 198,
    velocity: 180,
    source: "rust-lang.org",
    timeAgo: "3h 50m ago",
    views: 6700,
    chips: ["Fresh", "High comment rate"],
    chipTypes: ["freshness", "engagement"],
  },
  {
    id: "6",
    title: "Meta Releases Open Source VR Development Framework",
    summary: "New toolkit enables cross-platform VR app development with simplified APIs and better performance.",
    score: 678,
    comments: 145,
    velocity: 290,
    source: "meta.com",
    timeAgo: "5h 12m ago",
    views: 11200,
    chips: ["High 1h velocity", "Appears in 2 sources"],
    chipTypes: ["velocity", "multi-source"],
  },
  {
    id: "7",
    title: "Apple Vision Pro Gets Major Software Update",
    summary: "New features include improved hand tracking, better app multitasking, and enhanced spatial computing.",
    score: 1150,
    comments: 267,
    velocity: 450,
    source: "apple.com",
    timeAgo: "6h 30m ago",
    views: 18900,
    chips: ["Breakout! +300% spike", "High comment rate"],
    chipTypes: ["breakout", "engagement"],
  },
  {
    id: "8",
    title: "Tesla FSD Beta Achieves 99.9% Safety Rating",
    summary: "Latest autonomous driving software shows significant improvements in complex urban scenarios.",
    score: 892,
    comments: 334,
    velocity: 380,
    source: "tesla.com",
    timeAgo: "7h 45m ago",
    views: 15600,
    chips: ["High 1h velocity", "High comment rate"],
    chipTypes: ["velocity", "engagement"],
  },
];

// API Error interface for proper error handling
export interface APIError extends Error {
  status?: number;
  code?: string;
}

// Mock API function - this would be replaced with actual API calls
export const fetchTrending = async (params: FeedParams): Promise<FeedResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
  
  // Simulate occasional errors for testing error handling (5% chance)
  if (Math.random() < 0.05) {
    const error = new Error('Network error') as APIError;
    error.status = 500;
    error.code = 'NETWORK_ERROR';
    throw error;
  }
  
  // Filter and sort mock data based on parameters
  let filteredItems = [...mockItems];
  
  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredItems = filteredItems.filter(item => 
      item.title.toLowerCase().includes(searchLower) ||
      item.summary.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply source filter
  if (params.sources) {
    const sources = params.sources.split(',');
    filteredItems = filteredItems.filter(item => 
      sources.some(source => item.source.includes(source))
    );
  }
  
  // Apply sorting
  switch (params.sort) {
    case 'velocity':
      filteredItems.sort((a, b) => b.velocity - a.velocity);
      break;
    case 'popular':
      filteredItems.sort((a, b) => b.score - a.score);
      break;
    case 'trending':
    default:
      // Default trending sort (combination of score and velocity)
      filteredItems.sort((a, b) => (b.score + b.velocity) - (a.score + a.velocity));
      break;
  }
  
  // Apply pagination
  const limit = params.limit || 20;
  const page = params.page || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    total: filteredItems.length,
    hasMore: endIndex < filteredItems.length,
    nextPage: endIndex < filteredItems.length ? page + 1 : undefined,
  };
};

// Error handling function
export const handleTrendingError = (error: APIError) => {
  if (error.status === 429) {
    // Rate limiting - retry after 1 minute
    return { retry: true, delay: 60000 };
  }
  if (error.status && error.status >= 500) {
    // Server errors - retry after 5 seconds
    return { retry: true, delay: 5000 };
  }
  // Client errors - don't retry
  return { retry: false };
};