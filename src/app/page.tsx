import dynamic from 'next/dynamic';
import HeaderNew from '@/components/landing/HeaderNew';
import HeroNew from '@/components/landing/HeroNew';

// Lazy-load below-the-fold sections — reduces initial JS parse/execute cost
const BentoFeaturesNew = dynamic(() => import('@/components/landing/BentoFeaturesNew'), { ssr: true });
const StatsSection = dynamic(() => import('@/components/landing/StatsSection'), { ssr: true });
const FinalCTA = dynamic(() => import('@/components/landing/FinalCTA'), { ssr: true });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: true });

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
