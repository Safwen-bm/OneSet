import { describe, expect, it } from 'vitest';
import { evaluateCompatibility, parseSpecNumeric } from './compatibility';

describe('parseSpecNumeric', () => {
  it('reads a plain number with a unit', () => {
    expect(parseSpecNumeric('850 W')).toBe(850);
  });

  it('strips thousands separators', () => {
    expect(parseSpecNumeric('6,000 MT/s')).toBe(6000);
  });

  it('reads decimals', () => {
    expect(parseSpecNumeric('0.5 ms')).toBe(0.5);
  });

  it('returns null when there is no number to find', () => {
    expect(parseSpecNumeric('Fast IPS')).toBeNull();
  });
});

describe('evaluateCompatibility', () => {
  it('equals matches case-insensitively', () => {
    expect(evaluateCompatibility('equals', 'DDR5', 'ddr5')).toBe(true);
    expect(evaluateCompatibility('equals', 'DDR5', 'DDR4')).toBe(false);
  });

  it('startsWith — the real DDR4/DDR5 rule', () => {
    expect(evaluateCompatibility('startsWith', 'DDR5-6000', 'DDR5')).toBe(true);
    expect(evaluateCompatibility('startsWith', 'DDR5-6000', 'DDR4')).toBe(false);
    expect(evaluateCompatibility('startsWith', 'DDR4-3600', 'DDR5')).toBe(false);
  });

  it('contains matches a substring anywhere', () => {
    expect(evaluateCompatibility('contains', 'PCIe 5.0 x4 NVMe', 'nvme')).toBe(true);
    expect(evaluateCompatibility('contains', 'PCIe 4.0 x4 NVMe', 'gen5')).toBe(false);
  });

  it('gte compares parsed numbers, not strings', () => {
    expect(evaluateCompatibility('gte', '850 W', '170 W')).toBe(true);
    expect(evaluateCompatibility('gte', '65 W', '170 W')).toBe(false);
    expect(evaluateCompatibility('gte', '850 W', '850 W')).toBe(true);
  });

  it('lte compares parsed numbers the other way', () => {
    expect(evaluateCompatibility('lte', '65 W', '170 W')).toBe(true);
    expect(evaluateCompatibility('lte', '850 W', '170 W')).toBe(false);
  });

  it('numeric operators never block the build when a value has no number', () => {
    expect(evaluateCompatibility('gte', 'Fast IPS', '170 W')).toBe(true);
    expect(evaluateCompatibility('lte', '170 W', 'Fast IPS')).toBe(true);
  });

  it('an unknown operator never blocks the build', () => {
    expect(evaluateCompatibility('unknown-op', 'anything', 'anything else')).toBe(true);
  });
});
