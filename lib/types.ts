export type Role = 'customer' | 'restaurant' | 'ngo' | 'admin';

/** The checkpoints a donation passes through. */
export const DONATION_STATUSES = [
  'PENDING_PAYMENT',
  'PAYMENT_SUCCESS',
  'ASSIGNED_TO_BATCH',
  'DISPATCHED',
  'NGO_CONFIRMED',
] as const;

export type DonationStatus = (typeof DONATION_STATUSES)[number];
export type AnyStatus = DonationStatus | BatchStatus | 'CANCELLED' | 'REFUNDED' | 'FAILED';

export const STATUS_META: Record<AnyStatus, { label: string; short: string; blurb: string }> = {
  PENDING_PAYMENT: {
    label: 'Payment pending',
    short: 'Pending',
    blurb: 'Waiting for payment confirmation.',
  },
  PAYMENT_SUCCESS: {
    label: 'Donation received',
    short: 'Received',
    blurb: 'Your half is paid and the restaurant has been notified.',
  },
  ASSIGNED_TO_BATCH: {
    label: 'Assigned to Batch',
    short: 'Batched',
    blurb: 'Assigned to a batch to be cooked.',
  },
  DISPATCHED: {
    label: 'Handed over to NGO',
    short: 'Handed over',
    blurb: 'The kitchen cooked your dishes and handed them to the NGO.',
  },
  NGO_CONFIRMED: {
    label: 'Confirmed by NGO',
    short: 'Confirmed',
    blurb: 'Counted, verified and served.',
  },
  CANCELLED: { label: 'Cancelled', short: 'Cancelled', blurb: 'This donation was cancelled.' },
  REFUNDED: { label: 'Refunded', short: 'Refunded', blurb: 'The amount was returned to you.' },
  FAILED: { label: 'Failed', short: 'Failed', blurb: 'Payment failed.' },
  IN_PROGRESS: { label: 'In Progress', short: 'Collecting', blurb: 'Collecting donations.' },
  READY_FOR_DELIVERY: { label: 'Ready for delivery', short: 'Ready', blurb: 'Ready to be dispatched.' },
  NGO_RECEIVED: { label: 'NGO Received', short: 'Received', blurb: 'NGO received the batch.' },
  RECONCILIATION_REQUIRED: { label: 'Reconciliation', short: 'Flagged', blurb: 'Requires admin attention.' },
  COMPLETED: { label: 'Completed', short: 'Completed', blurb: 'Batch delivered and closed.' },
};

/** Who owns each checkpoint — shown on the landing page and the timeline. */
export const STATUS_ACTOR_LABEL: Record<DonationStatus, string> = {
  PENDING_PAYMENT: 'You',
  PAYMENT_SUCCESS: 'You',
  ASSIGNED_TO_BATCH: 'System',
  DISPATCHED: 'The kitchen',
  NGO_CONFIRMED: 'The NGO',
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  restaurantId?: string;
  ngoId?: string;
  isGuest: boolean;
  createdAt: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface RestaurantStats {
  totalDonations: number;
  totalPortions: number;
  customerContributionPaise: number;
  restaurantContributionPaise: number;
  totalFoodValuePaise: number;
}

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  cuisine: string[];
  email: string;
  phone: string;
  address: Address;
  coverImage?: string;
  logoImage?: string;
  fssaiLicense?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  isAcceptingDonations: boolean;
  qrToken: string;
  stats: RestaurantStats;
  createdAt: string;
}

export interface Ngo {
  _id: string;
  name: string;
  slug: string;
  mission?: string;
  email: string;
  phone: string;
  registrationNumber?: string;
  website?: string;
  address: Address;
  logoImage?: string;
  coverImage?: string;
  beneficiaryFocus: string[];
  dailyCapacity: number;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  stats: { portionsReceived: number; donationsConfirmed: number };
  createdAt: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  /** The dish's normal menu price. */
  mrpPaise: number;
  /** Share of the MRP the guest pays; the restaurant covers the rest. */
  customerSharePercent: number;
  batchTarget: number;
  image?: string;
  category: string;
  isVeg: boolean;
  servingSize?: string;
  isAvailable: boolean;
  isSignature: boolean;
  sortOrder: number;
}

/** The single source of truth for the split on the client. Mirrors the server. */
export function splitPrice(mrpPaise: number, customerSharePercent: number) {
  const customerPaysPaise = Math.round((mrpPaise * customerSharePercent) / 100);
  return { customerPaysPaise, restaurantPaysPaise: mrpPaise - customerPaysPaise };
}

export interface DonationItem {
  menuItem: string;
  name: string;
  image?: string;
  quantity: number;
  mrpPaise: number;
  customerSharePercent: number;
  customerPaysPaise: number;
  restaurantPaysPaise: number;
  lineCustomerPaise: number;
  lineRestaurantPaise: number;
  lineFoodValuePaise: number;
  batch?: Batch;
}

export interface Donation {
  _id: string;
  donationId: string;
  restaurant: Restaurant | string;
  ngo?: Ngo | string;
  donorSnapshot: {
    name: string;
    email: string;
    phone?: string;
    isAnonymous: boolean;
    message?: string;
  };
  items: DonationItem[];
  totalPortions: number;
  customerPaidPaise: number;
  restaurantContributionPaise: number;
  totalFoodValuePaise: number;
  status: AnyStatus;
  isPaid: boolean;
  portionsReceived?: number;
  discrepancy?: {
    hasDiscrepancy: boolean;
    note?: string;
    reportedAt?: string;
    resolvedAt?: string;
    resolutionNote?: string;
  };
  timestamps_: Partial<Record<AnyStatus, string>>;
  createdAt: string;
}

export interface DonationEvent {
  _id: string;
  status: AnyStatus;
  title: string;
  note?: string;
  actorRole: Role | 'system';
  actorName: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export const BATCH_STATUSES = [
  'IN_PROGRESS',
  'READY_FOR_DELIVERY',
  'DISPATCHED',
  'NGO_RECEIVED',
  'RECONCILIATION_REQUIRED',
  'COMPLETED'
] as const;

export type BatchStatus = typeof BATCH_STATUSES[number];

export interface Batch {
  _id: string;
  batchId: string;
  restaurant: Restaurant | string;
  ngo: Ngo | string;
  menuItem: MenuItem | string;
  itemName: string;
  targetQuantity: number;
  collectedQuantity: number;
  dispatchedQuantity?: number;
  receivedQuantity?: number;
  status: BatchStatus;
  readyAt?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  receiptNote?: string;
  resolution?: {
    note: string;
  };
  createdAt: string;
}
