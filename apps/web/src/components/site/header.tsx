'use client';

import { Heart, Menu, ShoppingBag, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useCartCount } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { useUi } from '@/store/ui';
import { useWishlist } from '@/store/wishlist';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { SearchField } from './search-field';
import { ThemeToggle } from './theme-toggle';

const LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/builder', label: 'Setup builder' },
  { href: '/compatibility', label: 'Compatibility' },
  { href: '/shop?featured=true', label: 'Featured' },
  { href: '/categories/monitors', label: 'Monitors' },
  { href: '/categories/keyboards', label: 'Keyboards' },
];

export function Header() {
  const pathname = usePathname();
  const count = useCartCount();
  const openCart = useUi((state) => state.openCart);
  const user = useAuth((state) => state.user);
  const wishlistCount = useWishlist((state) => state.ids.length);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/85 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-4">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="-ml-2 grid h-10 w-10 place-items-center rounded-full text-ink md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-full px-3 py-2 text-sm text-muted transition-colors hover:text-ink',
                pathname === link.href && 'text-ink',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-xs lg:block">
          <Suspense fallback={null}>
            <SearchField />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-2">
          <ThemeToggle />

          <Link
            href="/wishlist"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-hairline text-ink transition-colors hover:bg-raised"
            aria-label={`Wishlist${mounted && wishlistCount ? `, ${wishlistCount} items` : ''}`}
          >
            <Heart className="h-4 w-4" />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
            )}
          </Link>

          <Link
            href={user ? '/account' : '/login'}
            className="hidden h-10 w-10 place-items-center rounded-full border border-hairline text-ink transition-colors hover:bg-raised sm:grid"
            aria-label={user ? 'Your account' : 'Log in'}
          >
            <User className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="flex h-10 items-center gap-2 rounded-full bg-ink pl-4 pr-3 text-sm font-medium text-paper transition-transform duration-200 ease-set active:scale-[0.98]"
            aria-label={`Open cart${mounted && count ? `, ${count} items` : ', empty'}`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="tabular min-w-[1.25rem] rounded-full bg-paper/15 px-1.5 text-center">
              {mounted ? count : 0}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-hairline bg-paper px-5 pb-5 pt-4 md:hidden">
          <Suspense fallback={null}>
            <SearchField className="mb-3" />
          </Suspense>
          <nav className="hairline-x flex flex-col" aria-label="Mobile">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="py-3 text-sm text-ink">
                {link.label}
              </Link>
            ))}
            <Link href={user ? '/account' : '/login'} className="py-3 text-sm text-ink">
              {user ? 'Your account' : 'Log in'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
