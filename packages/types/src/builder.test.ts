import { describe, expect, it } from 'vitest';
import { BUILDER_WEIGHTS, budgetShare, pickForBudgetSlice, type BuilderStyle } from './builder';

describe('BUILDER_WEIGHTS', () => {
  const styles: BuilderStyle[] = ['PERFORMANCE', 'BALANCED', 'AESTHETIC'];

  it.each(styles)('%s weights sum to exactly 100', (style) => {
    const total = BUILDER_WEIGHTS[style].reduce((sum, slot) => sum + slot.weightPercent, 0);
    expect(total).toBe(100);
  });

  it('every style proposes the same six roles, just funded differently', () => {
    const roleSets = styles.map((style) => BUILDER_WEIGHTS[style].map((slot) => slot.role).sort());
    expect(roleSets[0]).toEqual(roleSets[1]);
    expect(roleSets[1]).toEqual(roleSets[2]);
  });
});

describe('budgetShare', () => {
  it('takes a percentage of the budget, rounded', () => {
    expect(budgetShare(1_500_000, 22)).toBe(330_000);
    expect(budgetShare(1_000_000, 33)).toBe(330_000);
  });
});

describe('pickForBudgetSlice', () => {
  const candidates = [
    { id: 'a', priceMillimes: 100_000 },
    { id: 'b', priceMillimes: 200_000 },
    { id: 'c', priceMillimes: 300_000 },
    { id: 'd', priceMillimes: 500_000 },
  ];

  it('picks the priciest candidate that still fits the budget', () => {
    const picked = pickForBudgetSlice(candidates, 250_000);
    expect(picked?.id).toBe('b');
  });

  it('picks the exact match when a candidate equals the ceiling', () => {
    const picked = pickForBudgetSlice(candidates, 300_000);
    expect(picked?.id).toBe('c');
  });

  it('falls back to the cheapest candidate when nothing fits the ceiling', () => {
    const picked = pickForBudgetSlice(candidates, 50_000);
    expect(picked?.id).toBe('a');
  });

  it('picks the most expensive candidate when the ceiling covers everything', () => {
    const picked = pickForBudgetSlice(candidates, 999_999_999);
    expect(picked?.id).toBe('d');
  });

  it('returns null for an empty category', () => {
    expect(pickForBudgetSlice([], 100_000)).toBeNull();
  });
});
