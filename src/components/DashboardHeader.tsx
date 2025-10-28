'use client';

import { TrendingUp, Menu, X, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import SharedTitle from "./SharedTitle";

interface NavigationItem {
  href: string;
  label: string;
  ariaLabel?: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard/trending",
    label: "Trending",
    ariaLabel: "View trending content"
  },
  {
    href: "/dashboard/popular",
    label: "Popular",
    ariaLabel: "View popular content"
  },
  {
    href: "/dashboard/sources",
    label: "Sources",
    ariaLabel: "Manage content sources"
  },
  {
    href: "/dashboard/about",
    label: "About",
    ariaLabel: "Learn about Public Trending"
  }
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActiveRoute = (href: string) => {
    return pathname === href;
  };

  const NavigationLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigationItems.map((item) => {
        const isActive = isActiveRoute(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-2 py-1
              ${mobile ? 'block py-3 px-4 border-b border-border last:border-b-0' : ''}
              ${isActive 
                ? 'text-primary bg-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }
            `}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.ariaLabel}
            onClick={() => mobile && setIsMobileMenuOpen(false)}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg"
      role="banner"
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/trending" 
              className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
              aria-label="Public Trending home"
            >
              <SharedTitle variant="header" />
            </Link>
            <Badge variant="secondary" className="text-xs" aria-label="Beta version">
              BETA
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <nav 
            className="hidden md:flex items-center gap-2" 
            role="navigation"
            aria-label="Main navigation"
          >
            <NavigationLinks />
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              size="sm" 
              variant="outline"
              aria-label="Open settings"
            >
              <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
              Settings
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  aria-label="Open navigation menu"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-navigation"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[280px] sm:w-[350px]"
                id="mobile-navigation"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center gap-2 pb-4 border-b border-border">
                    <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="font-semibold text-foreground">Public Trending</span>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      BETA
                    </Badge>
                  </div>

                  {/* Mobile Navigation */}
                  <nav 
                    className="flex-1 py-4"
                    role="navigation"
                    aria-label="Mobile navigation"
                  >
                    <div className="space-y-1">
                      <NavigationLinks mobile />
                    </div>
                  </nav>

                  {/* Mobile Actions */}
                  <div className="pt-4 border-t border-border">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start"
                      aria-label="Open settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                      Settings
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}