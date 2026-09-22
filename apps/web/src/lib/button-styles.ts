import { cn } from './utils';

export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink/88',
  accent: 'bg-accent text-accent-ink hover:brightness-110',
  outline: 'border border-hairline bg-surface text-ink hover:border-ink/40',
  ghost: 'text-ink hover:bg-raised',
  danger: 'border border-hairline text-danger hover:bg-danger/10',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
  icon: 'h-10 w-10',
};

/**
 * Plain module (no 'use client') so Server Components can style a Link with it.
 * A helper exported from a client component would arrive here as a client reference and blow up at render time.
 */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,border-color,transform] duration-200 ease-set',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45',
    variants[variant],
    sizes[size],
    className,
  );
}
