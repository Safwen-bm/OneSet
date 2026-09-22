'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { addressApi, type Address, type AddressInput } from '@/lib/api';
import { useAuth, useAuthHydrated } from '@/store/auth';

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

const BLANK: AddressInput = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  governorate: 'Tunis',
  postalCode: '',
  isDefault: false,
};

function AddressForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: AddressInput & { id?: string };
  onCancel: () => void;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AddressInput>(initial);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof AddressInput) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: event.target.value }));

  const mutation = useMutation({
    mutationFn: () => (initial.id ? addressApi.update(initial.id, form) : addressApi.create(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      onSaved();
    },
    onError: (cause) => setError((cause as Error).message),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        mutation.mutate();
      }}
      className="space-y-4 rounded-panel border border-hairline bg-surface p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label">
          <Input value={form.label} onChange={set('label')} placeholder="Home, Office…" />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={set('phone')} required />
        </Field>
      </div>
      <Field label="Full name">
        <Input value={form.fullName} onChange={set('fullName')} required />
      </Field>
      <Field label="Address line 1">
        <Input value={form.line1} onChange={set('line1')} required />
      </Field>
      <Field label="Address line 2 (optional)">
        <Input value={form.line2} onChange={set('line2')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City">
          <Input value={form.city} onChange={set('city')} required />
        </Field>
        <Field label="Governorate">
          <select
            value={form.governorate}
            onChange={set('governorate')}
            className="h-11 w-full rounded-full border border-hairline bg-surface px-4 text-sm text-ink focus:outline-none"
          >
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Postal code">
          <Input value={form.postalCode} onChange={set('postalCode')} required />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={Boolean(form.isDefault)}
          onChange={(event) => setForm((f) => ({ ...f, isDefault: event.target.checked }))}
          className="h-4 w-4 rounded-[4px] border-hairline accent-[hsl(var(--accent))]"
        />
        Make this my default address
      </label>

      {error && (
        <p role="alert" className="rounded-tile border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save address'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddressCard({ address, onEdit }: { address: Address; onEdit: () => void }) {
  const queryClient = useQueryClient();

  const setDefault = useMutation({
    mutationFn: () => addressApi.update(address.id, { isDefault: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const remove = useMutation({
    mutationFn: () => addressApi.remove(address.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  return (
    <div className="flex items-start justify-between gap-4 rounded-panel border border-hairline bg-surface p-5">
      <div className="text-sm">
        <div className="flex items-center gap-2">
          <p className="font-medium text-ink">{address.label}</p>
          {address.isDefault && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-micro text-accent">Default</span>
          )}
        </div>
        <p className="mt-1 text-muted">{address.fullName}</p>
        <p className="text-muted">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ''}
        </p>
        <p className="text-muted">
          {address.city}, {address.governorate} {address.postalCode}
        </p>
        <p className="text-muted">{address.phone}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink"
          aria-label={`Edit ${address.label}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => remove.mutate()}
          className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-danger"
          aria-label={`Delete ${address.label}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        {!address.isDefault && (
          <button
            type="button"
            onClick={() => setDefault.mutate()}
            className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink"
            aria-label={`Make ${address.label} default`}
          >
            <Star className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AddressesPage() {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const hydrated = useAuthHydrated();
  const [editing, setEditing] = useState<Address | 'new' | null>(null);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.list(),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (hydrated && !user) router.replace('/login?next=/account/addresses');
  }, [hydrated, user, router]);

  if (!hydrated || !user) return null;

  return (
    <div className="container max-w-2xl py-16">
      <Link href="/account" className="text-sm text-muted transition-colors hover:text-ink">
        ← Your account
      </Link>
      <div className="mt-3 flex items-center justify-between gap-3">
        <h1 className="text-title">Addresses</h1>
        {editing === null && (
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="h-3.5 w-3.5" />
            Add address
          </Button>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {editing === 'new' && (
          <AddressForm initial={BLANK} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} />
        )}

        {isLoading ? (
          <p className="text-sm text-muted">Loading your addresses…</p>
        ) : addresses && addresses.length > 0 ? (
          addresses.map((address) =>
            editing !== 'new' && editing?.id === address.id ? (
              <AddressForm
                key={address.id}
                initial={{ ...address, line2: address.line2 ?? undefined }}
                onCancel={() => setEditing(null)}
                onSaved={() => setEditing(null)}
              />
            ) : (
              <AddressCard key={address.id} address={address} onEdit={() => setEditing(address)} />
            ),
          )
        ) : editing !== 'new' ? (
          <p className="rounded-panel border border-hairline bg-surface p-6 text-center text-sm text-muted">
            No saved addresses yet. Add one to speed up checkout next time.
          </p>
        ) : null}
      </div>
    </div>
  );
}
