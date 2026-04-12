'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricePoint {
  date: string;
  price: number;
  raw: string;
}

interface ApiResponse {
  series: PricePoint[];
  count: number;
  current: string | null;
  min: number | null;
  max: number | null;
  deltaPct: number | null;
}

interface PriceHistoryProps {
  offerId: string;
  className?: string;
  /** Hide entirely if we have fewer than this many data points. */
  minPoints?: number;
}

/**
 * Sparkline + delta badge for an offer's observed price history.
 *
 * Data is click-sampled (see /go/[slug] route), so early-life offers won't
 * have enough points to plot. The component renders a small explainer
 * instead of an empty/broken graph during that warm-up period.
 */
export function PriceHistory({ offerId, className, minPoints = 3 }: PriceHistoryProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/offer-price-history?offer_id=${encodeURIComponent(offerId)}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: ApiResponse | null) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        // Silent — fallback UI renders.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [offerId]);

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-4 w-24 rounded bg-muted mb-2" />
        <div className="h-8 w-full rounded bg-muted" />
      </div>
    );
  }

  if (!data || data.count < minPoints) {
    return (
      <div className={cn('text-xs text-muted-foreground leading-relaxed', className)}>
        <p className="font-medium text-foreground mb-1">Price trend</p>
        <p>
          We&apos;re tracking this product&apos;s price. Check back in a few days once we have enough
          data points to draw a trend.
        </p>
      </div>
    );
  }

  const { series, deltaPct, min, max, current } = data;
  const delta = deltaPct ?? 0;
  const direction = delta < -0.5 ? 'down' : delta > 0.5 ? 'up' : 'flat';
  const DeltaIcon = direction === 'down' ? TrendingDown : direction === 'up' ? TrendingUp : Minus;
  const deltaColor =
    direction === 'down'
      ? 'text-emerald-600 dark:text-emerald-400'
      : direction === 'up'
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-muted-foreground';
  const deltaLabel =
    direction === 'down'
      ? `${Math.abs(delta).toFixed(1)}% lower`
      : direction === 'up'
      ? `${delta.toFixed(1)}% higher`
      : 'Stable';

  // Build an inline SVG sparkline so we don't ship a chart library.
  const width = 160;
  const height = 40;
  const padding = 2;
  const minVal = min ?? series[0].price;
  const maxVal = max ?? series[series.length - 1].price;
  const range = Math.max(maxVal - minVal, 0.0001);
  const points = series
    .map((p, i) => {
      const x = padding + (i / Math.max(series.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((p.price - minVal) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const sparklineStroke =
    direction === 'down'
      ? 'stroke-emerald-500'
      : direction === 'up'
      ? 'stroke-amber-500'
      : 'stroke-muted-foreground';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Price trend</p>
        <span className={cn('inline-flex items-center gap-1 text-xs font-medium', deltaColor)}>
          <DeltaIcon className="h-3 w-3" aria-hidden="true" />
          {deltaLabel}
        </span>
      </div>
      <svg
        role="img"
        aria-label={`Price history: current ${current ?? 'unknown'}, ${deltaLabel} over ${series.length} observations`}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-10"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={sparklineStroke}
          points={points}
        />
      </svg>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{series[0].date}</span>
        <span>
          {series.length} {series.length === 1 ? 'observation' : 'observations'}
        </span>
        <span>{series[series.length - 1].date}</span>
      </div>
    </div>
  );
}
