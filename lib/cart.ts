'use client';

import { splitPrice, type MenuItem, type Restaurant } from './types';

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

export interface StoredCart {
  restaurantSlug: string;
  restaurantName: string;
  lines: { menuItemId: string; quantity: number }[];
  savedAt: number;
}

const KEY = 'daansetu.cart';

export function saveCart(restaurant: Restaurant, lines: CartLine[]) {
  const payload: StoredCart = {
    restaurantSlug: restaurant.slug,
    restaurantName: restaurant.name,
    lines: lines.map((l) => ({ menuItemId: l.item._id, quantity: l.quantity })),
    savedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* private browsing — checkout sends the guest back to the menu */
  }
}

export function readCart(): StoredCart | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCart;
    // A cart older than two hours is stale; prices may have moved.
    if (Date.now() - parsed.savedAt > 2 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCart() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Totals for a cart: what the guest pays, what the kitchen matches, and the food value. */
export function cartTotals(lines: CartLine[]) {
  return lines.reduce(
    (acc, { item, quantity }) => {
      const { customerPaysPaise, restaurantPaysPaise } = splitPrice(
        item.mrpPaise,
        item.customerSharePercent
      );
      return {
        portions: acc.portions + quantity,
        customerPaise: acc.customerPaise + customerPaysPaise * quantity,
        restaurantPaise: acc.restaurantPaise + restaurantPaysPaise * quantity,
        foodValuePaise: acc.foodValuePaise + item.mrpPaise * quantity,
      };
    },
    { portions: 0, customerPaise: 0, restaurantPaise: 0, foodValuePaise: 0 }
  );
}
