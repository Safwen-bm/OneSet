'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuantityStepper({
  value,
  max,
  onChange,
  className,
  label = 'Quantity',
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn('flex h-10 items-center rounded-full border border-hairline bg-surface', className)}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="grid h-10 w-10 place-items-center rounded-full text-muted transition-[color,transform] duration-150 ease-set hover:text-ink active:scale-90"
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center text-sm tabular" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= Math.min(max, 10)}
        className="grid h-10 w-10 place-items-center rounded-full text-muted transition-[color,transform] duration-150 ease-set hover:text-ink active:scale-90 disabled:opacity-35 disabled:active:scale-100"
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
