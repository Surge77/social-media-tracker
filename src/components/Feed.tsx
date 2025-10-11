'use client';

import TimeWindowPills from "./TimeWindowPills";
import FeedItem from "./FeedItem";

const mockItems = [
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
];

const Feed = () => {
  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="space-y-4">
        <TimeWindowPills />
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow"></span>
          <span>Live feed • Updated 30 seconds ago</span>
        </div>
      </div>

      <div className="space-y-4">
        {mockItems.map((item, index) => (
          <div
            key={item.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <FeedItem {...item} />
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          Load More ↓
        </button>
      </div>
    </main>
  );
};

export default Feed;
