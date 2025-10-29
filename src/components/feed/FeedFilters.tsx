'use client';


import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useFeedContext } from './FeedContext';

const FeedFilters = () => {
  const { filters, updateSources, updateWindow, updateSort, resetFilters } = useFeedContext();

  // Handle source selection
  const handleSourceChange = (sourceId: string, checked: boolean) => {
    const currentSources = filters.sources || [];
    
    if (sourceId === 'all') {
      // If "All Sources" is checked, clear all specific sources
      updateSources(checked ? [] : []);
      return;
    }

    let newSources: string[];
    if (checked) {
      // Add source if not already present
      newSources = currentSources.includes(sourceId) 
        ? currentSources 
        : [...currentSources, sourceId];
    } else {
      // Remove source
      newSources = currentSources.filter(source => source !== sourceId);
    }
    
    updateSources(newSources);
  };

  // Check if a source is selected
  const isSourceSelected = (sourceId: string) => {
    if (sourceId === 'all') {
      return !filters.sources || filters.sources.length === 0;
    }
    return filters.sources?.includes(sourceId) || false;
  };



  return (
    <div className="space-y-6">

      {/* Time Window Filter */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Time Window
        </h3>
        <RadioGroup 
          value={filters.window || '1h'} 
          onValueChange={updateWindow}
          className="space-y-2"
        >
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

      {/* Sort Filter */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sort By
        </h3>
        <RadioGroup 
          value={filters.sort || 'trending'} 
          onValueChange={updateSort}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="trending" id="trending" />
            <Label htmlFor="trending" className="text-sm cursor-pointer">Trending</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="velocity" id="velocity" />
            <Label htmlFor="velocity" className="text-sm cursor-pointer">Velocity</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="popular" id="popular" />
            <Label htmlFor="popular" className="text-sm cursor-pointer">Popular</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Source Filter */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sources
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="all" 
              checked={isSourceSelected('all')}
              onCheckedChange={(checked) => handleSourceChange('all', checked as boolean)}
            />
            <Label htmlFor="all" className="text-sm cursor-pointer">All Sources</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hn" 
              checked={isSourceSelected('hn')}
              onCheckedChange={(checked) => handleSourceChange('hn', checked as boolean)}
            />
            <Label htmlFor="hn" className="text-sm cursor-pointer">Hacker News</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="rss" 
              checked={isSourceSelected('rss')}
              onCheckedChange={(checked) => handleSourceChange('rss', checked as boolean)}
            />
            <Label htmlFor="rss" className="text-sm cursor-pointer">RSS Feeds</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="reddit" 
              checked={isSourceSelected('reddit')}
              onCheckedChange={(checked) => handleSourceChange('reddit', checked as boolean)}
            />
            <Label htmlFor="reddit" className="text-sm cursor-pointer">Reddit</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="youtube" 
              checked={isSourceSelected('youtube')}
              onCheckedChange={(checked) => handleSourceChange('youtube', checked as boolean)}
            />
            <Label htmlFor="youtube" className="text-sm cursor-pointer">YouTube</Label>
          </div>
        </div>
      </div>

      {/* Reset Filters */}
      <div className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetFilters}
          className="w-full text-xs"
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
};

export default FeedFilters;