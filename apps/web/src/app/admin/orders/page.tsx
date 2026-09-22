'use client';

import { formatPrice } from '@oneset/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ordersApi, type Order } from '@/lib/api';
import { cn } from '@/lib/utils';

const STATUSES: Order['status'][] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_STYLE: Record<Order['status'], string> = {
  PENDING: 'text-muted',
  PROCESSING: 'text-accent',
  SHIPPED: 'text-accent',
  DELIVERED: 'text-positive',
  CANCELLED: 'text-danger',
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Order['status'] | ''>('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', status, search],
    queryFn: () => ordersApi.allAdmin({ status: status || undefined, search: search || undefined, pageSize: 50 }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: Order['status'] }) => ordersApi.updateStatus(id, next),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search reference or email…"
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as Order['status'] | '')}
          className="h-11 rounded-full border border-hairline bg-surface px-4 text-sm text-ink focus:outline-none"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-panel border border-hairline bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-micro text-muted">
                <th className="px-4 py-3 font-normal">Reference</th>
                <th className="px-4 py-3 font-normal">Customer</th>
                <th className="px-4 py-3 font-normal">Total</th>
                <th className="px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="hairline-x">
              {data?.items.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="hover:underline">
                      {order.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3 tabular">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(event) =>
                        updateStatus.mutate({ id: order.id, next: event.target.value as Order['status'] })
                      }
                      className={cn(
                        'h-9 rounded-full border border-hairline bg-surface px-3 text-sm focus:outline-none',
                        STATUS_STYLE[order.status],
                      )}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.items.length === 0 && (
            <p className="p-8 text-center text-sm text-muted">No orders match those filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
