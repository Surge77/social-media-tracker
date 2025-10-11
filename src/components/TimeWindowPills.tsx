'use client';

import { Button } from "@/components/ui/button";

const TimeWindowPills = () => {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-full">
          15m
        </Button>
        <Button variant="default" size="sm" className="rounded-full bg-primary hover:bg-primary/90">
          1h
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          24h
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          7d
        </Button>
      </div>

      <div className="h-4 w-px bg-border"></div>

      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" className="rounded-full bg-primary hover:bg-primary/90">
          All
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          HN
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          RSS
        </Button>
        <Button variant="outline" size="sm" className="rounded-full">
          Reddit
        </Button>
      </div>
    </div>
  );
};

export default TimeWindowPills;
