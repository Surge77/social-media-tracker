import Header from '@/components/Header';
import Hero from '@/components/Hero';
import BentoFeatures from '@/components/BentoFeatures';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      
      {/* Enhanced Features Section with Bento Grid */}
      <BentoFeatures />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
