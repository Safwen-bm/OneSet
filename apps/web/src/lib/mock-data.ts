import type { CatalogFacets, Category, Paginated, Product, ProductQuery } from '@oneset/types';

/**
 * Sprint 2 shipped the catalog against this data before the API existed.
 * It stays as the offline fallback: if NEXT_PUBLIC_API_URL is unset or the API is down,
 * the storefront still browses. See `lib/api.ts`.
 */

interface Blueprint {
  name: string;
  slug: string;
  tagline: string;
  brand: string[];
  models: string[];
  price: [number, number];
  tags: string[];
  specs: [string, string, string][];
  swatches?: [string, string][];
}

const BLUEPRINTS: Blueprint[] = [
  {
    name: 'Gaming mice',
    slug: 'mice',
    tagline: 'Light, fast, and shaped to your grip',
    brand: ['Kinetiq', 'Vantra'],
    models: ['Aeron Pro', 'Drift 8K', 'Quark Air'],
    price: [89_000, 349_000],
    tags: ['wireless', 'lightweight', 'esports'],
    specs: [
      ['Sensor', 'DPI', '30,000'],
      ['Sensor', 'Polling rate', '8,000 Hz'],
      ['Build', 'Weight', '49 g'],
      ['Battery', 'Battery life', '95 h'],
    ],
    swatches: [
      ['Graphite', '#2B2D31'],
      ['Chalk', '#EDEDE8'],
      ['Cobalt', '#2436FF'],
    ],
  },
  {
    name: 'Keyboards',
    slug: 'keyboards',
    tagline: 'Sound and feel you actually chose',
    brand: ['Tessera', 'Norvik'],
    models: ['Monolith TKL', 'Basalt 65%', 'Meridian HE'],
    price: [149_000, 649_000],
    tags: ['hot-swap', 'mechanical', 'wireless'],
    specs: [
      ['Layout', 'Form factor', '65%'],
      ['Build', 'Mount', 'Gasket'],
      ['Build', 'Case', 'CNC aluminium'],
      ['Keycaps', 'Profile', 'Cherry PBT'],
    ],
    swatches: [
      ['Linear', '#E23B3B'],
      ['Tactile', '#8B5E34'],
    ],
  },
  {
    name: 'Headsets',
    slug: 'headsets',
    tagline: 'Hear the step before you see it',
    brand: ['Aurelis', 'Halcyon'],
    models: ['Vireo Pro', 'Echo Wireless', 'Canyon Open'],
    price: [169_000, 749_000],
    tags: ['wireless', 'anc', 'open-back'],
    specs: [
      ['Audio', 'Drivers', '50 mm dynamic'],
      ['Mic', 'Microphone', 'Detachable cardioid'],
      ['Comfort', 'Weight', '268 g'],
      ['Battery', 'Battery life', '40 h'],
    ],
  },
  {
    name: 'Monitors',
    slug: 'monitors',
    tagline: 'The part of the setup you stare at',
    brand: ['Orbita', 'Lumen Labs'],
    models: ['Vista 240Hz', 'Horizon OLED', 'Panorama UW'],
    price: [649_000, 3_290_000],
    tags: ['oled', 'high-refresh', 'ultrawide'],
    specs: [
      ['Panel', 'Size', '27"'],
      ['Panel', 'Resolution', '2560 × 1440'],
      ['Performance', 'Refresh rate', '240 Hz'],
      ['Performance', 'Response time', '0.03 ms'],
    ],
  },
  {
    name: 'Controllers',
    slug: 'controllers',
    tagline: 'Pads with hall-effect sticks and no drift',
    brand: ['Vantra', 'Ferrite'],
    models: ['Vector Pro', 'Grip Elite'],
    price: [139_000, 749_000],
    tags: ['hall-effect', 'console', 'wireless'],
    specs: [
      ['Sticks', 'Stick type', 'Hall effect, drift-free'],
      ['Inputs', 'Back paddles', '4 remappable'],
      ['Compatibility', 'Platforms', 'PC, PS5'],
    ],
  },
  {
    name: 'Graphics cards',
    slug: 'graphics-cards',
    tagline: 'Frames, quietly',
    brand: ['Cobalt Works', 'Norvik'],
    models: ['Forge OC', 'Torrent Trinity'],
    price: [1_290_000, 5_490_000],
    tags: ['ray-tracing', 'quiet'],
    specs: [
      ['Memory', 'VRAM', '16 GB GDDR7'],
      ['Clocks', 'Boost clock', '2,760 MHz'],
      ['Power', 'Recommended PSU', '850 W'],
    ],
  },
  {
    name: 'Processors',
    slug: 'processors',
    tagline: 'The part that decides your 1% lows',
    brand: ['Ferrite', 'Cobalt Works'],
    models: ['Core-7 3D', 'Axon X'],
    price: [690_000, 2_890_000],
    tags: ['gaming', 'unlocked'],
    specs: [
      ['Cores', 'Cores / threads', '8 / 16'],
      ['Clocks', 'Boost clock', '5.6 GHz'],
      ['Platform', 'Socket', 'AM5'],
      ['Platform', 'Memory support', 'DDR5-6000'],
    ],
  },
  {
    name: 'Gaming chairs',
    slug: 'chairs',
    tagline: 'Built for the eighth hour',
    brand: ['Sablecraft', 'Aurelis'],
    models: ['Atlas Mesh', 'Verve Ergo'],
    price: [790_000, 2_490_000],
    tags: ['mesh', 'lumbar', 'ergonomic'],
    specs: [
      ['Support', 'Lumbar', 'Adjustable, 4-way'],
      ['Support', 'Armrests', '4D'],
      ['Warranty', 'Warranty', '5 years'],
    ],
    swatches: [
      ['Charcoal mesh', '#3A3C42'],
      ['Sand mesh', '#C9BFAC'],
    ],
  },
  {
    name: 'Desks',
    slug: 'desks',
    tagline: 'Cable management included, not promised',
    brand: ['Sablecraft', 'Tessera'],
    models: ['Plateau Standing', 'Span XL'],
    price: [890_000, 2_990_000],
    tags: ['standing', 'cable-management'],
    specs: [
      ['Surface', 'Top size', '160 × 80 cm'],
      ['Frame', 'Height range', '62 – 128 cm'],
      ['Frame', 'Motors', 'Dual motor'],
    ],
  },
  {
    name: 'Console accessories',
    slug: 'console-accessories',
    tagline: 'For the PlayStation and Xbox side of the room',
    brand: ['Vantra', 'Kinetiq'],
    models: ['Dock Duo', 'Bay Plus'],
    price: [59_000, 349_000],
    tags: ['console', 'charging'],
    specs: [
      ['Compatibility', 'Works with', 'PS5 / PS5 Slim'],
      ['Extras', 'Charges controllers', '2 at once'],
    ],
  },
  {
    name: 'SSDs',
    slug: 'storage',
    tagline: 'Load screens, shortened',
    brand: ['Ferrite', 'Quartz'],
    models: ['Vault Gen5', 'Rapid HS'],
    price: [179_000, 1_190_000],
    tags: ['nvme', 'gen5', 'console-ready'],
    specs: [
      ['Performance', 'Sequential read', '12,400 MB/s'],
      ['Interface', 'Interface', 'PCIe 5.0 ×4 NVMe'],
      ['Endurance', 'TBW', '1,200 TBW'],
    ],
    swatches: [
      ['1 TB', '#8A8F98'],
      ['2 TB', '#5B616B'],
      ['4 TB', '#2B2F36'],
    ],
  },
  {
    name: 'Memory',
    slug: 'memory',
    tagline: 'RAM that posts on the first try',
    brand: ['Quartz', 'Cobalt Works'],
    models: ['Prism RGB', 'Lattice Low-profile'],
    price: [199_000, 890_000],
    tags: ['ddr5', 'expo'],
    specs: [
      ['Kit', 'Capacity', '32 GB (2 × 16)'],
      ['Kit', 'Memory type', 'DDR5'],
      ['Speed', 'Speed', '6,000 MT/s'],
      ['Speed', 'Timings', 'CL30'],
    ],
  },
  {
    name: 'Microphones',
    slug: 'microphones',
    tagline: 'Sound like you are in the room',
    brand: ['Aurelis', 'Tessera'],
    models: ['Timbre XLR', 'Vox USB'],
    price: [189_000, 990_000],
    tags: ['usb', 'cardioid', 'streaming'],
    specs: [
      ['Capsule', 'Type', 'Dynamic'],
      ['Capsule', 'Polar pattern', 'Cardioid'],
      ['Connectivity', 'Connection', 'USB-C + XLR'],
    ],
  },
  {
    name: 'Webcams',
    slug: 'webcams',
    tagline: 'Look better than your lighting deserves',
    brand: ['Lumen Labs', 'Orbita'],
    models: ['Lens 4K', 'Optic HDR'],
    price: [149_000, 749_000],
    tags: ['4k', 'autofocus', 'streaming'],
    specs: [
      ['Image', 'Resolution', '4K 30 fps'],
      ['Image', 'Sensor', '1/1.8" CMOS'],
      ['Lens', 'Focus', 'Autofocus'],
    ],
  },
  {
    name: 'Speakers',
    slug: 'speakers',
    tagline: 'Desktop sound with a real cabinet',
    brand: ['Aurelis', 'Halcyon'],
    models: ['Nearfield Active', 'Duet 2.1'],
    price: [279_000, 1_490_000],
    tags: ['near-field', 'bluetooth'],
    specs: [
      ['Drivers', 'Configuration', '4" woofer + 1" tweeter'],
      ['Power', 'Output', '2 × 50 W'],
    ],
  },
];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(4242);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const MOCK_CATEGORIES: Category[] = BLUEPRINTS.map((b, index) => ({
  id: `cat-${b.slug}`,
  name: b.name,
  slug: b.slug,
  tagline: b.tagline,
  position: index,
  productCount: b.models.length,
}));

