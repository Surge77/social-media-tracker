'use client';

import { Home, TrendingUp, Flame, Radio, Info } from "lucide-react";
import FeedFilters from "@/components/feed/FeedFilters";

const Sidebar = () => {
  return (
    <aside className="w-60 border-r border-border bg-background/50 backdrop-blur-sm p-6 space-y-8">
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Navigation
        </h3>
        <nav className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Home className="h-4 w-4" />
            Home
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary">
            <TrendingUp className="h-4 w-4" />
            Trending
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Flame className="h-4 w-4" />
            Popular
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Radio className="h-4 w-4" />
            Sources
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            <Info className="h-4 w-4" />
            About
          </a>
        </nav>
      </div>

      {/* Feed Filters Component */}
      <FeedFilters />
    </aside>
  );
};

export default Sidebar;
