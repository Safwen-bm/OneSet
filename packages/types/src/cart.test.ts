import { describe, expect, it } from 'vitest';
import {
  calculateTotals,
  clampQuantity,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  lineKey,
  lineTotal,
} from './cart';
import type { CartLine } from './models';

const line = (over: Partial<CartLine> = {}): CartLine => ({
  productId: 'p1',
  variantId: null,
  slug: 'aeron-pro-mouse',
  name: 'Aeron Pro Wireless Mouse',
  brand: 'Kinetiq',
  unitPriceMillimes: 129_000,
  quantity: 1,
  stock: 12,
  categorySlug: 'mice',
  ...over,
});

describe('lineTotal', () => {
  it('multiplies unit price by quantity', () => {
    expect(lineTotal(line({ quantity: 3 }))).toBe(387_000);
  });
});

describe('clampQuantity', () => {
  it('never goes below 1 when stock is available', () => {
    expect(clampQuantity(0, 5)).toBe(1);
    expect(clampQuantity(-4, 5)).toBe(1);
  });
  it('caps at available stock', () => {
    expect(clampQuantity(9, 4)).toBe(4);
  });
  it('caps at the per-line maximum', () => {
    expect(clampQuantity(50, 999)).toBe(10);
  });
  it('returns 0 when out of stock', () => {
    expect(clampQuantity(2, 0)).toBe(0);
  });
});

describe('lineKey', () => {
  it('separates variants of the same product', () => {
    expect(lineKey('p1', 'v1')).not.toBe(lineKey('p1', 'v2'));
    expect(lineKey('p1')).toBe('p1');
  });
});

describe('calculateTotals', () => {
  it('returns an empty, delivery-free cart for no lines', () => {
    const totals = calculateTotals([]);
    expect(totals.itemCount).toBe(0);
    expect(totals.subtotal).toBe(0);
    expect(totals.delivery).toBe(0);
    expect(totals.total).toBe(0);
  });

  it('charges delivery below the free threshold', () => {
    const totals = calculateTotals([line({ unitPriceMillimes: 50_000 })]);
    expect(totals.subtotal).toBe(50_000);
    expect(totals.delivery).toBe(DELIVERY_FEE);
    expect(totals.total).toBe(58_000);
    expect(totals.amountToFreeDelivery).toBe(FREE_DELIVERY_THRESHOLD - 50_000);
    expect(totals.hasFreeDelivery).toBe(false);
  });

  it('unlocks free delivery exactly at the threshold', () => {
    const totals = calculateTotals([line({ unitPriceMillimes: FREE_DELIVERY_THRESHOLD })]);
    expect(totals.hasFreeDelivery).toBe(true);
    expect(totals.delivery).toBe(0);
    expect(totals.amountToFreeDelivery).toBe(0);
    expect(totals.freeDeliveryProgress).toBe(1);
  });

  it('applies a percentage coupon before the delivery check', () => {
    const totals = calculateTotals([line({ unitPriceMillimes: 210_000 })], {
      code: 'SETUP10',
      percentOff: 10,
    });
    expect(totals.discount).toBe(21_000);
    // 189.000 TND payable -> back below the threshold, delivery is charged again
    expect(totals.delivery).toBe(DELIVERY_FEE);
    expect(totals.total).toBe(197_000);
  });

  it('never discounts more than the subtotal', () => {
    const totals = calculateTotals([line({ unitPriceMillimes: 20_000 })], {
      code: 'OVERKILL',
      amountOffMillimes: 90_000,
    });
    expect(totals.discount).toBe(20_000);
    expect(totals.total).toBe(DELIVERY_FEE);
  });

  it('sums mixed lines and quantities', () => {
    const totals = calculateTotals([
      line({ unitPriceMillimes: 129_000, quantity: 2 }),
      line({ productId: 'p2', unitPriceMillimes: 45_500, quantity: 1 }),
    ]);
    expect(totals.itemCount).toBe(3);
    expect(totals.subtotal).toBe(303_500);
    expect(totals.hasFreeDelivery).toBe(true);
  });
});