export const MOCK_PRODUCTS: Product[] = BLUEPRINTS.flatMap((blueprint, bIndex) =>
  blueprint.models.map((model, mIndex) => {
    const brand = blueprint.brand[mIndex % blueprint.brand.length];
    const name = `${brand} ${model}`;
    const slug = slugify(name);
    const spread = blueprint.price[1] - blueprint.price[0];
    const price =
      Math.round((blueprint.price[0] + spread * ((mIndex + 1) / (blueprint.models.length + 1))) / 1000) *
      1000;
    const onSale = (bIndex + mIndex) % 4 === 0;
    const reviewCount = Math.floor(rand() * 260);

    return {
      id: `prod-${slug}`,
      slug,
      name,
      brand,
      shortDescription: `${model} ${blueprint.tagline.toLowerCase()}.`,
      description: `${name} sits in the OneSet ${blueprint.name.toLowerCase()} line-up. Ships from Tunis in 24 h, two-year warranty, 14-day returns.`,
      priceMillimes: price,
      compareAtMillimes: onSale ? Math.round((price * 1.25) / 1000) * 1000 : null,
      stock: (bIndex + mIndex) % 11 === 0 ? 0 : 4 + Math.floor(rand() * 40),
      rating: reviewCount ? Math.round((40 + rand() * 10)) / 10 : 0,
      reviewCount,
      tags: blueprint.tags,
      isFeatured: mIndex === 0,
      category: { id: `cat-${blueprint.slug}`, name: blueprint.name, slug: blueprint.slug },
      images: [0, 1, 2].map((i) => ({
        id: `${slug}-img-${i}`,
        url: `gradient:${slug}${i ? `-${i + 1}` : ''}`,
        alt: `${name} view ${i + 1}`,
        position: i,
      })),
      variants: (blueprint.swatches ?? []).map(([value, hex], i) => ({
        id: `${slug}-var-${i}`,
        name: `${name} ${value}`,
        sku: `${slug.toUpperCase().slice(0, 10)}-${i + 1}`,
        optionName: blueprint.slug === 'keyboards' ? 'Switch' : blueprint.slug === 'storage' ? 'Capacity' : 'Colour',
        optionValue: value,
        swatchHex: hex,
        priceMillimes: price + i * 20_000,
        stock: 3 + i * 4,
      })),
      specifications: blueprint.specs.map(([group, label, value], i) => ({
        id: `${slug}-spec-${i}`,
        group,
        label,
        value,
        position: i,
      })),
    } satisfies Product;
  }),
);

