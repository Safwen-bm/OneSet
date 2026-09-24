'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ordersApi } from '@/lib/api';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function LivePaymentForm({ orderId, onSuccess }: { orderId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/orders/${orderId}` },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message ?? 'That payment did not go through. Try again.');
      setSubmitting(false);
      return;
    }
    onSuccess();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      {error && (
        <p role="alert" className="rounded-tile border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={!stripe || submitting}>
        {submitting ? 'Processing…' : 'Pay now'}
      </Button>
    </form>
  );
}

/** No Stripe keys configured — the whole checkout flow still runs, just without a real charge. */
function StubPaymentForm({
  orderId,
  total,
  onSuccess,
}: {
  orderId: string;
  total: string;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await ordersApi.confirmStubPayment(orderId);
      onSuccess();
    } catch (cause) {
      setError((cause as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-tile border border-dashed border-hairline bg-raised/50 p-4">
        <p className="text-sm text-ink">
          This is a demo checkout. No payment will be charged.
        </p>
        <div className="mt-4 grid gap-3 opacity-50">
          <div className="flex h-11 items-center rounded-full border border-hairline bg-surface px-4 text-sm text-muted">
            4242 4242 4242 4242
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex h-11 items-center rounded-full border border-hairline bg-surface px-4 text-sm text-muted">
              12/34
            </div>
            <div className="flex h-11 items-center rounded-full border border-hairline bg-surface px-4 text-sm text-muted">
              123
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-tile border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Button size="lg" className="w-full" onClick={submit} disabled={submitting}>
        {submitting ? 'Placing order…' : `Pay ${total}`}
      </Button>
    </div>
  );
}

export function CheckoutForm({
  orderId,
  clientSecret,
  stub,
  total,
  onSuccess,
}: {
  orderId: string;
  clientSecret: string;
  stub: boolean;
  total: string;
  onSuccess: () => void;
}) {
  if (stub || !stripePromise) {
    return <StubPaymentForm orderId={orderId} total={total} onSuccess={onSuccess} />;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <LivePaymentForm orderId={orderId} onSuccess={onSuccess} />
    </Elements>
  );
}
