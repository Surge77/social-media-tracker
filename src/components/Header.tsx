'use client';

import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import AnimatedCTA from "./AnimatedCTA";
import { ThemeToggle } from "./ThemeToggle";
import { useScrolled } from "@/hooks/useScrolled";

const Header = () => {
  const isScrolled = useScrolled(8);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled
        ? "border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
        : "border-b border-transparent bg-transparent shadow-none backdrop-blur-0"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary transition-colors" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground transition-colors">DevTrends</h1>
            </div>
            <Badge variant="secondary" className="text-xs transition-colors">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <AnimatedCTA
              href="/technologies"
              size="sm"
              className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started →
            </AnimatedCTA>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
