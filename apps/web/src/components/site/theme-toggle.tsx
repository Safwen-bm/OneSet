'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="grid h-10 w-10 place-items-center rounded-full border border-hairline text-ink transition-[background-color,transform] duration-200 ease-set hover:bg-raised active:scale-90"
      aria-label={mounted ? `Switch to ${isDark ? 'light' : 'dark'} mode` : 'Switch theme'}
    >
      {mounted && isDark ? (
        <Sun key="sun" className="h-4 w-4 motion-safe:animate-icon-in" />
      ) : (
        <Moon key="moon" className="h-4 w-4 motion-safe:animate-icon-in" />
      )}
    </button>
  );
}
