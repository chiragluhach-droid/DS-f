'use client';

import { ApprovalList } from '@/components/admin/ApprovalList';

export default function AdminNgosPage() {
  return (
    <ApprovalList
      kind="ngo"
      endpoint="/admin/ngos"
      listKey="ngos"
      eyebrow="NGOs"
      title="Receiving organisations"
      description="Only approved NGOs can be assigned donations or confirm receipt. Check registration details before approving."
    />
  );
}
