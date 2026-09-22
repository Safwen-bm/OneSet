'use client';

import { formatPrice } from '@oneset/types';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { buttonStyles } from '@/lib/button-styles';
import { ordersApi } from '@/lib/api';

const STATUS_COPY: Record<string, string> = {
  PENDING: 'Waiting on payment',
  PROCESSING: 'Payment received getting your order ready',
  SHIPPED: 'On its way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export function OrderView({ id }: { id: string }) {
  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
  });

  if (isLoading) {
    return <div className="container py-20 text-sm text-muted">Loading your order…</div>;
  }

  if (isError || !order) {
    return (
      <div className="container flex min-h-[50vh] max-w-lg flex-col justify-center py-20 text-center">
        <h1 className="text-title">We could not find that order</h1>
        <Link href="/account" className={buttonStyles({ className: 'mt-8 self-center' })}>
          Back to your account
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-16">
      {order.status !== 'PENDING' && (
        <div className="mb-6 flex items-center gap-2 text-positive">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">Order confirmed</span>
        </div>
      )}

      <h1 className="text-title">Order {order.reference}</h1>
      <p className="mt-2 text-muted">{STATUS_COPY[order.status] ?? order.status}</p>

      <ul className="mt-8 hairline-x rounded-panel border border-hairline bg-surface px-5">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 py-3.5 text-sm">
            <div>
              <p>{item.name}</p>
              {item.optionLabel && <p className="text-micro text-muted">{item.optionLabel}</p>}
              <p className="text-micro text-muted">Qty {item.quantity}</p>
            </div>
            <span className="shrink-0 tabular">{formatPrice(item.unitPriceMillimes * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-1.5 rounded-panel border border-hairline bg-surface p-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular">{formatPrice(order.subtotal)}</dd>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted">Discount{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
            <dd className="tabular">−{formatPrice(order.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted">Delivery</dt>
          <dd className="tabular">{order.delivery === 0 ? 'Free' : formatPrice(order.delivery)}</dd>
        </div>
        <div className="flex justify-between border-t border-hairline pt-2 text-base font-medium">
          <dt>Total</dt>
          <dd className="tabular">{formatPrice(order.total)}</dd>
        </div>
      </dl>

      {order.address && (
        <div className="mt-4 rounded-panel border border-hairline bg-surface p-5 text-sm text-muted">
          <p className="text-ink">{order.address.fullName}</p>
          <p>
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ''}
          </p>
          <p>
            {order.address.city}, {order.address.governorate} {order.address.postalCode}
          </p>
          <p>{order.address.phone}</p>
        </div>
      )}

      <Link href="/shop" className={buttonStyles({ className: 'mt-8' })}>
        Keep shopping
      </Link>
    </div>
  );
}
