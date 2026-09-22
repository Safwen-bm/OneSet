'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-full border border-hairline bg-surface px-4 text-sm text-ink',
          'placeholder:text-muted focus:border-ink/30 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent',
          className,
        )}
        {...props}
      />
    );
  },
);

export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="block space-y-1.5">
    <span className="text-sm text-muted">{label}</span>
    {children}
    {hint ? <span className="block text-micro text-muted">{hint}</span> : null}
  </label>
);
