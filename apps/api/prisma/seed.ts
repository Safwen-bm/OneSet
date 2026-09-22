import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Deterministic PRNG so every `db:seed` produces the same catalog. */
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20260916);
const pick = <T>(list: T[]): T => list[Math.floor(random() * list.length)];
const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const chance = (p: number) => random() < p;

const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Images are gradient tokens until real assets land — see README, "Product imagery". */
const gradientToken = (slug: string) => `gradient:${slug}`;

interface CategoryBlueprint {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  brands: string[];
  models: string[];
  editions: string[];
  price: [number, number];
  tags: string[];
  specs: { group: string; label: string; values: string[] }[];
  option?: { name: string; values: { value: string; hex: string }[] };
  count: number;
  blurb: (name: string, brand: string) => string;
}

const GAMING_TAGS = ['esports', 'wireless', 'rgb', 'low-latency'];

const CATEGORIES: CategoryBlueprint[] = [
  {
    name: 'Gaming mice',
    slug: 'mice',
    tagline: 'Light, fast, and shaped to your grip',
    description: 'Wireless and wired mice from 38 g featherweights to full-size ergonomic shells.',
    brands: ['Kinetiq', 'Vantra', 'Halcyon', 'Ferrite'],
    models: ['Aeron', 'Drift', 'Pulse', 'Vector', 'Nomad', 'Quark', 'Rift', 'Lattice'],
    editions: ['Pro', '8K', 'Air', 'Lite', 'Superlight'],
    price: [79_000, 389_000],
    tags: ['wireless', 'lightweight', 'esports', 'ergonomic', 'low-latency'],
    option: {
      name: 'Colour',
      values: [
        { value: 'Graphite', hex: '#2B2D31' },
        { value: 'Chalk', hex: '#EDEDE8' },
        { value: 'Cobalt', hex: '#2436FF' },
      ],
    },
    specs: [
      { group: 'Sensor', label: 'DPI', values: ['26,000', '30,000', '36,000'] },
      { group: 'Sensor', label: 'Polling rate', values: ['1,000 Hz', '4,000 Hz', '8,000 Hz'] },
      { group: 'Build', label: 'Weight', values: ['38 g', '49 g', '58 g', '63 g'] },
      {
        group: 'Build',
        label: 'Switches',
        values: ['Optical, 100 M clicks', 'Mechanical, 70 M clicks'],
      },
      {
        group: 'Connectivity',
        label: 'Connection',
        values: ['2.4 GHz + Bluetooth', 'Wired USB-C', '2.4 GHz'],
      },
      { group: 'Battery', label: 'Battery life', values: ['70 h', '95 h', '140 h'] },
    ],
    count: 9,
    blurb: (name) =>
      `${name} tracks clean at speed and disappears into your hand after an hour of play.`,
  },
  {
    name: 'Keyboards',
    slug: 'keyboards',
    tagline: 'Sound and feel you actually chose',
    description: 'Hot-swappable 60% boards up to full-size, gasket-mounted and pre-lubed.',
    brands: ['Tessera', 'Kinetiq', 'Norvik', 'Sablecraft'],
    models: ['Monolith', 'Basalt', 'Slate', 'Meridian', 'Tonal', 'Cascade', 'Iron', 'Anvil'],
    editions: ['65%', 'TKL', 'Full', 'HE', 'Wireless'],
    price: [119_000, 749_000],
    tags: ['hot-swap', 'wireless', 'mechanical', 'rgb', 'silent'],
    option: {
      name: 'Switch',
      values: [
        { value: 'Linear', hex: '#E23B3B' },
        { value: 'Tactile', hex: '#8B5E34' },
        { value: 'Hall effect', hex: '#2436FF' },
      ],
    },
    specs: [
      {
        group: 'Layout',
        label: 'Form factor',
        values: ['60%', '65%', 'TKL (87)', 'Full-size (104)'],
      },
      { group: 'Build', label: 'Mount', values: ['Gasket', 'Top mount', 'Tray mount'] },
      {
        group: 'Build',
        label: 'Case',
        values: ['CNC aluminium', 'Polycarbonate', 'ABS + steel plate'],
      },
      { group: 'Switches', label: 'Hot-swap', values: ['Yes, 3 and 5 pin', 'Soldered'] },
      { group: 'Connectivity', label: 'Connection', values: ['USB-C', '2.4 GHz + BT + USB-C'] },
      { group: 'Keycaps', label: 'Profile', values: ['Cherry PBT', 'OEM PBT', 'MT3 PBT'] },
    ],
    count: 9,
    blurb: (name) =>
      `${name} ships pre-lubed and gasket-mounted, so it sounds finished out of the box.`,
  },
  {
    name: 'Headsets',
    slug: 'headsets',
    tagline: 'Hear the step before you see it',
    description: 'Closed-back gaming headsets and open-back pairs for long sessions.',
    brands: ['Aurelis', 'Lumen Labs', 'Halcyon', 'Vantra'],
    models: ['Vireo', 'Echo', 'Canyon', 'Halo', 'Reverb', 'Auric', 'Sonder', 'Tide'],
    editions: ['Pro', 'Wireless', 'Studio', 'Open', 'X'],
    price: [149_000, 899_000],
    tags: ['wireless', 'anc', 'open-back', 'surround', 'low-latency'],
    option: {
      name: 'Colour',
      values: [
        { value: 'Black', hex: '#141416' },
        { value: 'Bone', hex: '#E8E4DA' },
      ],
    },
    specs: [
      {
        group: 'Audio',
        label: 'Drivers',
        values: ['50 mm dynamic', '40 mm planar', '53 mm dynamic'],
      },
      { group: 'Audio', label: 'Frequency response', values: ['20 Hz – 20 kHz', '10 Hz – 40 kHz'] },
      {
        group: 'Mic',
        label: 'Microphone',
        values: ['Detachable cardioid', 'Retractable', 'Boom, noise-gated'],
      },
      {
        group: 'Connectivity',
        label: 'Connection',
        values: ['2.4 GHz + BT', 'USB-C + 3.5 mm', 'Wired 3.5 mm'],
      },
      { group: 'Comfort', label: 'Weight', values: ['268 g', '295 g', '330 g'] },
      { group: 'Battery', label: 'Battery life', values: ['24 h', '40 h', '70 h'] },
    ],
    count: 8,
    blurb: (name) =>
      `${name} keeps footsteps and voice chat in separate lanes instead of one loud mush.`,
  },
  {
    name: 'Monitors',
    slug: 'monitors',
    tagline: 'The part of the setup you stare at',
    description: 'High-refresh IPS and OLED panels from 24" esports to 34" ultrawide.',
    brands: ['Orbita', 'Lumen Labs', 'Norvik', 'Cobalt Works'],
    models: ['Vista', 'Horizon', 'Aperture', 'Panorama', 'Facet', 'Clarity', 'Frame', 'Prism'],
    editions: ['240Hz', 'OLED', 'UW', '4K', 'Pro'],
    price: [549_000, 3_890_000],
    tags: ['oled', 'ultrawide', '4k', 'high-refresh', 'hdr'],
    specs: [
      { group: 'Panel', label: 'Size', values: ['24"', '27"', '32"', '34" ultrawide'] },
      {
        group: 'Panel',
        label: 'Resolution',
        values: ['1920 × 1080', '2560 × 1440', '3440 × 1440', '3840 × 2160'],
      },
      { group: 'Panel', label: 'Type', values: ['Fast IPS', 'QD-OLED', 'VA'] },
      { group: 'Performance', label: 'Refresh rate', values: ['165 Hz', '240 Hz', '360 Hz'] },
      { group: 'Performance', label: 'Response time', values: ['0.03 ms', '0.5 ms', '1 ms'] },
      {
        group: 'Ports',
        label: 'Inputs',
        values: ['2× HDMI 2.1, DP 1.4', 'HDMI 2.1, DP 2.1, USB-C 90 W'],
      },
    ],
    count: 9,
    blurb: (name) =>
      `${name} holds colour steady at full refresh, so motion stays readable in a fight.`,
  },
  {
    name: 'Controllers',
    slug: 'controllers',
    tagline: 'Pads with hall-effect sticks and no drift',
    description: 'Wireless pads, fight sticks and pro controllers with back paddles.',
    brands: ['Vantra', 'Kinetiq', 'Ferrite'],
    models: ['Vector', 'Grip', 'Apex', 'Tandem', 'Pivot', 'Clutch'],
    editions: ['Pro', 'Elite', 'Wireless', 'Hall'],
    price: [129_000, 899_000],
    tags: ['hall-effect', 'wireless', 'back-paddles', 'console'],
    option: {
      name: 'Colour',
      values: [
        { value: 'Midnight', hex: '#15161A' },
        { value: 'Arctic', hex: '#F2F2EF' },
      ],
    },
    specs: [
      {
        group: 'Sticks',
        label: 'Stick type',
        values: ['Hall effect, drift-free', 'Potentiometer'],
      },
      { group: 'Inputs', label: 'Back paddles', values: ['4 remappable', '2 remappable', 'None'] },
      {
        group: 'Inputs',
        label: 'Triggers',
        values: ['Hair-trigger stops', 'Analogue, adjustable'],
      },
      {
        group: 'Connectivity',
        label: 'Connection',
        values: ['2.4 GHz + BT + USB-C', 'Bluetooth + USB-C'],
      },
      {
        group: 'Compatibility',
        label: 'Platforms',
        values: ['PC, PS5', 'PC, Xbox, Switch', 'PC, PS5, Switch'],
      },
    ],
    count: 7,
    blurb: (name) => `${name} uses hall-effect sticks, so it still centres perfectly after a year.`,
  },
  {
    name: 'Graphics cards',
    slug: 'graphics-cards',
    tagline: 'Frames, quietly',
    description: 'Triple-fan cards tuned for low noise at high sustained clocks.',
    brands: ['Cobalt Works', 'Norvik', 'Orbita'],
    models: ['Forge', 'Torrent', 'Volt', 'Crag', 'Helix', 'Stratus'],
    editions: ['OC', 'Trinity', 'Ultra', 'Silent'],
    price: [1_190_000, 6_490_000],
    tags: ['ray-tracing', 'triple-fan', 'overclocked', 'quiet'],
    specs: [
      {
        group: 'Memory',
        label: 'VRAM',
        values: ['8 GB GDDR6', '12 GB GDDR6X', '16 GB GDDR7', '24 GB GDDR7'],
      },
      { group: 'Memory', label: 'Bus width', values: ['128-bit', '192-bit', '256-bit', '384-bit'] },
      { group: 'Clocks', label: 'Boost clock', values: ['2,520 MHz', '2,610 MHz', '2,760 MHz'] },
      { group: 'Power', label: 'Recommended PSU', values: ['650 W', '750 W', '850 W', '1000 W'] },
      { group: 'Power', label: 'Connectors', values: ['1× 12V-2x6', '2× 8-pin', '3× 8-pin'] },
      { group: 'Build', label: 'Length', values: ['285 mm', '304 mm', '336 mm'] },
    ],
    count: 7,
    blurb: (name) =>
      `${name} runs its fans below 32 dB under load, which you notice more than the benchmark.`,
  },
  {
    name: 'Processors',
    slug: 'processors',
    tagline: 'The part that decides your 1% lows',
    description: 'Desktop CPUs for gaming, streaming and compile-heavy work.',
    brands: ['Ferrite', 'Cobalt Works'],
    models: ['Core-9', 'Core-7', 'Core-5', 'Axon', 'Meridian', 'Kern'],
    editions: ['X', 'K', '3D', 'Pro'],
    price: [590_000, 3_290_000],
    tags: ['gaming', 'workstation', 'unlocked', 'efficient'],
    specs: [
      {
        group: 'Cores',
        label: 'Cores / threads',
        values: ['6 / 12', '8 / 16', '12 / 24', '16 / 32'],
      },
      { group: 'Clocks', label: 'Boost clock', values: ['5.2 GHz', '5.6 GHz', '5.8 GHz'] },
      { group: 'Platform', label: 'Socket', values: ['AM5', 'LGA 1851'] },
      {
        group: 'Platform',
        label: 'Memory support',
        values: ['DDR5-6000', 'DDR5-6400', 'DDR4-3600'],
      },
      { group: 'Power', label: 'TDP', values: ['65 W', '105 W', '125 W', '170 W'] },
      { group: 'Cooling', label: 'Cooler included', values: ['No', 'Yes, air tower'] },
    ],
    count: 7,
    blurb: (name) =>
      `${name} holds its boost clock long enough to matter in a two-hour session, not just a benchmark run.`,
  },
  {
    name: 'Gaming chairs',
    slug: 'chairs',
    tagline: 'Built for the eighth hour',
    description: 'Mesh and hybrid task chairs with real lumbar adjustment.',
    brands: ['Sablecraft', 'Aurelis', 'Norvik'],
    models: ['Atlas', 'Pillar', 'Verve', 'Column', 'Loom', 'Keel'],
    editions: ['Mesh', 'Ergo', 'Pro', 'Hybrid'],
    price: [690_000, 2_890_000],
    tags: ['mesh', 'lumbar', 'ergonomic', '4d-armrests'],
    option: {
      name: 'Fabric',
      values: [
        { value: 'Charcoal mesh', hex: '#3A3C42' },
        { value: 'Sand mesh', hex: '#C9BFAC' },
        { value: 'Cobalt mesh', hex: '#2436FF' },
      ],
    },
    specs: [
      {
        group: 'Support',
        label: 'Lumbar',
        values: ['Adjustable, 4-way', 'Fixed', 'Dynamic tension'],
      },
      { group: 'Support', label: 'Armrests', values: ['4D', '3D', '2D'] },
      { group: 'Build', label: 'Frame', values: ['Aluminium base', 'Nylon base'] },
      { group: 'Build', label: 'Max load', values: ['120 kg', '136 kg', '150 kg'] },
      { group: 'Comfort', label: 'Recline', values: ['90° – 135°', '90° – 155°'] },
      { group: 'Warranty', label: 'Warranty', values: ['3 years', '5 years', '12 years'] },
    ],
    count: 7,
    blurb: (name) =>
      `${name} adjusts in the places that matter after hour six: lumbar depth, seat tilt, armrest height.`,
  },
  {
    name: 'Desks',
    slug: 'desks',
    tagline: 'Cable management included, not promised',
    description: 'Standing and fixed desks sized for two monitors and a full board.',
    brands: ['Sablecraft', 'Norvik', 'Tessera'],
    models: ['Plateau', 'Bench', 'Riser', 'Span', 'Deck', 'Level'],
    editions: ['Standing', 'Pro', 'Compact', 'XL'],
    price: [790_000, 3_490_000],
    tags: ['standing', 'cable-management', 'solid-wood', 'wide'],
    specs: [
      {
        group: 'Surface',
        label: 'Top size',
        values: ['120 × 60 cm', '140 × 70 cm', '160 × 80 cm', '180 × 80 cm'],
      },
      { group: 'Surface', label: 'Material', values: ['Solid oak', 'Bamboo', 'Laminate over MDF'] },
      {
        group: 'Frame',
        label: 'Height range',
        values: ['62 – 128 cm', '71 – 118 cm', 'Fixed 74 cm'],
      },
      { group: 'Frame', label: 'Motors', values: ['Dual motor', 'Single motor', 'None'] },
      { group: 'Frame', label: 'Load capacity', values: ['80 kg', '100 kg', '125 kg'] },
      { group: 'Extras', label: 'Cable tray', values: ['Included', 'Sold separately'] },
    ],
    count: 7,
    blurb: (name) =>
      `${name} comes with the tray and grommets in the box, so the back of your setup looks intentional.`,
  },
  {
    name: 'Console accessories',
    slug: 'console-accessories',
    tagline: 'For the PlayStation and Xbox side of the room',
    description: 'Charging docks, cooling stands, expansion bays and pro grips.',
    brands: ['Vantra', 'Ferrite', 'Kinetiq'],
    models: ['Dock', 'Stand', 'Bay', 'Grip', 'Hub', 'Cradle'],
    editions: ['Duo', 'Pro', 'Slim', 'Plus'],
    price: [49_000, 449_000],
    tags: ['console', 'charging', 'cooling', 'storage'],
    specs: [
      {
        group: 'Compatibility',
        label: 'Works with',
        values: ['PS5 / PS5 Slim', 'Xbox Series X|S', 'PS5 and Xbox'],
      },
      { group: 'Build', label: 'Material', values: ['ABS + soft-touch', 'Aluminium'] },
      { group: 'Power', label: 'Input', values: ['USB-C 18 W', 'USB-C 30 W', 'Passive'] },
      { group: 'Extras', label: 'Charges controllers', values: ['2 at once', '1', 'No'] },
    ],
    count: 7,
    blurb: (name) => `${name} solves one small annoyance well instead of five badly.`,
  },
  {
    name: 'SSDs',
    slug: 'storage',
    tagline: 'Load screens, shortened',
    description: 'Gen4 and Gen5 NVMe drives, with and without heatsinks.',
    brands: ['Ferrite', 'Quartz', 'Cobalt Works'],
    models: ['Vault', 'Rapid', 'Strata', 'Cell', 'Index', 'Byte'],
    editions: ['Gen4', 'Gen5', 'HS', 'Pro'],
    price: [149_000, 1_290_000],
    tags: ['nvme', 'gen5', 'heatsink', 'console-ready'],
    option: {
      name: 'Capacity',
      values: [
        { value: '1 TB', hex: '#8A8F98' },
        { value: '2 TB', hex: '#5B616B' },
        { value: '4 TB', hex: '#2B2F36' },
      ],
    },
    specs: [
      {
        group: 'Performance',
        label: 'Sequential read',
        values: ['7,000 MB/s', '7,450 MB/s', '12,400 MB/s'],
      },
      {
        group: 'Performance',
        label: 'Sequential write',
        values: ['5,300 MB/s', '6,900 MB/s', '11,800 MB/s'],
      },
      { group: 'Interface', label: 'Interface', values: ['PCIe 4.0 ×4 NVMe', 'PCIe 5.0 ×4 NVMe'] },
      { group: 'Build', label: 'Form factor', values: ['M.2 2280'] },
      { group: 'Endurance', label: 'TBW', values: ['600 TBW', '1,200 TBW', '2,400 TBW'] },
    ],
    count: 7,
    blurb: (name) =>
      `${name} keeps its write speed once the cache is gone, which is where cheap drives fall apart.`,
  },
  {
    name: 'Memory',
    slug: 'memory',
    tagline: 'RAM that posts on the first try',
    description: 'DDR4 and DDR5 kits with tested XMP and EXPO profiles.',
    brands: ['Quartz', 'Ferrite', 'Cobalt Works'],
    models: ['Prism', 'Matrix', 'Lattice', 'Crystal', 'Grid', 'Array'],
    editions: ['RGB', 'Low-profile', 'Pro', 'Neo'],
    price: [179_000, 1_090_000],
    tags: ['ddr5', 'ddr4', 'rgb', 'low-profile', 'expo'],
    specs: [
      {
        group: 'Kit',
        label: 'Capacity',
        values: ['16 GB (2 × 8)', '32 GB (2 × 16)', '64 GB (2 × 32)'],
      },
      { group: 'Kit', label: 'Memory type', values: ['DDR4', 'DDR5'] },
      {
        group: 'Speed',
        label: 'Speed',
        values: ['3,600 MT/s', '6,000 MT/s', '6,400 MT/s', '7,200 MT/s'],
      },
      { group: 'Speed', label: 'Timings', values: ['CL16', 'CL30', 'CL32', 'CL36'] },
      { group: 'Profile', label: 'Profile', values: ['EXPO + XMP 3.0', 'XMP 3.0'] },
      { group: 'Build', label: 'Height', values: ['34 mm low-profile', '44 mm'] },
    ],
    count: 7,
    blurb: (name) =>
      `${name} is binned for its rated profile, so you enable EXPO once and forget about it.`,
  },
  {
    name: 'Microphones',
    slug: 'microphones',
    tagline: 'Sound like you are in the room',
    description: 'USB and XLR condensers and dynamics for streaming and calls.',
    brands: ['Aurelis', 'Lumen Labs', 'Tessera'],
    models: ['Timbre', 'Chord', 'Vox', 'Reed', 'Tone', 'Signal'],
    editions: ['USB', 'XLR', 'Pro', 'Mini'],
    price: [169_000, 1_190_000],
    tags: ['usb', 'xlr', 'cardioid', 'streaming'],
    specs: [
      { group: 'Capsule', label: 'Type', values: ['Dynamic', 'Large-diaphragm condenser'] },
      {
        group: 'Capsule',
        label: 'Polar pattern',
        values: ['Cardioid', 'Cardioid / omni / bidirectional'],
      },
      { group: 'Audio', label: 'Sample rate', values: ['48 kHz / 24-bit', '96 kHz / 24-bit'] },
      { group: 'Connectivity', label: 'Connection', values: ['USB-C', 'XLR', 'USB-C + XLR'] },
      {
        group: 'Controls',
        label: 'On-mic controls',
        values: ['Gain, mute, monitor mix', 'Mute only'],
      },
    ],
    count: 7,
    blurb: (name) =>
      `${name} rejects the room behind it, so your keyboard stops being part of the stream.`,
  },
  {
    name: 'Webcams',
    slug: 'webcams',
    tagline: 'Look better than your lighting deserves',
    description: '1080p and 4K cameras with real sensors, not interpolation.',
    brands: ['Lumen Labs', 'Orbita', 'Aurelis'],
    models: ['Lens', 'Frame', 'Optic', 'View', 'Focus', 'Iris'],
    editions: ['4K', 'Pro', 'HDR', 'Stream'],
    price: [139_000, 899_000],
    tags: ['4k', 'hdr', 'autofocus', 'streaming'],
    specs: [
      {
        group: 'Image',
        label: 'Resolution',
        values: ['1080p 60 fps', '1440p 60 fps', '4K 30 fps'],
      },
      { group: 'Image', label: 'Sensor', values: ['1/2.8" CMOS', '1/1.8" CMOS'] },
      { group: 'Lens', label: 'Field of view', values: ['68°', '78°', '90° adjustable'] },
      { group: 'Lens', label: 'Focus', values: ['Autofocus', 'Fixed focus'] },
      { group: 'Extras', label: 'Privacy shutter', values: ['Built in', 'Clip-on'] },
    ],
    count: 7,
    blurb: (name) =>
      `${name} uses a bigger sensor than the spec-sheet twins around it, so low light stays clean.`,
  },
  {
    name: 'Speakers',
    slug: 'speakers',
    tagline: 'Desktop sound with a real cabinet',
    description: 'Active near-field monitors and compact 2.1 sets for the desk.',
    brands: ['Aurelis', 'Tessera', 'Halcyon'],
    models: ['Nearfield', 'Duet', 'Cabinet', 'Studio', 'Pair', 'Bass'],
    editions: ['Active', '2.1', 'Pro', 'Compact'],
    price: [249_000, 1_890_000],
    tags: ['near-field', 'bluetooth', 'studio', 'subwoofer'],
    specs: [
      {
        group: 'Drivers',
        label: 'Configuration',
        values: ['4" woofer + 1" tweeter', '3" woofer + 0.75" tweeter'],
      },
      { group: 'Power', label: 'Output', values: ['2 × 30 W', '2 × 50 W', '2 × 40 W + 60 W sub'] },
      {
        group: 'Inputs',
        label: 'Inputs',
        values: ['USB-C, 3.5 mm, Bluetooth', 'TRS, RCA, optical'],
      },
      { group: 'Audio', label: 'Frequency response', values: ['56 Hz – 22 kHz', '38 Hz – 25 kHz'] },
    ],
    count: 7,
    blurb: (name) =>
      `${name} gives the desk a stereo image that headphones make you forget exists.`,
  },
];

