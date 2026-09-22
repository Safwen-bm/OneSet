'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Rating } from '@/components/ui/rating';
import { API_URL, reviewsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/auth';

function StarPicker({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((step) => (
        <button
          key={step}
          type="button"
          role="radio"
          aria-checked={value === step}
          aria-label={`${step} star${step > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(step)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(step)}
          className="p-0.5"
        >
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              step <= (hover || value) ? 'fill-ink text-ink' : 'text-hairline',
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ slug, onDone }: { slug: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => reviewsApi.create(slug, { rating, title: title.trim() || undefined, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'mine', slug] });
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
      onDone();
    },
    onError: (cause) => setError((cause as Error).message),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (rating === 0) {
      setError('Pick a star rating first.');
      return;
    }
    mutation.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-panel border border-hairline bg-surface p-5">
      <div>
        <p className="mb-2 text-sm text-muted">Your rating</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <Field label="Title (optional)">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} />
      </Field>
      <Field label="Your review">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          rows={4}
          maxLength={1000}
          className="w-full rounded-tile border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none"
          placeholder="How has it held up so far?"
        />
      </Field>
      {error && (
        <p role="alert" className="rounded-tile border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Posting…' : 'Post review'}
      </Button>
    </form>
  );
}

export function Reviews({ slug }: { slug: string }) {
  const user = useAuth((state) => state.user);
  const [writing, setWriting] = useState(false);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', slug],
    queryFn: () => reviewsApi.list(slug),
    enabled: Boolean(API_URL),
  });

  const { data: status } = useQuery({
    queryKey: ['reviews', 'mine', slug],
    queryFn: () => reviewsApi.mine(slug),
    enabled: Boolean(API_URL && user),
  });

  if (!API_URL) return null;

  return (
    <section className="mt-16 border-t border-hairline pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-heading">Reviews {reviews?.length ? `(${reviews.length})` : ''}</h2>
        {status?.canReview && !writing && (
          <Button variant="outline" size="sm" onClick={() => setWriting(true)}>
            Write a review
          </Button>
        )}
      </div>

      {status?.alreadyReviewed && (
        <p className="mt-2 text-micro text-muted">You already reviewed this product thanks.</p>
      )}
      {user && !status?.canReview && !status?.alreadyReviewed && (
        <p className="mt-2 text-micro text-muted">
          Reviews open up once your order for this product is on its way.
        </p>
      )}

      {writing && (
        <div className="mt-5">
          <ReviewForm slug={slug} onDone={() => setWriting(false)} />
        </div>
      )}

      <div className="mt-6 hairline-x">
        {isLoading ? (
          <p className="py-6 text-sm text-muted">Loading reviews…</p>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="py-5">
              <div className="flex items-center justify-between gap-3">
                <Rating value={review.rating} showCount={false} />
                <span className="text-micro text-muted">
                  {review.user.firstName} {review.user.lastName[0]}.
                </span>
              </div>
              {review.title && <p className="mt-2 text-sm font-medium">{review.title}</p>}
              <p className="mt-1 text-sm text-muted">{review.body}</p>
            </div>
          ))
        ) : (
          <p className="py-6 text-sm text-muted">No reviews yet be the first once your order arrives.</p>
        )}
      </div>
    </section>
  );
}
