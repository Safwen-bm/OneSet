import { CategoryGrid } from '@/components/home/category-grid';
import { FeaturedRail } from '@/components/home/featured-rail';
import { Hero } from '@/components/home/hero';
import { ServiceNotes } from '@/components/home/service-notes';
import { SetupsRail } from '@/components/home/setups-rail';
import { RecentlyViewedRail } from '@/components/shop/recently-viewed-rail';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <SetupsRail />
      <FeaturedRail />
      <RecentlyViewedRail />
      <ServiceNotes />
    </>
  );
}