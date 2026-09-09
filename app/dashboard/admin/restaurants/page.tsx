'use client';

import { ApprovalList } from '@/components/admin/ApprovalList';

export default function AdminRestaurantsPage() {
  return (
    <ApprovalList
      kind="restaurant"
      endpoint="/admin/restaurants"
      listKey="restaurants"
      eyebrow="Restaurants"
      title="Kitchens on the platform"
      description="Approve a kitchen and its donation page goes live immediately. Suspending it hides the page without deleting any history."
      publicPath={(slug) => `/restaurant/${slug}`}
    />
  );
}
