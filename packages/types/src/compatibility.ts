export type CompatibilityOperator = 'equals' | 'startsWith' | 'contains' | 'gte' | 'lte';

/** Pulls the first number out of a spec value like "850 W" or "6,000 MT/s". */
export function parseSpecNumeric(value: string): number | null {
  const match = value.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

/**
 * The whole ruleset lives in the CompatibilityRule table — this function only
 * knows how to apply the five operators a rule can declare. Adding a new rule
 * (new categories, new specs) never touches this code.
 */
export function evaluateCompatibility(operator: string, sourceValue: string, targetValue: string): boolean {
  switch (operator as CompatibilityOperator) {
    case 'equals':
      return sourceValue.trim().toLowerCase() === targetValue.trim().toLowerCase();
    case 'startsWith':
      return sourceValue.trim().toLowerCase().startsWith(targetValue.trim().toLowerCase());
    case 'contains':
      return sourceValue.trim().toLowerCase().includes(targetValue.trim().toLowerCase());
    case 'gte': {
      const a = parseSpecNumeric(sourceValue);
      const b = parseSpecNumeric(targetValue);
      return a !== null && b !== null ? a >= b : true; // can't compare numerically — don't block the build
    }
    case 'lte': {
      const a = parseSpecNumeric(sourceValue);
      const b = parseSpecNumeric(targetValue);
      return a !== null && b !== null ? a <= b : true;
    }
    default:
      return true;
  }
}
