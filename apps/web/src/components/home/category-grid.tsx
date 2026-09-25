'use client';

import {
  ArrowUpRight,
  Armchair,
  Camera,
  CircuitBoard,
  Cpu,
  Gamepad2,
  HardDrive,
  Headphones,
  Keyboard,
  LampDesk,
  MemoryStick,
  Mic2,
  Monitor,
  Mouse,
  Package,
  Volume2,
} from 'lucide-react';
import Link from 'next/link';
import type { ComponentType } from 'react';
import { useCategories } from '@/hooks/use-catalog';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  mice: Mouse,
  keyboards: Keyboard,
  headsets: Headphones,
  monitors: Monitor,
  controllers: Gamepad2,
  'graphics-cards': CircuitBoard,
  processors: Cpu,
  chairs: Armchair,
  desks: LampDesk,
  'console-accessories': Package,
  storage: HardDrive,
  memory: MemoryStick,
  microphones: Mic2,
  webcams: Camera,
  speakers: Volume2,
};

export function CategoryGrid() {
  const { data, isLoading } = useCategories();

  return (
    <section data-header-transparent="light" className="relative w-full overflow-hidden bg-paper py-16">
      <div
        className="absolute inset-0 bg-scroll bg-cover bg-center sm:bg-fixed"
        style={{ backgroundImage: "url('/images/category-grid-bg.jpg')" }}
        role="img"
        aria-label=""
      />
      <div className="absolute inset-0 bg-paper/70" />

      <div className="container relative">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1.5 font-mono text-micro uppercase tracking-widest text-muted">
              Browse
            </p>
            <h2 className="text-title text-ink">Start with one piece</h2>
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
          >
            All products
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {data?.map((category, index) => {
              const Icon = CATEGORY_ICONS[category.slug] ?? Package;
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative flex h-32 flex-col justify-between overflow-hidden rounded-tile border border-hairline bg-surface/70 p-4 backdrop-blur-sm transition-[border-color,transform,background-color] duration-300 ease-set hover:-translate-y-1 hover:border-accent/40 hover:bg-surface"
                >
                  <span className="pointer-events-none absolute -right-1 -top-3 select-none font-display text-6xl font-semibold text-ink/[0.04] transition-colors duration-300 group-hover:text-accent/[0.08]">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="relative flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-tile border border-hairline bg-raised text-ink transition-colors duration-300 group-hover:border-accent/50 group-hover:bg-accent group-hover:text-accent-ink">
                      <Icon className="h-4 w-4" />
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  <div className="relative">
                    <span className="block text-sm font-medium leading-tight">{category.name}</span>
                    <span className="mt-1 block font-mono text-micro tabular text-muted">
                      {String(category.productCount ?? 0).padStart(3, '0')} in stock
                    </span>
                  </div>

                  <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-300 ease-set group-hover:scale-x-100" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}