export function mockFindProducts(query: ProductQuery = {}): Paginated<Product> {
  let items = [...MOCK_PRODUCTS];

  if (query.q) {
    const needle = query.q.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.brand.toLowerCase().includes(needle) ||
        p.tags.some((tag) => tag.includes(needle)),
    );
  }
  if (query.category) items = items.filter((p) => p.category.slug === query.category);
  if (query.brands?.length) items = items.filter((p) => query.brands!.includes(p.brand));
  if (query.tags?.length) items = items.filter((p) => p.tags.some((t) => query.tags!.includes(t)));
  if (query.minPrice !== undefined) items = items.filter((p) => p.priceMillimes >= query.minPrice!);
  if (query.maxPrice !== undefined) items = items.filter((p) => p.priceMillimes <= query.maxPrice!);
  if (query.minRating !== undefined) items = items.filter((p) => p.rating >= query.minRating!);
  if (query.inStock) items = items.filter((p) => p.stock > 0);
  if (query.onSale) items = items.filter((p) => Boolean(p.compareAtMillimes));
  if ((query as { featured?: boolean }).featured) items = items.filter((p) => p.isFeatured);

  switch (query.sort) {
    case 'price-asc':
      items.sort((a, b) => a.priceMillimes - b.priceMillimes);
      break;
    case 'price-desc':
      items.sort((a, b) => b.priceMillimes - a.priceMillimes);
      break;
    case 'rating':
      items.sort((a, b) => b.rating - a.rating);
      break;
    case 'popular':
      items.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    default:
      break;
  }

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 12;
  const total = items.length;

  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function mockFacets(query: ProductQuery = {}): CatalogFacets {
  const pool = mockFindProducts({ ...query, brands: undefined, tags: undefined, pageSize: 999 }).items;
  const count = (values: string[]) => {
    const map = new Map<string, number>();
    for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
    return [...map.entries()]
      .map(([value, n]) => ({ value, count: n }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  };

  const prices = pool.map((p) => p.priceMillimes);
  return {
    brands: count(pool.map((p) => p.brand)),
    tags: count(pool.flatMap((p) => p.tags)).slice(0, 20),
    priceRange: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
  };
}

export function mockFindProduct(slug: string): Product {
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!product) throw new Error(`No sample product with the slug "${slug}".`);
  return product;
}

export function mockRelated(slug: string): Product[] {
  const product = mockFindProduct(slug);
  const seen = new Set([product.category.slug]);
  const out: Product[] = [];
  for (const candidate of MOCK_PRODUCTS) {
    if (seen.has(candidate.category.slug)) continue;
    out.push(candidate);
    seen.add(candidate.category.slug);
    if (out.length === 4) break;
  }
  return out;
}

export interface SetupPresetSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  style: 'PERFORMANCE' | 'BALANCED' | 'AESTHETIC';
  totalMillimes: number;
  items: { role: string; product: Product }[];
}

