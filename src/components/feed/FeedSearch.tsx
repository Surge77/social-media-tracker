'use client';

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFeedContext } from './FeedContext';
import { useState, useEffect } from 'react';

const FeedSearch = () => {
  const { filters, updateSearch } = useFeedContext();
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Update local search input when filters change (e.g., from URL)
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.search) {
        updateSearch(searchInput);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.search, updateSearch]);

  // Clear search
  const clearSearch = () => {
    setSearchInput('');
    updateSearch('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search topics..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="h-10 bg-background border-border pl-9 pr-9"
      />
      {searchInput && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted-foreground/10"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default FeedSearch;