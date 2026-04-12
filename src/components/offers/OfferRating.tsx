'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfferRatingProps {
  offerId: string;
  /** Optional initial aggregate if the parent has already fetched it (SSR). */
  initialAverage?: number;
  initialCount?: number;
  /** Visual size — "sm" for cards, "md" for detail pages. */
  size?: 'sm' | 'md';
  className?: string;
}

interface AggregateResponse {
  average: number;
  count: number;
  userRating: number | null;
}

/**
 * Crowd-rating widget for a single offer. Reader hovers to preview, clicks to
 * submit. Stores one rating per IP-hash per offer server-side; returning users
 * see their existing rating highlighted and can change it.
 *
 * Render strategy: the widget fetches the current aggregate + the user's prior
 * rating once on mount. We don't block render on that fetch — we show the
 * `initialAverage` (if provided) or a placeholder until the fetch resolves.
 * This avoids SSR/CSR mismatch (the IP-dependent `userRating` can't be known
 * at SSR time).
 */
export function OfferRating({
  offerId,
  initialAverage,
  initialCount,
  size = 'sm',
  className,
}: OfferRatingProps) {
  const [aggregate, setAggregate] = useState<AggregateResponse | null>(
    initialAverage !== undefined
      ? { average: initialAverage, count: initialCount ?? 0, userRating: null }
      : null
  );
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    let cancelled = false;

    async function fetchAggregate() {
      try {
        const res = await fetch(`/api/offer-ratings?offer_id=${encodeURIComponent(offerId)}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = (await res.json()) as AggregateResponse;
        if (!cancelled) setAggregate(data);
      } catch {
        // Silent — widget continues with initial aggregate or falls back to empty.
      }
    }
    fetchAggregate();
    return () => {
      cancelled = true;
    };
  }, [offerId]);

  const submit = useCallback(
    async (rating: number) => {
      if (submitting) return;
      setSubmitting(true);
      setError(null);
      setFeedback(null);
      try {
        const res = await fetch('/api/offer-ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offer_id: offerId, rating }),
        });
        const data = (await res.json()) as AggregateResponse & { error?: string };
        if (!res.ok) {
          setError(data.error || 'Could not submit rating');
          return;
        }
        setAggregate({
          average: data.average,
          count: data.count,
          userRating: data.userRating ?? rating,
        });
        setFeedback(data.userRating === rating ? 'Thanks for rating!' : 'Rating updated');
      } catch {
        setError('Could not submit rating — please try again');
      } finally {
        setSubmitting(false);
      }
    },
    [offerId, submitting]
  );

  const displayRating = hoverRating ?? aggregate?.userRating ?? Math.round(aggregate?.average ?? 0);
  const starSize = size === 'md' ? 'h-6 w-6' : 'h-4 w-4';
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';

  // Auto-dismiss feedback after 2.5s
  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), 2500);
    return () => window.clearTimeout(id);
  }, [feedback]);

  return (
    <div className={cn('inline-flex flex-col gap-1', className)} data-testid="offer-rating">
      <div
        className="flex items-center gap-0.5"
        role="radiogroup"
        aria-label="Rate this offer"
        onMouseLeave={() => setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= displayRating;
          const isUser = aggregate?.userRating === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={aggregate?.userRating === n}
              aria-label={`Rate ${n} star${n === 1 ? '' : 's'}`}
              disabled={submitting}
              onMouseEnter={() => setHoverRating(n)}
              onFocus={() => setHoverRating(n)}
              onClick={() => submit(n)}
              className={cn(
                'p-0.5 rounded transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                !submitting && 'hover:scale-110 cursor-pointer',
                submitting && 'cursor-wait opacity-60'
              )}
            >
              <Star
                className={cn(
                  starSize,
                  'transition-colors',
                  filled
                    ? isUser
                      ? 'fill-primary text-primary'
                      : 'fill-yellow-400 text-yellow-400'
                    : 'fill-muted text-muted-foreground/40'
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      <div className={cn('flex items-center gap-2', textSize, 'text-muted-foreground')} aria-live="polite">
        {aggregate ? (
          aggregate.count > 0 ? (
            <span>
              <span className="font-medium text-foreground">{aggregate.average.toFixed(1)}</span>
              {' / 5 · '}
              <span>
                {aggregate.count} {aggregate.count === 1 ? 'rating' : 'ratings'}
              </span>
            </span>
          ) : (
            <span>Be the first to rate</span>
          )
        ) : (
          <span className="opacity-0">placeholder</span>
        )}
        {feedback && <span className="text-primary font-medium">{feedback}</span>}
        {error && <span className="text-destructive font-medium">{error}</span>}
      </div>
    </div>
  );
}
