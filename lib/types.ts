export type Role = 'customer' | 'restaurant' | 'ngo' | 'admin';

/**
 * The four checkpoints a donation passes through after it is paid for. These
 * mirror the server's lifecycle: payment verification sets the first, and the
 * batch the food is cooked in carries it through the rest.
 */
export const DONATION_STATUSES = [
  'PAYMENT_SUCCESS',
  'ASSIGNED_TO_BATCH',
  'DISPATCHED',
  'NGO_CONFIRMED',
] as const;

export type DonationStatus = (typeof DONATION_STATUSES)[number];
export type AnyStatus =
  | DonationStatus
  | 'PENDING_PAYMENT'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface StatusMeta {
  label: string;
  short: string;
  blurb: string;
}

export const STATUS_META: Record<AnyStatus, StatusMeta> = {
  PENDING_PAYMENT: {
    label: 'Awaiting payment',
    short: 'Unpaid',
    blurb: 'This donation is reserved and waiting for payment to complete.',
  },
  PAYMENT_SUCCESS: {
    label: 'Donation received',
    short: 'Received',
    blurb: 'Your half is paid and the kitchen has committed the other half.',
  },
  ASSIGNED_TO_BATCH: {
    label: 'Queued in the kitchen',
    short: 'In the kitchen',
    blurb: 'Your dishes are in the next batch being cooked for the NGO.',
  },
  DISPATCHED: {
    label: 'Cooked and sent',
    short: 'On the way',
    blurb: 'The kitchen cooked the batch and sent it to the NGO.',
  },
  NGO_CONFIRMED: {
    label: 'Confirmed by the NGO',
    short: 'Confirmed',
    blurb: 'Counted on arrival by the NGO, and served.',
  },
  FAILED: { label: 'Payment failed', short: 'Failed', blurb: 'This payment did not go through.' },
  CANCELLED: { label: 'Cancelled', short: 'Cancelled', blurb: 'This donation was cancelled.' },
  REFUNDED: { label: 'Refunded', short: 'Refunded', blurb: 'The amount was returned to you.' },
};

/** A status the server may add that this build does not know about yet. */
export const statusMeta = (status: string): StatusMeta =>
  STATUS_META[status as AnyStatus] ?? {
    label: status.replace(/_/g, ' ').toLowerCase(),
    short: status.replace(/_/g, ' ').toLowerCase(),
    blurb: '',
  };

/** Who owns each checkpoint — shown on the landing page and the timeline. */
export const STATUS_ACTOR_LABEL: Record<DonationStatus, string> = {
  PAYMENT_SUCCESS: 'You',
  ASSIGNED_TO_BATCH: 'The kitchen',
  DISPATCHED: 'The kitchen',
  NGO_CONFIRMED: 'The NGO',
};

/** A batch's own lifecycle, as the kitchen and NGO dashboards show it. */
export const BATCH_STATUSES = [
  'IN_PROGRESS',
  'READY_FOR_DELIVERY',
  'DISPATCHED',
  'RECONCILIATION_REQUIRED',
  'COMPLETED',
] as const;

export type BatchStatus = (typeof BATCH_STATUSES)[number];

export const BATCH_META: Record<BatchStatus, { label: string; short: string; blurb: string }> = {
  IN_PROGRESS: {
    label: 'Collecting',
    short: 'Collecting',
    blurb: 'Guests are still funding portions for this batch.',
  },
  READY_FOR_DELIVERY: {
    label: 'Ready to cook',
    short: 'Ready',
    blurb: 'The target is met. Cook it and send it out.',
  },
  DISPATCHED: {
    label: 'With the NGO',
    short: 'Sent',
    blurb: 'Sent to the NGO and waiting on their count.',
  },
  RECONCILIATION_REQUIRED: {
    label: 'Count did not match',
    short: 'Flagged',
    blurb: 'The NGO received a different number than was sent. Under review.',
  },
  COMPLETED: {
    label: 'Closed',
    short: 'Closed',
    blurb: 'Received, counted and confirmed.',
  },
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

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

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
  approvalStatus: ApprovalStatus;
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
  approvalStatus: ApprovalStatus;
  stats: { portionsReceived: number; donationsConfirmed: number };
  createdAt: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  /** The dish's normal menu price. */
  mrpPaise: number;
  /** Share of the MRP the guest pays. Fixed at 50 across the platform. */
  customerSharePercent: number;
  /** Portions of this dish collected before the kitchen cooks a batch. */
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
  menuItem?: string;
  name: string;
  image?: string;
  quantity: number;
  mrpPaise: number;
  customerSharePercent: number;
  lineCustomerPaise: number;
  lineRestaurantPaise: number;
  lineFoodValuePaise: number;
  /** The batch this dish is cooked in, once the donation is paid. */
  batch?: string;
}

export interface Donation {
  _id: string;
  donationId: string;
  restaurant: Restaurant | string;
  ngo?: Ngo | string;
  donorSnapshot: {
    name: string;
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

/** What a donor is shown about the batch each of their dishes travelled in. */
export interface TrackedBatch {
  itemName: string;
  quantity: number;
  batchId?: string;
  status?: BatchStatus;
  targetQuantity?: number;
  collectedQuantity?: number;
  dispatchedQuantity?: number;
  receivedQuantity?: number;
  readyAt?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  receiptNote?: string;
  shortfall?: boolean;
  resolutionNote?: string;
}

/** A batch as the kitchen, NGO and admin dashboards see it. */
export interface Batch {
  _id: string;
  batchId: string;
  restaurant: Restaurant | string;
  ngo: Ngo | string;
  menuItem?: { _id: string; name: string; image?: string; category?: string } | string;
  itemName: string;
  status: BatchStatus;
  targetQuantity: number;
  collectedQuantity: number;
  donationCount: number;
  dispatchedQuantity: number;
  receivedQuantity: number;
  readyAt?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  dispatchNote?: string;
  receiptNote?: string;
  resolution?: { note: string; resolvedAt: string };
  createdAt: string;
}

export interface BatchSummary {
  collecting: number;
  readyToCook: number;
  inTransit: number;
  flagged: number;
  portionsAwaitingDispatch: number;
  portionsInTransit: number;
  byStatus: Record<BatchStatus, { batches: number; portions: number }>;
}

export interface BatchEvent {
  _id: string;
  fromStatus?: BatchStatus;
  toStatus: BatchStatus;
  actorType: Role | 'system';
  actorName: string;
  note?: string;
  createdAt: string;
}
