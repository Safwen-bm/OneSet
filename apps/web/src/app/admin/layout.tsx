'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth, useAuthHydrated } from '@/store/auth';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuth((state) => state.user);
  const hydrated = useAuthHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (user === null) {
      router.replace('/login?next=/admin');
    } else if (user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user || user.role !== 'ADMIN') return null;

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
        <h1 className="text-title">Admin</h1>
        <nav className="flex gap-1" aria-label="Admin">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm transition-colors',
                pathname === link.href ? 'bg-ink text-paper' : 'text-muted hover:text-ink',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
