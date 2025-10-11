'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Sidebar from '@/components/Sidebar';
import Feed from '@/components/Feed';
import InsightsSidebar from '@/components/InsightsSidebar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <div className="flex w-full">
        <Sidebar />
        <Feed />
        <InsightsSidebar />
      </div>
    </div>
  );
}
