import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sidebar from "@/components/Sidebar";
import FeedList from "@/components/feed/FeedList";
import InsightsSidebar from "@/components/InsightsSidebar";
import { FeedContainer } from "@/components/feed/index";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeedContainer>
        <div className="flex w-full">
          <Sidebar />
          <FeedList />
          <InsightsSidebar />
        </div>
      </FeedContainer>
    </div>
  );
};

export default Index;
