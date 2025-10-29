'use client';

import DashboardHeader from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import { FeedContainer } from "@/components/feed/index";
import { usePerformanceMonitor } from "@/lib/performance";
import { useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const performanceMonitor = usePerformanceMonitor();

  useEffect(() => {
    performanceMonitor.markComponentMountStart('DashboardLayout');
    
    return () => {
      performanceMonitor.markComponentMountComplete('DashboardLayout');
    };
  }, [performanceMonitor]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      {/* Dashboard Content */}
      <FeedContainer>
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </FeedContainer>
    </div>
  );
}