'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuth((state) => state.register);
  const status = useAuth((state) => state.status);
  const mergeCart = useCart((state) => state.mergeAfterLogin);

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await register(form);
      await mergeCart();
      router.push('/account');
    } catch (cause) {
      setError((cause as Error).message);
    }
  };

  return (
    <div className="container flex min-h-[70vh] max-w-sm flex-col justify-center py-16">
      <h1 className="text-title">Create an account</h1>
      <p className="mb-8 mt-2 text-sm text-muted">
        Faster checkout, saved addresses, and your wishlist on every device.
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <Input value={form.firstName} onChange={update('firstName')} autoComplete="given-name" required />
          </Field>
          <Field label="Last name">
            <Input value={form.lastName} onChange={update('lastName')} autoComplete="family-name" required />
          </Field>
        </div>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={update('email')} autoComplete="email" required />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input
            type="password"
            value={form.password}
            onChange={update('password')}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-tile border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-muted">
          Already have one?{' '}
          <Link href="/login" className="text-ink underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
