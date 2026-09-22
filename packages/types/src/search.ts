import type { ProductQuery } from './models';
import { toMillimes } from './money';

/**
 * Parses a free-text search like "wireless gaming mouse under 300 TND" into a
 * ProductQuery — category, tags, price bounds, sort and availability hints —
 * using known catalog vocabulary and a handful of regex patterns. No AI, no
 * network call: this runs entirely client-side before the /shop request fires.
 *
 * Anything left over after every known pattern is stripped becomes `q`, so an
 * unrecognised word (a brand, a model name) still reaches the normal text
 * search instead of being silently dropped.
 */

const CATEGORY_ALIASES: Record<string, string> = {
  mouse: 'mice',
  mice: 'mice',
  keyboard: 'keyboards',
  keyboards: 'keyboards',
  headset: 'headsets',
  headsets: 'headsets',
  headphone: 'headsets',
  headphones: 'headsets',
  monitor: 'monitors',
  monitors: 'monitors',
  screen: 'monitors',
  display: 'monitors',
  controller: 'controllers',
  controllers: 'controllers',
  gamepad: 'controllers',
  gpu: 'graphics-cards',
  processor: 'processors',
  processors: 'processors',
  cpu: 'processors',
  chair: 'chairs',
  chairs: 'chairs',
  desk: 'desks',
  desks: 'desks',
  ssd: 'storage',
  storage: 'storage',
  drive: 'storage',
  ram: 'memory',
  memory: 'memory',
  mic: 'microphones',
  microphone: 'microphones',
  microphones: 'microphones',
  webcam: 'webcams',
  webcams: 'webcams',
  camera: 'webcams',
  speaker: 'speakers',
  speakers: 'speakers',
};

const MULTI_WORD_CATEGORY_ALIASES: { alias: string; slug: string }[] = [
  { alias: 'graphics cards', slug: 'graphics-cards' },
  { alias: 'graphics card', slug: 'graphics-cards' },
  { alias: 'video card', slug: 'graphics-cards' },
  { alias: 'console accessories', slug: 'console-accessories' },
  { alias: 'console accessory', slug: 'console-accessories' },
].sort((a, b) => b.alias.length - a.alias.length);

const TAG_ALIASES: Record<string, string> = {
  wireless: 'wireless',
  lightweight: 'lightweight',
  light: 'lightweight',
  esports: 'esports',
  ergonomic: 'ergonomic',
  mechanical: 'mechanical',
  rgb: 'rgb',
  silent: 'silent',
  anc: 'anc',
  surround: 'surround',
  oled: 'oled',
  ultrawide: 'ultrawide',
  '4k': '4k',
  hdr: 'hdr',
  console: 'console',
  overclocked: 'overclocked',
  quiet: 'quiet',
  gaming: 'gaming',
  mesh: 'mesh',
  standing: 'standing',
  charging: 'charging',
  cooling: 'cooling',
  nvme: 'nvme',
  gen5: 'gen5',
  ddr5: 'ddr5',
  ddr4: 'ddr4',
  expo: 'expo',
  usb: 'usb',
  xlr: 'xlr',
  cardioid: 'cardioid',
  streaming: 'streaming',
  autofocus: 'autofocus',
  bluetooth: 'bluetooth',
  studio: 'studio',
  subwoofer: 'subwoofer',
};

const MULTI_WORD_TAG_ALIASES: { alias: string; tag: string }[] = [
  { alias: 'low latency', tag: 'low-latency' },
  { alias: 'hot swap', tag: 'hot-swap' },
  { alias: 'hot-swap', tag: 'hot-swap' },
  { alias: 'noise cancelling', tag: 'anc' },
  { alias: 'noise canceling', tag: 'anc' },
  { alias: 'open back', tag: 'open-back' },
  { alias: 'high refresh', tag: 'high-refresh' },
  { alias: 'hall effect', tag: 'hall-effect' },
  { alias: 'ray tracing', tag: 'ray-tracing' },
  { alias: 'cable management', tag: 'cable-management' },
  { alias: 'ultra wide', tag: 'ultrawide' },
].sort((a, b) => b.alias.length - a.alias.length);

const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'for',
  'with',
  'and',
  'me',
  'show',
  'find',
  'get',
  'i',
  'want',
  'need',
  'looking',
  'some',
  'any',
  'please',
  'good',
]);

function toNumber(raw: string): number {
  return parseFloat(raw.replace(',', '.'));
}

