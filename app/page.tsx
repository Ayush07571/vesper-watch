import Navbar from '@/components/Navbar';
import AnimationSection from '@/components/AnimationSection';
import HeritageSection from '@/components/HeritageSection';
import CraftSection from '@/components/CraftSection';
import SpecsSection from '@/components/SpecsSection';
import QuoteSection from '@/components/QuoteSection';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import FeatureCarousel from '@/components/FeatureCarousel';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#080705]">
      <Navbar />
      
      <AnimationSection />
      
      <FeatureCarousel />
      
      <div className="relative z-10 bg-[#080705]">
        <div className="divider" />
        <HeritageSection />
        
        <div className="divider" />
        <CraftSection />
        
        <div className="divider" />
        <SpecsSection />
        
        <div className="divider" />
        <QuoteSection />
        
        <div className="divider" />
        <FinalCTA />
        
        <Footer />
      </div>
    </main>
  );
}
