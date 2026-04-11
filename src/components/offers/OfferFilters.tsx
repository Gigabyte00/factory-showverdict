'use client';

/**
 * OfferFilters — Phase 2B
 *
 * Client-side filter sidebar/drawer for the /offers listing page.
 * State is synced to URL search params so filtered views are shareable.
 *
 * Props:
 *   minRating    — minimum star rating filter options to show (e.g., [4, 4.5])
 *   availableAwards — award badge labels from DB (e.g., ["Editor's Choice", "Best Value"])
 *   onFilter     — callback with current filter state
 */

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { SlidersHorizontal, Star, Award, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface OfferFilterState {
  minRating: number | null;
  award: string | null;
  sort: 'recommended' | 'rating' | 'price_asc' | 'price_desc' | 'most_clicked';
}

interface OfferFiltersProps {
  availableAwards?: string[];
  className?: string;
}

const SORT_OPTIONS: Array<{ value: OfferFilterState['sort']; label: string }> = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'most_clicked', label: 'Most Popular' },
];

const RATING_OPTIONS = [4.5, 4, 3.5];

export function OfferFilters({ availableAwards = [], className }: OfferFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const minRating = params.get('minRating') ? Number(params.get('minRating')) : null;
  const award = params.get('award') || null;
  const sort = (params.get('sort') as OfferFilterState['sort']) || 'recommended';

  const activeFilterCount = [minRating, award].filter(Boolean).length;

  const updateParams = useCallback(
    (updates: Partial<Record<string, string | null>>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === '' || v === 'recommended') {
          next.delete(k);
        } else {
          next.set(k, v);
        }
      }
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`, { scroll: false });
      });
    },
    [params, pathname, router]
  );

  const clearAll = () =>
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });

  return (
    <div className={cn('space-y-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <SlidersHorizontal className="h-4 w-4" />
          Filter & Sort
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sort by
        </p>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParams({ sort: opt.value })}
              className={cn(
                'w-full text-left text-sm px-3 py-2 rounded-lg transition',
                sort === opt.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          <Star className="h-3.5 w-3.5" />
          Minimum Rating
        </p>
        <div className="space-y-1">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => updateParams({ minRating: minRating === r ? null : String(r) })}
              className={cn(
                'w-full flex items-center gap-2 text-left text-sm px-3 py-2 rounded-lg transition',
                minRating === r
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-amber-500">{'★'.repeat(Math.floor(r))}{r % 1 ? '½' : ''}</span>
              <span>{r}+ stars</span>
            </button>
          ))}
        </div>
      </div>

      {/* Awards */}
      {availableAwards.length > 0 && (
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            <Award className="h-3.5 w-3.5" />
            Awards
          </p>
          <div className="flex flex-wrap gap-1.5">
            {availableAwards.map((a) => (
              <button
                key={a}
                onClick={() => updateParams({ award: award === a ? null : a })}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-full border transition',
                  award === a
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={clearAll}>
          <X className="h-3.5 w-3.5" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

export default OfferFilters;
