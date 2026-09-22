'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuth((state) => state.login);
  const status = useAuth((state) => state.status);
  const mergeCart = useCart((state) => state.mergeAfterLogin);
  const hydrateWishlist = useWishlist((state) => state.hydrateFromServer);

  const [email, setEmail] = useState('demo@oneset.tn');
  const [password, setPassword] = useState('Password123');
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password);
      await Promise.all([mergeCart(), hydrateWishlist()]);
      router.push(params.get('next') ?? '/account');
    } catch (cause) {
      setError((cause as Error).message);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Password">
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </Field>

      {error && (
        <p role="alert" className="rounded-tile border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'Logging in…' : 'Log in'}
      </Button>

      <p className="text-center text-sm text-muted">
        New here?{' '}
        <Link href="/register" className="text-ink underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="container flex min-h-[70vh] max-w-sm flex-col justify-center py-16">
      <h1 className="text-title">Log in</h1>
      <p className="mb-8 mt-2 text-sm text-muted">
        The seeded demo account is filled in for you. Your guest cart moves across on login.
      </p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
