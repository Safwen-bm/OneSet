'use client';

import Link from 'next/link';
import { Logo } from './logo';

const COLUMNS = [
  {
    title: 'CATALOG',
    links: [
      { href: '/shop', label: 'All products' },
      { href: '/categories/mice', label: 'Gaming mice' },
      { href: '/categories/keyboards', label: 'Keyboards' },
      { href: '/categories/monitors', label: 'Monitors' },
      { href: '/shop?onSale=true', label: 'On sale' },
    ],
  },
  {
    title: 'ACCOUNT',
    links: [
      { href: '/login', label: 'Log in' },
      { href: '/register', label: 'Create account' },
      { href: '/wishlist', label: 'Wishlist' },
      { href: '/account', label: 'Orders' },
    ],
  },
  {
    title: 'SUPPORT',
    links: [
      { href: '/shop', label: 'Delivery across Tunisia' },
      { href: '/shop', label: '14-day returns' },
      { href: '/shop', label: 'Local Warranty' },
      { href: '/shop', label: 'Contact Counter' },
    ],
  },
];

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/Safwen-bm' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/safwen-ben-mabrouk' },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-paper text-ink transition-colors duration-200">
      <div className="mx-auto max-w-7xl border-x border-hairline">
        
        {/* Top Header Grid Cell */}
        <div className="grid grid-cols-1 border-b border-hairline lg:grid-cols-12">
          {/* Brand & Mission */}
          <div className="p-8 sm:p-10 lg:col-span-7 lg:border-r border-hairline space-y-4">
            <Logo />
            <p className="max-w-md text-sm text-muted leading-relaxed font-sans">
              Curated PC components and setup gear engineered to exist on the same desk. Express delivery across Tunisia.
            </p>
          </div>

          {/* Newsletter / Drop Alert Block */}
          <div className="p-8 sm:p-10 lg:col-span-5 flex flex-col justify-between space-y-6 bg-raised/40">
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">// NEWSLETTER</span>
              <h4 className="font-display text-sm font-semibold text-ink">Stay synced with gear drops</h4>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center border border-hairline bg-surface focus-within:border-accent">
              <input 
                type="email" 
                placeholder="Enter email address..." 
                className="w-full bg-transparent px-3.5 py-2.5 text-xs text-ink placeholder:text-muted focus:outline-none"
              />
              <button 
                type="submit" 
                className="border-l border-hairline bg-accent-soft/30 px-4 py-2.5 font-mono text-xs font-semibold text-accent hover:bg-accent hover:text-accent-ink transition-colors whitespace-nowrap"
              >
                JOIN
              </button>
            </form>
          </div>
        </div>

        {/* Modular Navigation Grid */}
        <div className="grid grid-cols-1 border-b border-hairline sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-hairline">
          {/* Socials / Meta Column */}
          <div className="p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-2">
              <span className="font-mono text-xs text-muted">// ECOSYSTEM</span>
              <p className="font-mono text-xs text-ink uppercase tracking-wider font-semibold">OneSet / Deskware</p>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <span className="text-muted block">// CONNECT</span>
              <div className="flex flex-col space-y-2">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
                  >
                    <span>{social.label}</span>
                    <span className="transition-transform group-hover:translate-x-1 text-accent">&rarr;</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Category Link Columns */}
          {COLUMNS.map((column) => (
            <div key={column.title} className="p-8 space-y-4">
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">// {column.title}</span>
              <ul className="space-y-2.5 text-sm font-sans">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-muted transition-colors hover:text-ink hover:underline hover:decoration-accent hover:underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Oversized Architectural Brand Watermark in Ink Color */}
        <div className="group p-8 sm:p-12 border-b border-hairline overflow-hidden select-none bg-paper">
          <span 
            className="block font-display text-[clamp(2.5rem,8.5vw,7.5rem)] font-bold tracking-tighter leading-none text-center sm:text-left text-ink opacity-90 transition-opacity duration-300 group-hover:opacity-100"
            style={{ color: 'hsl(225 12% 7%)' }}
          >
            ONESET SETUP
          </span>
        </div>

        {/* Technical Specification Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 font-mono text-xs text-muted divide-y sm:divide-y-0 sm:divide-x divide-hairline">
          <div className="p-4 flex items-center justify-center sm:justify-start gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
            </span>
            <span className="text-ink font-medium">STATUS: OPERATIONAL</span>
          </div>
          <div className="p-4 text-center">
            <span>&copy; {new Date().getFullYear()} ONESET // <span className="text-ink">SAFWEN BEN MABROUK</span></span>
          </div>
          <div className="p-4 text-center sm:text-right">
            <span className="text-accent font-semibold">TUNIS, TN</span>
          </div>
        </div>

      </div>
    </footer>
  );
}