import HeaderNew from '@/components/landing/HeaderNew';
import HeroNew from '@/components/landing/HeroNew';
import BentoFeaturesNew from '@/components/landing/BentoFeaturesNew';
import StatsSection from '@/components/landing/StatsSection';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNew />
      <HeroNew />
      <BentoFeaturesNew />
      <StatsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
