import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Product art is a deterministic gradient until real photography lands.
 * A `gradient:<seed>` image url renders as art; anything else renders as a real image.
 */
export function gradientFromSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  const hue2 = (hue + 28 + (hash % 40)) % 360;
  const angle = 115 + (hash % 90);
  return {
    backgroundImage: `linear-gradient(${angle}deg, hsl(${hue} 42% 82%), hsl(${hue2} 56% 62%))`,
  } as const;
}

export function isGradientUrl(url?: string | null) {
  return !url || url.startsWith('gradient:');
}

export function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