async function main() {
  console.log('Resetting catalog…');
  await prisma.setupPresetItem.deleteMany();
  await prisma.setupPreset.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.compatibilityRule.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users…');
  await prisma.user.create({
    data: {
      email: 'admin@oneset.tn',
      passwordHash: await bcrypt.hash('Admin123!', 10),
      firstName: 'Nadia',
      lastName: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  await prisma.user.create({
    data: {
      email: 'demo@oneset.tn',
      passwordHash: await bcrypt.hash('Password123', 10),
      firstName: 'Demo',
      lastName: 'Customer',
      emailVerified: true,
    },
  });

  console.log('Creating categories and products…');
  const usedSlugs = new Set<string>();
  const productsByCategory = new Map<string, { id: string; priceMillimes: number }[]>();
  let productCount = 0;

  for (const [index, blueprint] of CATEGORIES.entries()) {
    const category = await prisma.category.create({
      data: {
        name: blueprint.name,
        slug: blueprint.slug,
        tagline: blueprint.tagline,
        description: blueprint.description,
        position: index,
      },
    });

    const created: { id: string; priceMillimes: number }[] = [];

    for (let i = 0; i < blueprint.count; i++) {
      const brand = pick(blueprint.brands);
      const model = pick(blueprint.models);
      const edition = pick(blueprint.editions);
      const name = `${brand} ${model} ${edition}`;

      let slug = slugify(name);
      let suffix = 2;
      while (usedSlugs.has(slug)) slug = `${slugify(name)}-${suffix++}`;
      usedSlugs.add(slug);

      const price = Math.round(between(blueprint.price[0], blueprint.price[1]) / 1000) * 1000;
      const onSale = chance(0.28);
      const compareAt = onSale ? Math.round((price * between(112, 135)) / 100 / 1000) * 1000 : null;
      const reviewCount = between(0, 340);
      const rating = reviewCount === 0 ? 0 : Math.round(between(38, 50)) / 10;

      const tags = [...new Set([pick(blueprint.tags), pick(blueprint.tags), pick(GAMING_TAGS)])];

      const product = await prisma.product.create({
        data: {
          slug,
          name,
          brand,
          shortDescription: blueprint.blurb(model, brand),
          description: [
            blueprint.blurb(model, brand),
            `Part of the ${blueprint.name.toLowerCase()} line-up at OneSet. ${blueprint.description}`,
            'Ships from Tunis in 24 h. Two-year warranty, 14-day returns, no restocking fee.',
          ].join('\n\n'),
          priceMillimes: price,
          compareAtMillimes: compareAt,
          stock: chance(0.08) ? 0 : between(3, 60),
          rating,
          reviewCount,
          tags,
          isFeatured: i === 0 || chance(0.12),
          categoryId: category.id,
          images: {
            create: [
              { url: gradientToken(slug), alt: `${name} front view`, position: 0 },
              { url: gradientToken(`${slug}-2`), alt: `${name} side view`, position: 1 },
              { url: gradientToken(`${slug}-3`), alt: `${name} in a desk setup`, position: 2 },
            ],
          },
          specifications: {
            create: blueprint.specs.map((spec, position) => ({
              group: spec.group,
              label: spec.label,
              value: pick(spec.values),
              position,
            })),
          },
          variants: blueprint.option
            ? {
                create: blueprint.option.values.map((option, vIndex) => ({
                  name: `${name} — ${option.value}`,
                  sku: `${slug.toUpperCase()}-${vIndex + 1}`,
                  optionName: blueprint.option!.name,
                  optionValue: option.value,
                  swatchHex: option.hex,
                  priceMillimes: vIndex === 0 ? price : price + vIndex * between(0, 40) * 1000,
                  stock: between(0, 24),
                })),
              }
            : undefined,
        },
      });

      created.push({ id: product.id, priceMillimes: product.priceMillimes });
      productCount++;
    }

    productsByCategory.set(blueprint.slug, created);
  }

  console.log('Creating curated setups…');
  const cheapest = (slug: string) =>
    [...(productsByCategory.get(slug) ?? [])].sort((a, b) => a.priceMillimes - b.priceMillimes)[0];
  const dearest = (slug: string) =>
    [...(productsByCategory.get(slug) ?? [])].sort((a, b) => b.priceMillimes - a.priceMillimes)[0];
  const middle = (slug: string) => {
    const list = [...(productsByCategory.get(slug) ?? [])].sort(
      (a, b) => a.priceMillimes - b.priceMillimes,
    );
    return list[Math.floor(list.length / 2)];
  };

  const presets = [
    {
      slug: 'first-desk',
      name: 'First desk',
      description: 'Everything you need to play properly, nothing you will replace in a month.',
      style: 'BALANCED' as const,
      picker: cheapest,
      roles: ['mice', 'keyboards', 'headsets', 'monitors'],
    },
    {
      slug: 'ranked-ready',
      name: 'Ranked ready',
      description: 'High refresh, low latency, and a chair that survives a five-hour queue.',
      style: 'PERFORMANCE' as const,
      picker: middle,
      roles: ['mice', 'keyboards', 'headsets', 'monitors', 'chairs'],
    },
    {
      slug: 'stream-room',
      name: 'Stream room',
      description: 'Camera, mic and sound that make a small room read as a studio.',
      style: 'AESTHETIC' as const,
      picker: dearest,
      roles: ['microphones', 'webcams', 'speakers', 'desks', 'monitors'],
    },
  ];

  for (const preset of presets) {
    const items = preset.roles
      .map((role) => ({ role, product: preset.picker(role) }))
      .filter((entry) => Boolean(entry.product));

    await prisma.setupPreset.create({
      data: {
        slug: preset.slug,
        name: preset.name,
        description: preset.description,
        style: preset.style,
        budget: items.reduce((sum, item) => sum + item.product.priceMillimes, 0),
        isCurated: true,
        items: { create: items.map((item) => ({ productId: item.product.id, role: item.role })) },
      },
    });
  }

  console.log('Creating coupons and compatibility rules…');
  await prisma.coupon.createMany({
    data: [
      { code: 'SETUP10', type: 'PERCENT', value: 10, minSubtotal: 300_000 },
      { code: 'WELCOME15', type: 'FIXED', value: 15_000, minSubtotal: 100_000 },
      {
        code: 'EXPIRED',
        type: 'PERCENT',
        value: 50,
        expiresAt: new Date('2025-01-01'),
        isActive: false,
      },
    ],
  });

  await prisma.compatibilityRule.createMany({
    data: [
      {
        name: 'RAM generation matches the CPU',
        sourceCategory: 'processors',
        targetCategory: 'memory',
        sourceSpec: 'Memory support',
        targetSpec: 'Memory type',
        operator: 'startsWith',
        message: 'This CPU platform does not accept that memory generation.',
        severity: 'error',
      },
      {
        name: 'PSU headroom for the GPU',
        sourceCategory: 'graphics-cards',
        targetCategory: 'processors',
        sourceSpec: 'Recommended PSU',
        targetSpec: 'TDP',
        operator: 'gte',
        message: 'This pairing needs more power headroom than your build has.',
        severity: 'warning',
      },
    ],
  });

  console.log(`Done. ${CATEGORIES.length} categories, ${productCount} products.`);
  console.log('Admin: admin@oneset.tn / Admin123!  ·  Customer: demo@oneset.tn / Password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