const buildPreset = (
  slug: string,
  name: string,
  description: string,
  style: SetupPresetSummary['style'],
  roles: string[],
  index: number,
): SetupPresetSummary => {
  const items = roles
    .map((role) => {
      const pool = MOCK_PRODUCTS.filter((p) => p.category.slug === role);
      return { role, product: pool[Math.min(index, pool.length - 1)] };
    })
    .filter((item) => Boolean(item.product));
  return {
    id: `preset-${slug}`,
    slug,
    name,
    description,
    style,
    items,
    totalMillimes: items.reduce((sum, item) => sum + item.product.priceMillimes, 0),
  };
};

export const MOCK_SETUPS: SetupPresetSummary[] = [
  buildPreset(
    'first-desk',
    'First desk',
    'Everything you need to play properly, nothing you will replace in a month.',
    'BALANCED',
    ['mice', 'keyboards', 'headsets', 'monitors'],
    0,
  ),
  buildPreset(
    'ranked-ready',
    'Ranked ready',
    'High refresh, low latency, and a chair that survives a five-hour queue.',
    'PERFORMANCE',
    ['mice', 'keyboards', 'headsets', 'monitors', 'chairs'],
    1,
  ),
  buildPreset(
    'stream-room',
    'Stream room',
    'Camera, mic and sound that make a small room read as a studio.',
    'AESTHETIC',
    ['microphones', 'webcams', 'speakers', 'desks', 'monitors'],
    1,
  ),
];
