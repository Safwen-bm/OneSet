'use client';

import { formatPrice } from '@oneset/types';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { addressApi, API_URL, ordersApi, type CheckoutResponse } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth, useAuthHydrated } from '@/store/auth';
import { useCart } from '@/store/cart';

const GOVERNORATES = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Sousse',
  'Sfax',
  'Monastir',
  'Bizerte',
  'Other',
];

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const hydrated = useAuthHydrated();
  const lines = useCart((state) => state.lines);
  const totals = useCart((state) => state.totals)();
  const clearCart = useCart((state) => state.clear);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.list(),
    enabled: Boolean(user && API_URL),
  });

  // 'new' shows the manual form; a real id reuses a saved address and skips it.
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | null>(null);

  useEffect(() => {
    if (selectedAddressId !== null || !addresses) return;
    const fallback = addresses.find((a) => a.isDefault) ?? addresses[0];
    setSelectedAddressId(fallback?.id ?? 'new');
  }, [addresses, selectedAddressId]);

  const [address, setAddress] = useState({
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    governorate: 'Tunis',
    postalCode: '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hydrated && !user) router.replace('/login?next=/checkout');
  }, [hydrated, user, router]);

  if (!API_URL) {
    return (
      <div className="container flex min-h-[60vh] max-w-lg flex-col justify-center py-20 text-center">
        <h1 className="text-title">Checkout needs the API connected</h1>
        <p className="mt-3 text-muted">
          You&apos;re browsing the sample catalog. Start the API with{' '}
          <code className="rounded bg-surface px-1.5 py-0.5">npm run dev:api</code> to place a real
          order.
        </p>
      </div>
    );
  }

  if (!hydrated || !user) return null;

  if (lines.length === 0 && !checkout) {
    return (
      <div className="container flex min-h-[60vh] max-w-lg flex-col justify-center py-20 text-center">
        <h1 className="text-title">Your cart is empty</h1>
        <p className="mt-3 text-muted">Add something first, then come back to check out.</p>
        <Button className="mt-8 self-center" onClick={() => router.push('/shop')}>
          Browse the shop
        </Button>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const usingSaved = selectedAddressId && selectedAddressId !== 'new';
      const response = await ordersApi.checkout({
        addressId: usingSaved ? selectedAddressId : undefined,
        address: usingSaved ? undefined : address,
        couponCode: couponCode.trim() || undefined,
      });
      setCheckout(response);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-title">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {!checkout ? (
            <form onSubmit={submit} className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-heading">Delivery address</h2>
                <Link href="/account/addresses" className="text-micro text-muted transition-colors hover:text-ink">
                  Manage addresses
                </Link>
              </div>

              {addresses && addresses.length > 0 && (
                <div className="space-y-2">
                  {addresses.map((saved) => (
                    <label
                      key={saved.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-tile border px-4 py-3 text-sm transition-colors',
                        selectedAddressId === saved.id
                          ? 'border-ink bg-raised/50'
                          : 'border-hairline hover:border-ink/30',
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === saved.id}
                        onChange={() => setSelectedAddressId(saved.id)}
                        className="mt-1 h-4 w-4 accent-[hsl(var(--accent))]"
                      />
                      <span>
                        <span className="font-medium text-ink">{saved.label}</span>
                        <span className="block text-muted">
                          {saved.fullName} — {saved.line1}, {saved.city}
                        </span>
                      </span>
                    </label>
                  ))}
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-tile border px-4 py-3 text-sm transition-colors',
                      selectedAddressId === 'new'
                        ? 'border-ink bg-raised/50'
                        : 'border-hairline hover:border-ink/30',
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === 'new'}
                      onChange={() => setSelectedAddressId('new')}
                      className="h-4 w-4 accent-[hsl(var(--accent))]"
                    />
                    Use a new address
                  </label>
                </div>
              )}

              {selectedAddressId === 'new' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name">
                      <Input
                        value={address.fullName}
                        onChange={(event) => setAddress((a) => ({ ...a, fullName: event.target.value }))}
                        required
                      />
                    </Field>
                    <Field label="Phone">
                      <Input
                        value={address.phone}
                        onChange={(event) => setAddress((a) => ({ ...a, phone: event.target.value }))}
                        required
                      />
                    </Field>
                  </div>

                  <Field label="Address line 1">
                    <Input
                      value={address.line1}
                      onChange={(event) => setAddress((a) => ({ ...a, line1: event.target.value }))}
                      required
                    />
                  </Field>
                  <Field label="Address line 2 (optional)">
                    <Input
                      value={address.line2}
                      onChange={(event) => setAddress((a) => ({ ...a, line2: event.target.value }))}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="City">
                      <Input
                        value={address.city}
                        onChange={(event) => setAddress((a) => ({ ...a, city: event.target.value }))}
                        required
                      />
                    </Field>
                    <Field label="Governorate">
                      <select
                        value={address.governorate}
                        onChange={(event) => setAddress((a) => ({ ...a, governorate: event.target.value }))}
                        className="h-11 w-full rounded-full border border-hairline bg-surface px-4 text-sm text-ink focus:outline-none"
                      >
                        {GOVERNORATES.map((governorate) => (
                          <option key={governorate} value={governorate}>
                            {governorate}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Postal code">
                      <Input
                        value={address.postalCode}
                        onChange={(event) => setAddress((a) => ({ ...a, postalCode: event.target.value }))}
                        required
                      />
                    </Field>
                  </div>
                </>
              )}

              <h2 className="pt-2 text-heading">Coupon</h2>
              <Input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="SETUP10"
              />

              {error && (
                <p
                  role="alert"
                  className="rounded-tile border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
                >
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Preparing payment…' : 'Continue to payment'}
              </Button>
            </form>
          ) : (
            <div>
              <h2 className="text-heading">Payment</h2>
              <p className="mb-5 mt-1 text-sm text-muted">Order {checkout.order.reference}</p>
              <CheckoutForm
                orderId={checkout.order.id}
                clientSecret={checkout.clientSecret}
                stub={checkout.stub}
                total={formatPrice(checkout.order.total)}
                onSuccess={async () => {
                  await clearCart();
                  router.push(`/orders/${checkout.order.id}`);
                }}
              />
            </div>
          )}
        </div>

        <aside className="h-fit rounded-panel border border-hairline bg-surface p-5">
          <h2 className="text-heading">Order summary</h2>
          <ul className="mt-4 hairline-x">
            {lines.map((line) => (
              <li
                key={`${line.productId}-${line.variantId ?? 'base'}`}
                className="flex justify-between gap-3 py-2.5 text-sm"
              >
                <span className="min-w-0 truncate text-muted">
                  {line.name} × {line.quantity}
                </span>
                <span className="shrink-0 tabular">{formatPrice(line.unitPriceMillimes * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-hairline pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular">{formatPrice(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="tabular">{totals.delivery === 0 ? 'Free' : formatPrice(totals.delivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-hairline pt-2 text-base font-medium">
              <dt>Total</dt>
              <dd className="tabular">{formatPrice(checkout ? checkout.order.total : totals.total)}</dd>
            </div>
          </dl>
          {checkout && checkout.order.discount > 0 && (
            <p className="mt-2 text-micro text-positive">
              Coupon applied — {formatPrice(checkout.order.discount)} off.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
