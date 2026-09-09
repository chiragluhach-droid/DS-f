import { notFound } from 'next/navigation';
import { serverGet } from '@/lib/api';
import { CheckoutView } from '@/components/donate/CheckoutView';
import type { MenuItem, Restaurant, Ngo } from '@/lib/types';

interface PageData {
  restaurant: Restaurant;
  items: MenuItem[];
  partners: Ngo[];
}

export const metadata = { title: 'Complete your donation' };

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await serverGet<PageData>(`/restaurants/${slug}`);
  if (!data) notFound();

  return (
    <CheckoutView restaurant={data.restaurant} items={data.items} ngo={data.partners?.[0] ?? null} />
  );
}
