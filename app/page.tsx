import { serverGet } from '@/lib/api';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Transparency } from '@/components/home/Transparency';
import { FeaturedRestaurant } from '@/components/home/FeaturedRestaurant';
import { PartnerNgo } from '@/components/home/PartnerNgo';
import { ClosingCta } from '@/components/home/ClosingCta';
import type { Restaurant, Ngo } from '@/lib/types';

export default async function HomePage() {
  const [restaurantData, ngoData] = await Promise.all([
    serverGet<{ restaurants: Restaurant[] }>('/restaurants'),
    serverGet<{ ngos: Ngo[] }>('/ngos'),
  ]);

  const restaurants = restaurantData?.restaurants ?? [];
  const featured = restaurants[0];
  const ngo = ngoData?.ngos?.[0];

  const foodValuePaise = restaurants.reduce(
    (sum, r) => sum + (r.stats?.totalFoodValuePaise ?? 0),
    0
  );
  const portions = restaurants.reduce((sum, r) => sum + (r.stats?.totalPortions ?? 0), 0);

  return (
    <>
      <SiteHeader transparent />
      <main>
        <Hero foodValuePaise={foodValuePaise} portions={portions} />
        <HowItWorks />
        <Transparency />
        {featured && <FeaturedRestaurant restaurant={featured} />}
        {ngo && <PartnerNgo ngo={ngo} />}
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
