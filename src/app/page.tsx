import Header from '@/components/Header';
import Hero from '@/components/Hero';
import BentoFeatures from '@/components/BentoFeatures';
import EnhancedCTA from '@/components/EnhancedCTA';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* Enhanced Features Section with Bento Grid */}
      <BentoFeatures />
      
      {/* Enhanced CTA Section */}
      <EnhancedCTA />
    </div>
  );
}
