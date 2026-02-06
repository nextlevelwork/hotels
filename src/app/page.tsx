import HeroSection from '@/components/home/HeroSection';
import PopularDestinations from '@/components/home/PopularDestinations';
import ThemedCollections from '@/components/home/ThemedCollections';
import HowItWorks from '@/components/home/HowItWorks';
import TrustBadges from '@/components/home/TrustBadges';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularDestinations />
      <ThemedCollections />
      <HowItWorks />
      <TrustBadges />
    </>
  );
}
