'use client';

import { Home, TrendingUp, Flame, Radio, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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

      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Filters
        </h3>
        <Input
          type="text"
          placeholder="Filter topics..."
          className="h-9 bg-muted border-border"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Time Window
        </h3>
        <RadioGroup defaultValue="1h" className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="15m" id="15m" />
            <Label htmlFor="15m" className="text-sm cursor-pointer">15 minutes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1h" id="1h" />
            <Label htmlFor="1h" className="text-sm cursor-pointer">1 hour</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="24h" id="24h" />
            <Label htmlFor="24h" className="text-sm cursor-pointer">24 hours</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="7d" id="7d" />
            <Label htmlFor="7d" className="text-sm cursor-pointer">7 days</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Source
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="all" defaultChecked />
            <Label htmlFor="all" className="text-sm cursor-pointer">All Sources</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="hn" />
            <Label htmlFor="hn" className="text-sm cursor-pointer">Hacker News</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="rss" />
            <Label htmlFor="rss" className="text-sm cursor-pointer">RSS Feeds</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="reddit" />
            <Label htmlFor="reddit" className="text-sm cursor-pointer">Reddit</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="youtube" />
            <Label htmlFor="youtube" className="text-sm cursor-pointer">YouTube</Label>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