export interface NaturalSearchMatch {
  category?: string;
  tags: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductQuery['sort'];
  inStock?: boolean;
  onSale?: boolean;
}

export interface NaturalSearchResult {
  query: ProductQuery;
  /** What the parser actually recognised — handy for a "searching for…" chip trail in the UI. */
  matched: NaturalSearchMatch;
}

export function parseNaturalQuery(raw: string): NaturalSearchResult {
  let text = ` ${raw.toLowerCase().trim()} `;
  const query: ProductQuery = {};
  const tags: string[] = [];
  let category: string | undefined;

  const consume = (phrase: string) => {
    text = text.replace(phrase, ' ');
  };

  // 1. Multi-word category aliases, longest first, before anything gets tokenised.
  for (const { alias, slug } of MULTI_WORD_CATEGORY_ALIASES) {
    if (text.includes(alias)) {
      category = slug;
      consume(alias);
      break;
    }
  }

  // 2. Price phrases. "between" first so it doesn't get half-eaten by "over"/"under".
  const between = text.match(/between\s+(\d+(?:[.,]\d+)?)\s*(?:tnd|dt|dinars?)?\s*(?:and|-|to)\s+(\d+(?:[.,]\d+)?)/);
  if (between) {
    query.minPrice = toMillimes(toNumber(between[1]));
    query.maxPrice = toMillimes(toNumber(between[2]));
    consume(between[0]);
  } else {
    const under = text.match(/(?:under|below|less than|cheaper than)\s+(\d+(?:[.,]\d+)?)/);
    if (under) {
      query.maxPrice = toMillimes(toNumber(under[1]));
      consume(under[0]);
    }
    const over = text.match(/(?:over|above|more than)\s+(\d+(?:[.,]\d+)?)/);
    if (over) {
      query.minPrice = toMillimes(toNumber(over[1]));
      consume(over[0]);
    }
  }
  text = text.replace(/\b(tnd|dt|dinars?)\b/g, ' ');

  // 3. Sort / availability hints.
  if (/\b(cheapest|budget|cheap)\b/.test(text)) {
    query.sort = 'price-asc';
    text = text.replace(/\b(cheapest|budget|cheap)\b/g, ' ');
  } else if (/\b(best rated|top rated|highest rated)\b/.test(text)) {
    query.sort = 'rating';
    text = text.replace(/\b(best rated|top rated|highest rated)\b/g, ' ');
  } else if (/\b(popular|best sellers?|bestsellers?)\b/.test(text)) {
    query.sort = 'popular';
    text = text.replace(/\b(popular|best sellers?|bestsellers?)\b/g, ' ');
  } else if (/\bnewest\b/.test(text)) {
    query.sort = 'newest';
    text = text.replace(/\bnewest\b/g, ' ');
  }

  if (/\bin stock\b/.test(text)) {
    query.inStock = true;
    text = text.replace(/\bin stock\b/g, ' ');
  }
  if (/\b(on sale|discounted|sale)\b/.test(text)) {
    query.onSale = true;
    text = text.replace(/\b(on sale|discounted|sale)\b/g, ' ');
  }

  // 4. Multi-word tag aliases, longest first.
  for (const { alias, tag } of MULTI_WORD_TAG_ALIASES) {
    if (text.includes(alias)) {
      if (!tags.includes(tag)) tags.push(tag);
      text = text.replace(alias, ' ');
    }
  }

  // 5. Whatever single words remain: category, tag, stopword, or leftover free text.
  const leftover: string[] = [];
  for (const word of text.split(/\s+/)) {
    const clean = word.replace(/[^\w-]/g, '');
    if (!clean) continue;
    if (!category && CATEGORY_ALIASES[clean]) {
      category = CATEGORY_ALIASES[clean];
      continue;
    }
    if (TAG_ALIASES[clean] && !tags.includes(TAG_ALIASES[clean])) {
      tags.push(TAG_ALIASES[clean]);
      continue;
    }
    if (STOPWORDS.has(clean)) continue;
    leftover.push(clean);
  }

  if (category) query.category = category;
  if (tags.length) query.tags = tags;
  const q = leftover.join(' ').trim();
  if (q) query.q = q;

  return {
    query,
    matched: {
      category,
      tags,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      sort: query.sort,
      inStock: query.inStock,
      onSale: query.onSale,
    },
  };
}
