'use client';

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrending } from '@/hooks/useTrending';

const InsightsSidebar = () => {
  // Fetch top 3 trending items
  const { data: topTrending, isLoading, refetch } = useTrending({
    window: '24h',
    sort: 'trending',
    limit: 3,
  });

  const topItems = topTrending?.items || [];

  return (
    <aside className="w-72 border-l border-border bg-background/50 backdrop-blur-sm p-6 space-y-6">
      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>🔥</span> Hot Sources Today
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground">1. GitHub</span>
              <span className="text-muted-foreground">234 (42%)</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '42%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground">2. NYT</span>
              <span className="text-muted-foreground">198 (35%)</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: '35%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground">3. ArsTech</span>
              <span className="text-muted-foreground">129 (23%)</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-warning rounded-full" style={{ width: '23%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>⚡</span> Fastest Rising (1h)
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">🚀 AI Model Release</p>
            <p className="text-xs text-success">+890 pts (230%)</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">🔬 Climate Study</p>
            <p className="text-xs text-success">+620 pts (180%)</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">💻 Framework Update</p>
            <p className="text-xs text-success">+450 pts (150%)</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>🏆</span> Top Today
        </h3>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-xs text-muted-foreground">Loading...</div>
          ) : topItems.length > 0 ? (
            topItems.map((item, index) => (
              <div key={item.id} className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {index + 1}. {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.score} pts · {item.source}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">No trending items</div>
          )}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>🌍</span> Global Stats
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active Items:</span>
            <span className="font-medium text-foreground">1,234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Update:</span>
            <span className="font-medium text-foreground">10:34 AM</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full mt-2 gap-2" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default InsightsSidebar;
