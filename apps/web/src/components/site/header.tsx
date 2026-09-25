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

const HEADER_HEIGHT = 64; // px — matches h-16 below, and the pt-16 on <main>

type Variant = 'dark' | 'light' | null;

export function Header() {
  const pathname = usePathname();
  const count = useCartCount();
  const openCart = useUi((state) => state.openCart);
  const user = useAuth((state) => state.user);
  const wishlistCount = useWishlist((state) => state.ids.length);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [variant, setVariant] = useState<Variant>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => setMobileOpen(false), [pathname]);

  // Sections tagged data-header-transparent="dark"|"light" make the header float over
  // them while under the header. "dark" = white text (dark photo), "light" = ink text
  // (light photo). First matching section in DOM order wins if more than one intersects.
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-header-transparent]'));
    if (targets.length === 0) {
      setVariant(null);
      return;
    }

    const intersecting = new Map<Element, boolean>();

    const recompute = () => {
      const active = targets.find((target) => intersecting.get(target));
      if (!active) {
        setVariant(null);
        return;
      }
      const value = active.dataset.headerTransparent === 'light' ? 'light' : 'dark';
      setVariant(value);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => intersecting.set(entry.target, entry.isIntersecting));
        recompute();
      },
      { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px`, threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);

  const transparentBg = variant !== null && !mobileOpen;
  const whiteText = variant === 'dark' && !mobileOpen;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-colors duration-300',
        transparentBg
          ? whiteText
            ? 'border-white/10 bg-white/10'
            : 'border-hairline/60 bg-paper/40'
          : 'border-hairline bg-paper/85',
        whiteText ? 'text-white' : 'text-ink',
      )}
    >
      <div className="container flex h-16 items-center gap-4">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className={cn(
            '-ml-2 grid h-10 w-10 place-items-center rounded-full md:hidden',
            whiteText ? 'text-white' : 'text-ink',
          )}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Logo className={whiteText ? 'text-white' : undefined} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-full px-3 py-2 text-sm transition-colors',
                whiteText
                  ? cn('text-white/70 hover:text-white', pathname === link.href && 'text-white')
                  : cn('text-muted hover:text-ink', pathname === link.href && 'text-ink'),
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
            className={cn(
              'relative grid h-10 w-10 place-items-center rounded-full border transition-colors',
              whiteText
                ? 'border-white/25 text-white hover:bg-white/10'
                : 'border-hairline text-ink hover:bg-raised',
            )}
            aria-label={`Wishlist${mounted && wishlistCount ? `, ${wishlistCount} items` : ''}`}
          >
            <Heart className="h-4 w-4" />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent" />
            )}
          </Link>

          <Link
            href={user ? '/account' : '/login'}
            className={cn(
              'hidden h-10 w-10 place-items-center rounded-full border transition-colors sm:grid',
              whiteText
                ? 'border-white/25 text-white hover:bg-white/10'
                : 'border-hairline text-ink hover:bg-raised',
            )}
            aria-label={user ? 'Your account' : 'Log in'}
          >
            <User className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={openCart}
            className={cn(
              'flex h-10 items-center gap-2 rounded-full pl-4 pr-3 text-sm font-medium transition-transform duration-200 ease-set active:scale-[0.98]',
              whiteText ? 'bg-white text-neutral-900' : 'bg-ink text-paper',
            )}
            aria-label={`Open cart${mounted && count ? `, ${count} items` : ', empty'}`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span
              className={cn(
                'tabular min-w-[1.25rem] rounded-full px-1.5 text-center',
                whiteText ? 'bg-black/10' : 'bg-paper/15',
              )}
            >
              {mounted ? count : 0}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-hairline bg-paper px-5 pb-5 pt-4 text-ink md:hidden">
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
