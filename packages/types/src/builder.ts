export type BuilderStyle = 'PERFORMANCE' | 'BALANCED' | 'AESTHETIC';

export interface BuilderRoleWeight {
  role: string;
  categorySlug: string;
  weightPercent: number;
}

/**
 * Every style proposes the same six slots — only the budget *weight* per slot
 * changes. That keeps "propose a full setup" honest: a style never silently
 * drops a category, it just funds it differently. Weights sum to 100 for each
 * style; see the README for the reasoning behind each split, and the test
 * file for a check that they actually do sum to 100.
 */
export const BUILDER_WEIGHTS: Record<BuilderStyle, BuilderRoleWeight[]> = {
  PERFORMANCE: [
    { role: 'Pointer', categorySlug: 'mice', weightPercent: 18 },
    { role: 'Board', categorySlug: 'keyboards', weightPercent: 16 },
    { role: 'Sound', categorySlug: 'headsets', weightPercent: 14 },
    { role: 'Display', categorySlug: 'monitors', weightPercent: 32 },
    { role: 'Seat', categorySlug: 'chairs', weightPercent: 12 },
    { role: 'Surface', categorySlug: 'desks', weightPercent: 8 },
  ],
  BALANCED: [
    { role: 'Pointer', categorySlug: 'mice', weightPercent: 14 },
    { role: 'Board', categorySlug: 'keyboards', weightPercent: 14 },
    { role: 'Sound', categorySlug: 'headsets', weightPercent: 14 },
    { role: 'Display', categorySlug: 'monitors', weightPercent: 22 },
    { role: 'Seat', categorySlug: 'chairs', weightPercent: 20 },
    { role: 'Surface', categorySlug: 'desks', weightPercent: 16 },
  ],
  AESTHETIC: [
    { role: 'Pointer', categorySlug: 'mice', weightPercent: 10 },
    { role: 'Board', categorySlug: 'keyboards', weightPercent: 14 },
    { role: 'Sound', categorySlug: 'headsets', weightPercent: 10 },
    { role: 'Display', categorySlug: 'monitors', weightPercent: 24 },
    { role: 'Seat', categorySlug: 'chairs', weightPercent: 22 },
    { role: 'Surface', categorySlug: 'desks', weightPercent: 20 },
  ],
};

export function budgetShare(budgetMillimes: number, weightPercent: number): number {
  return Math.round((budgetMillimes * weightPercent) / 100);
}

/**
 * Given in-stock candidates in one category (ascending price) and a budget
 * ceiling for that slot, picks the most expensive one still inside budget —
 * spending the slice fully rather than under-shooting it — and falls back to
 * the cheapest candidate overall if nothing fits, so a slot is never empty.
 * Returns null only when the category has no candidates at all.
 */
export function pickForBudgetSlice<T extends { priceMillimes: number }>(
  candidatesAscending: T[],
  shareMillimes: number,
): T | null {
  if (candidatesAscending.length === 0) return null;

  const affordable = candidatesAscending.filter((candidate) => candidate.priceMillimes <= shareMillimes);
  return affordable.length ? affordable[affordable.length - 1] : candidatesAscending[0];
}
