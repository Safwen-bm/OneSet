import type { Config } from 'tailwindcss';

/**
 * OneSet design tokens.
 * Every colour is a CSS variable so light and dark are the same code path — see globals.css.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem' },
      screens: { '2xl': '1320px' },
    },
    extend: {
      colors: {
        paper: 'hsl(var(--paper))',
        surface: 'hsl(var(--surface))',
        raised: 'hsl(var(--raised))',
        ink: 'hsl(var(--ink))',
        muted: 'hsl(var(--muted))',
        hairline: 'hsl(var(--hairline))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          ink: 'hsl(var(--accent-ink))',
          soft: 'hsl(var(--accent-soft))',
        },
        positive: 'hsl(var(--positive))',
        warning: 'hsl(var(--warning))',
        danger: 'hsl(var(--danger))',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Archivo', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Type scale: 1.25 major third, tightened at display sizes.
        micro: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        display: ['clamp(2.75rem, 7vw, 5.25rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        title: ['clamp(1.75rem, 3.2vw, 2.75rem)', { lineHeight: '1.04', letterSpacing: '-0.03em' }],
        heading: ['1.375rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        tile: '12px',
        panel: '20px',
      },
      spacing: {
        gutter: '1.25rem',
      },
      transitionTimingFunction: {
        set: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        'slot-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'drawer-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'icon-in': {
          '0%': { opacity: '0', transform: 'scale(0.6) rotate(-25deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.18)' },
          '100%': { transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'slot-in': 'slot-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'drawer-in': 'drawer-in 0.32s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        'icon-in': 'icon-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        pop: 'pop 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
        marquee: 'marquee 26s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
