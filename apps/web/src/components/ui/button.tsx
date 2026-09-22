'use client';

import { forwardRef } from 'react';
import { buttonStyles, type ButtonSize, type ButtonVariant } from '@/lib/button-styles';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', ...props },
  ref,
) {
  return <button ref={ref} className={buttonStyles({ variant, size, className })} {...props} />;
});
