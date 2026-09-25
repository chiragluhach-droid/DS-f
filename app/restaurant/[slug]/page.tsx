import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { serverGet } from '@/lib/api';
import { RestaurantView } from '@/components/donate/RestaurantView';
import type { MenuItem, Restaurant, Ngo } from '@/lib/types';

interface RecentDonation {
  donationId: string;
  totalPortions: number;
  totalFoodValuePaise: number;
  createdAt: string;
  donorSnapshot: { name: string; isAnonymous: boolean; message?: string };
}

interface PageData {
  restaurant: Restaurant;
  items: MenuItem[];
  partners: Ngo[];
  activeBatches: {
    batchId: string;
    menuItem: string;
    targetQuantity: number;
    collectedQuantity: number;
  }[];
  recentDonations: RecentDonation[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await serverGet<PageData>(`/restaurants/${slug}`);
  if (!data) return { title: 'Restaurant not found' };
  return {
    title: `Donate a meal at ${data.restaurant.name}`,
    description: data.restaurant.tagline ?? data.restaurant.description?.slice(0, 160),
    openGraph: { images: data.restaurant.coverImage ? [data.restaurant.coverImage] : [] },
  };
}

export default async function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await serverGet<PageData>(`/restaurants/${slug}`);
  if (!data) notFound();

  return (
    <RestaurantView
      restaurant={data.restaurant}
      items={data.items}
      partners={data.partners ?? []}
      activeBatches={data.activeBatches ?? []}
      recentDonations={data.recentDonations ?? []}
    />
  );
}
