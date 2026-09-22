import { describe, expect, it } from 'vitest';
import { parseNaturalQuery } from './search';
import { toMillimes } from './money';

describe('parseNaturalQuery', () => {
  it('1. "wireless gaming mouse under 300 TND" — category + two tags + price ceiling', () => {
    const { query } = parseNaturalQuery('wireless gaming mouse under 300 TND');
    expect(query.category).toBe('mice');
    expect(query.tags).toEqual(expect.arrayContaining(['wireless', 'gaming']));
    expect(query.maxPrice).toBe(toMillimes(300));
    expect(query.q).toBeUndefined();
  });

  it('2. "mechanical keyboard with rgb" — category + two tags, stopword dropped', () => {
    const { query } = parseNaturalQuery('mechanical keyboard with rgb');
    expect(query.category).toBe('keyboards');
    expect(query.tags).toEqual(expect.arrayContaining(['mechanical', 'rgb']));
    expect(query.q).toBeUndefined();
  });

  it('3. "monitor over 1000" — category + price floor', () => {
    const { query } = parseNaturalQuery('monitor over 1000');
    expect(query.category).toBe('monitors');
    expect(query.minPrice).toBe(toMillimes(1000));
    expect(query.maxPrice).toBeUndefined();
  });

  it('4. "chair between 700 and 1500" — category + price range', () => {
    const { query } = parseNaturalQuery('chair between 700 and 1500');
    expect(query.category).toBe('chairs');
    expect(query.minPrice).toBe(toMillimes(700));
    expect(query.maxPrice).toBe(toMillimes(1500));
  });

  it('5. "cheapest wireless headset" — sort hint + category + tag', () => {
    const { query } = parseNaturalQuery('cheapest wireless headset');
    expect(query.sort).toBe('price-asc');
    expect(query.category).toBe('headsets');
    expect(query.tags).toEqual(['wireless']);
  });

  it('6. "best rated 4k webcam" — sort hint + tag + category', () => {
    const { query } = parseNaturalQuery('best rated 4k webcam');
    expect(query.sort).toBe('rating');
    expect(query.tags).toEqual(['4k']);
    expect(query.category).toBe('webcams');
  });

  it('7. "ddr5 memory under 500" — category alias + tag + price ceiling', () => {
    const { query } = parseNaturalQuery('ddr5 memory under 500');
    expect(query.category).toBe('memory');
    expect(query.tags).toEqual(['ddr5']);
    expect(query.maxPrice).toBe(toMillimes(500));
  });

  it('8. "quiet graphics card" — multi-word category alias + tag', () => {
    const { query } = parseNaturalQuery('quiet graphics card');
    expect(query.category).toBe('graphics-cards');
    expect(query.tags).toEqual(['quiet']);
  });

  it('9. "standing desk with cable management" — category + multi-word tag alias', () => {
    const { query } = parseNaturalQuery('standing desk with cable management');
    expect(query.category).toBe('desks');
    expect(query.tags).toEqual(expect.arrayContaining(['standing', 'cable-management']));
  });

  it('10. "bluetooth speaker on sale" — category + tag + sale flag', () => {
    const { query } = parseNaturalQuery('bluetooth speaker on sale');
    expect(query.category).toBe('speakers');
    expect(query.tags).toEqual(['bluetooth']);
    expect(query.onSale).toBe(true);
  });

  it('11. "hall effect controller in stock" — category + multi-word tag + stock flag', () => {
    const { query } = parseNaturalQuery('hall effect controller in stock');
    expect(query.category).toBe('controllers');
    expect(query.tags).toEqual(['hall-effect']);
    expect(query.inStock).toBe(true);
  });

  it('12. "kinetiq aeron pro" — nothing recognised falls back to free text, not dropped', () => {
    const { query } = parseNaturalQuery('kinetiq aeron pro');
    expect(query.category).toBeUndefined();
    expect(query.tags).toBeUndefined();
    expect(query.q).toBe('kinetiq aeron pro');
  });
});
