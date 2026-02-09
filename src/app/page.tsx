import HeaderNew from '@/components/landing/HeaderNew';
import HeroNew from '@/components/landing/HeroNew';
import DataSourcesBar from '@/components/landing/DataSourcesBar';
import BentoFeaturesNew from '@/components/landing/BentoFeaturesNew';
import LiveDataShowcase from '@/components/landing/LiveDataShowcase';
import ComparisonTable from '@/components/landing/ComparisonTable';
import StatsSection from '@/components/landing/StatsSection';
import FinalCTA from '@/components/landing/FinalCTA';
import FooterNew from '@/components/landing/FooterNew';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNew />
      <HeroNew />
      <DataSourcesBar />
      <BentoFeaturesNew />
      <LiveDataShowcase />
      <ComparisonTable />
      <StatsSection />
      <FinalCTA />
      <FooterNew />
    </div>
  );
}
