import type { CartLine } from './models';

/** Free delivery above this amount. 200.000 TND */
export const FREE_DELIVERY_THRESHOLD = 200_000;
/** Flat delivery fee below the threshold. 8.000 TND */
export const DELIVERY_FEE = 8_000;
export const MAX_QUANTITY_PER_LINE = 10;

export interface CartDiscount {
  code: string;
  /** 0-100 */
  percentOff?: number;
  amountOffMillimes?: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  /** How much more to spend to unlock free delivery. 0 when unlocked. */
  amountToFreeDelivery: number;
  /** 0-1, for the progress bar. */
  freeDeliveryProgress: number;
  hasFreeDelivery: boolean;
}

export function lineTotal(line: Pick<CartLine, 'unitPriceMillimes' | 'quantity'>): number {
  return line.unitPriceMillimes * line.quantity;
}

export function clampQuantity(quantity: number, stock: number): number {
  const ceiling = Math.min(stock > 0 ? stock : 0, MAX_QUANTITY_PER_LINE);
  if (ceiling <= 0) return 0;
  return Math.max(1, Math.min(Math.trunc(quantity), ceiling));
}

export function lineKey(productId: string, variantId?: string | null): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

export function calculateTotals(lines: CartLine[], discount?: CartDiscount | null): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  let discountValue = 0;
  if (discount) {
    if (discount.percentOff) {
      discountValue += Math.round((subtotal * discount.percentOff) / 100);
    }
    if (discount.amountOffMillimes) {
      discountValue += discount.amountOffMillimes;
    }
  }
  discountValue = Math.min(discountValue, subtotal);

  const payable = subtotal - discountValue;
  const hasFreeDelivery = itemCount > 0 && payable >= FREE_DELIVERY_THRESHOLD;
  const delivery = itemCount === 0 || hasFreeDelivery ? 0 : DELIVERY_FEE;
  const amountToFreeDelivery = hasFreeDelivery ? 0 : Math.max(0, FREE_DELIVERY_THRESHOLD - payable);
  const freeDeliveryProgress = Math.min(1, payable / FREE_DELIVERY_THRESHOLD);

  return {
    itemCount,
    subtotal,
    discount: discountValue,
    delivery,
    total: payable + delivery,
    amountToFreeDelivery,
    freeDeliveryProgress,
    hasFreeDelivery,
  };
}
