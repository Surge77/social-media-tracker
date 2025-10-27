'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Public Trending</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              BETA
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#trending" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Trending
            </a>
            <a href="#popular" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Popular
            </a>
            <a href="#sources" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sources
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Get Started →
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
