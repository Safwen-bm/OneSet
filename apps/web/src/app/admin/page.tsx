'use client';

import { formatPrice } from '@oneset/types';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-panel border border-hairline bg-surface p-5">
      <p className="text-micro text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: () => adminApi.stats() });

  if (isLoading) {
    return <p className="text-sm text-muted">Loading dashboard…</p>;
  }

  if (!stats) {
    return <p className="text-sm text-muted">Could not load the dashboard.</p>;
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Revenue (paid orders)" value={formatPrice(stats.revenueMillimes)} />
        <StatCard label="Total orders" value={String(stats.totalOrders)} />
        <StatCard label="Customers" value={String(stats.customerCount)} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="text-heading">Low stock</h2>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-muted">Nothing below the threshold right now.</p>
          ) : (
            <ul className="hairline-x rounded-panel border border-hairline bg-surface px-5">
              {stats.lowStock.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <Link href={`/admin/products/${product.slug}/edit`} className="hover:underline">
                    {product.name}
                  </Link>
                  <span className="tabular text-warning">{product.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-heading">Top products</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-muted">No paid orders yet.</p>
          ) : (
            <ul className="hairline-x rounded-panel border border-hairline bg-surface px-5">
              {stats.topProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <Link href={`/admin/products/${product.slug}/edit`} className="hover:underline">
                    {product.name}
                  </Link>
                  <span className="tabular text-muted">{product.unitsSold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
