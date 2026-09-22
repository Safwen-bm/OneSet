/**
 * Money is stored everywhere as an integer number of millimes (1 TND = 1000 millimes).
 * Never use floats for money — 0.1 + 0.2 !== 0.3 and carts are where that bites you.
 */
export const CURRENCY = 'TND';
export const MILLIMES_PER_DINAR = 1000;

export function toMillimes(dinars: number): number {
  return Math.round(dinars * MILLIMES_PER_DINAR);
}

export function toDinars(millimes: number): number {
  return millimes / MILLIMES_PER_DINAR;
}

/** 129500 -> "129,500 TND" */
export function formatPrice(millimes: number, locale = 'en-US'): string {
  const value = toDinars(millimes);
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 3,
    maximumFractionDigits: 3,
  }).format(value);
  return `${formatted} ${CURRENCY}`;
}

export function percentOff(priceMillimes: number, compareAtMillimes?: number | null): number | null {
  if (!compareAtMillimes || compareAtMillimes <= priceMillimes) return null;
  return Math.round(((compareAtMillimes - priceMillimes) / compareAtMillimes) * 100);
}
