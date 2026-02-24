import dynamic from 'next/dynamic';
import HeaderNew from '@/components/landing/HeaderNew';
import HeroNew from '@/components/landing/HeroNew';

const DataSourcesMarquee = dynamic(() => import('@/components/landing/DataSourcesMarquee'), { ssr: true });
const BentoFeaturesNew   = dynamic(() => import('@/components/landing/BentoFeaturesNew'),   { ssr: true });
const TechCloudSection   = dynamic(() => import('@/components/landing/TechCloudSection'),   { ssr: true });
const LandingFAQ         = dynamic(() => import('@/components/landing/LandingFAQ'),         { ssr: true });
const FinalCTA           = dynamic(() => import('@/components/landing/FinalCTA'),           { ssr: true });
const Footer             = dynamic(() => import('@/components/Footer'),                     { ssr: true });

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNew />
      <HeroNew />
      <DataSourcesMarquee />
      <BentoFeaturesNew />
      <TechCloudSection />
      <LandingFAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
