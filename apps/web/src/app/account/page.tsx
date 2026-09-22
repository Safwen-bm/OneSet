'use client';

import { formatPrice } from '@oneset/types';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ordersApi } from '@/lib/api';
import { buttonStyles } from '@/lib/button-styles';
import { useAuth, useAuthHydrated } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';

const STATUS_COPY: Record<string, string> = {
  PENDING: 'Waiting on payment',
  PROCESSING: 'Preparing',
  SHIPPED: 'On its way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function AccountPage() {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const hydrated = useAuthHydrated();
  const logout = useAuth((state) => state.logout);
  const totals = useCart((state) => state.totals)();
  const wishlistCount = useWishlist((state) => state.ids.length);
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => ordersApi.mine(),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (hydrated && !user) router.replace('/login?next=/account');
  }, [hydrated, user, router]);

  if (!hydrated || !user) return null;

  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-title">
        {user.firstName} {user.lastName}
      </h1>
      <p className="mt-2 text-muted">{user.email}</p>
      {user.role === 'ADMIN' && (
        <Link
          href="/admin"
          className="mt-3 inline-block text-sm text-accent underline-offset-4 hover:underline"
        >
          Open admin dashboard →
        </Link>
      )}

      <dl className="mt-10 grid gap-px overflow-hidden rounded-panel border border-hairline bg-hairline sm:grid-cols-3">
        <div className="bg-surface p-5">
          <dt className="text-micro text-muted">Cart</dt>
          <dd className="mt-1 font-display text-xl font-semibold tabular">
            {formatPrice(totals.total)}
          </dd>
        </div>
        <div className="bg-surface p-5">
          <dt className="text-micro text-muted">Saved items</dt>
          <dd className="mt-1 font-display text-xl font-semibold tabular">{wishlistCount}</dd>
        </div>
        <div className="bg-surface p-5">
          <dt className="text-micro text-muted">Role</dt>
          <dd className="mt-1 font-display text-xl font-semibold">{user.role.toLowerCase()}</dd>
        </div>
      </dl>

      <section className="mt-10 rounded-panel border border-hairline bg-surface p-6">
        <h2 className="text-heading">Orders</h2>

        {ordersLoading ? (
          <p className="mt-2 text-sm text-muted">Loading your orders…</p>
        ) : orders && orders.length > 0 ? (
          <ul className="mt-4 hairline-x">
            {orders.map((order) => (
              <li key={order.id} className="py-3.5">
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 text-sm hover:underline"
                >
                  <span>
                    <span className="text-ink">{order.reference}</span>
                    <span className="ml-2 text-micro text-muted">
                      {STATUS_COPY[order.status] ?? order.status}
                    </span>
                  </span>
                  <span className="tabular">{formatPrice(order.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">
            No orders yet. Once you check out, they will show up here.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/wishlist" className={buttonStyles({ variant: 'outline', size: 'sm' })}>
            Open wishlist
          </Link>
          <Link href="/account/addresses" className={buttonStyles({ variant: 'outline', size: 'sm' })}>
            Manage addresses
          </Link>
          <Link href="/shop" className={buttonStyles({ size: 'sm' })}>
            Keep shopping
          </Link>
        </div>
      </section>

      <Button
        variant="danger"
        className="mt-8"
        onClick={async () => {
          await logout();
          router.push('/');
        }}
      >
        Log out
      </Button>
    </div>
  );
}
