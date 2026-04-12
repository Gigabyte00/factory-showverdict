'use client';

/**
 * ComparisonMatrix — Phase 2A of Authority Hub buildout
 *
 * Interactive comparison table with:
 * - Sortable columns (click header to sort)
 * - Color-coded numeric scores (green/yellow/red scale)
 * - "Best for X" award badges
 * - Mobile-optimized horizontal scroll
 * - Winner highlight per criteria row
 *
 * Usage: Pass server-fetched offer data from feature_matrix JSONB column
 */

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Check, X, Minus, Star, ChevronDown, ChevronUp, ChevronsUpDown, ExternalLink, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatrixProduct {
  id: string;
  name: string;
  image?: string;
  price?: string;
  affiliateUrl?: string;
  rating?: number;
  reviewCount?: number;
  /** 'Editor\'s Choice' | 'Best Value' | 'Best Budget' | 'Best for Beginners' | etc. */
  award?: string;
  /** Numeric scores 0-10 from feature_matrix JSONB */
  scores: Record<string, number | null>;
  /** Boolean/text features */
  features?: Record<string, string | boolean>;
}

export interface MatrixCriteria {
  key: string;
  label: string;
  /** Higher is better (default true) — set false for criteria like "price" where lower wins */
  higherIsBetter?: boolean;
  /** Weight for overall score calculation */
  weight?: number;
  /** Optional description shown as tooltip */
  description?: string;
}

interface ComparisonMatrixProps {
  products: MatrixProduct[];
  criteria: MatrixCriteria[];
  /** Extra boolean/text features to show below scores (e.g., "Free Trial", "Mobile App") */
  featureRows?: string[];
  featureLabels?: Record<string, string>;
  className?: string;
  ctaText?: string;
  title?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns Tailwind color class based on score (0-10 scale) */
function scoreColor(score: number | null, higherIsBetter = true): string {
  if (score === null) return 'text-muted-foreground';
  const normalized = higherIsBetter ? score : 10 - score;
  if (normalized >= 8) return 'text-emerald-600 dark:text-emerald-400 font-semibold';
  if (normalized >= 6) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

/** Returns background highlight for the highest score in a row */
function isBestInRow(score: number | null, allScores: (number | null)[], higherIsBetter = true): boolean {
  if (score === null) return false;
  const valid = allScores.filter((s): s is number => s !== null);
  if (!valid.length) return false;
  const best = higherIsBetter ? Math.max(...valid) : Math.min(...valid);
  return score === best;
}

function renderFeatureValue(value: string | boolean | undefined) {
  if (value === true) return <Check className="h-4 w-4 text-emerald-600 mx-auto" />;
  if (value === false) return <X className="h-4 w-4 text-red-500 mx-auto" />;
  if (value === undefined || value === null || value === '') return <Minus className="h-4 w-4 text-muted-foreground mx-auto" />;
  return <span className="text-xs text-center block">{String(value)}</span>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ComparisonMatrix({
  products,
  criteria,
  featureRows = [],
  featureLabels = {},
  className,
  ctaText = 'View Deal',
  title,
}: ComparisonMatrixProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedFeatures, setExpandedFeatures] = useState(false);

  // Sort products by selected criteria
  const sortedProducts = useMemo(() => {
    if (!sortKey) return products;
    const crit = criteria.find((c) => c.key === sortKey);
    const higherIsBetter = crit?.higherIsBetter !== false;
    return [...products].sort((a, b) => {
      const av = a.scores[sortKey] ?? -1;
      const bv = b.scores[sortKey] ?? -1;
      const dir = sortDir === 'desc' ? -1 : 1;
      return higherIsBetter ? (av - bv) * -dir : (bv - av) * -dir;
    });
  }, [products, sortKey, sortDir, criteria]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ k }: { k: string }) => {
    if (sortKey !== k) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'desc'
      ? <ChevronDown className="h-3 w-3" />
      : <ChevronUp className="h-3 w-3" />;
  };

  // Overall score (weighted average of all criteria)
  const overallScore = (product: MatrixProduct): number => {
    const totalWeight = criteria.reduce((s, c) => s + (c.weight ?? 1), 0);
    const weighted = criteria.reduce((s, c) => {
      const score = product.scores[c.key];
      return s + (score ?? 0) * (c.weight ?? 1);
    }, 0);
    return Math.round((weighted / totalWeight) * 10) / 10;
  };

  const allOverall = sortedProducts.map(overallScore);

  return (
    <div className={cn('my-8', className)}>
      {title && (
        <h2 className="text-xl font-bold mb-4">{title}</h2>
      )}

      {/* Award badges row (above table) */}
      {sortedProducts.some((p) => p.award) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {sortedProducts
            .filter((p) => p.award)
            .map((p) => (
              <div key={p.id} className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                <Award className="h-3 w-3" />
                <span>{p.name}:</span>
                <span>{p.award}</span>
              </div>
            ))}
        </div>
      )}

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 rounded-xl border">
        <table className="w-full min-w-[560px] border-collapse">

          {/* Header — product info */}
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36">
                {sortKey ? (
                  <button
                    onClick={() => { setSortKey(null); }}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Clear sort
                  </button>
                ) : 'Compare'}
              </th>
              {sortedProducts.map((product) => (
                <th key={product.id} className="p-3 text-center relative min-w-[120px]">
                  {product.award && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap font-medium">
                      {product.award}
                    </span>
                  )}
                  {product.image && (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={60}
                      height={40}
                      className="h-10 w-auto object-contain mx-auto mb-1"
                    />
                  )}
                  <p className="font-semibold text-sm text-foreground leading-tight">{product.name}</p>
                  {product.rating != null && (
                    <div className="flex items-center justify-center gap-0.5 mt-0.5">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs text-muted-foreground">
                        {product.rating.toFixed(1)}
                        {product.reviewCount ? ` (${product.reviewCount})` : ''}
                      </span>
                    </div>
                  )}
                </th>
              ))}
            </tr>

            {/* Price row */}
            <tr className="border-b">
              <td className="p-3 text-xs font-medium text-muted-foreground">Price</td>
              {sortedProducts.map((product) => (
                <td key={product.id} className="p-3 text-center">
                  <span className="font-bold text-base">{product.price || '—'}</span>
                </td>
              ))}
            </tr>

            {/* Overall score row */}
            <tr className="border-b bg-primary/5">
              <td className="p-3 text-xs font-semibold text-foreground">Overall Score</td>
              {sortedProducts.map((product) => {
                const score = overallScore(product);
                const best = isBestInRow(score, allOverall, true);
                return (
                  <td key={product.id} className={cn('p-3 text-center', best && 'bg-emerald-50 dark:bg-emerald-950/30')}>
                    <span className={cn('text-lg font-bold', scoreColor(score, true))}>
                      {score}/10
                    </span>
                  </td>
                );
              })}
            </tr>
          </thead>

          {/* Criteria score rows */}
          <tbody>
            {criteria.map((crit, idx) => {
              const allScores = sortedProducts.map((p) => p.scores[crit.key] ?? null);
              return (
                <tr
                  key={crit.key}
                  className={cn('border-b', idx % 2 === 0 ? 'bg-background' : 'bg-muted/20')}
                >
                  <td className="p-3">
                    <button
                      onClick={() => handleSort(crit.key)}
                      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition group"
                      title={crit.description}
                    >
                      {crit.label}
                      <SortIcon k={crit.key} />
                    </button>
                    {crit.weight && crit.weight > 1 && (
                      <span className="text-[10px] text-primary/60 ml-1">×{crit.weight} weight</span>
                    )}
                  </td>
                  {sortedProducts.map((product) => {
                    const score = product.scores[crit.key] ?? null;
                    const best = isBestInRow(score, allScores, crit.higherIsBetter);
                    return (
                      <td
                        key={product.id}
                        className={cn('p-3 text-center transition', best && 'bg-emerald-50 dark:bg-emerald-950/30')}
                      >
                        {score !== null ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={cn('text-sm font-semibold', scoreColor(score, crit.higherIsBetter))}>
                              {score}/10
                            </span>
                            {/* Mini progress bar */}
                            <div className="w-10 h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  (crit.higherIsBetter !== false ? score : 10 - score) >= 8 ? 'bg-emerald-500' :
                                  (crit.higherIsBetter !== false ? score : 10 - score) >= 6 ? 'bg-amber-500' : 'bg-red-400'
                                )}
                                style={{ width: `${(crit.higherIsBetter !== false ? score : 10 - score) * 10}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Optional boolean/text feature rows */}
            {featureRows.length > 0 && (
              <>
                <tr className="border-b bg-muted/40">
                  <td colSpan={sortedProducts.length + 1} className="px-3 py-2">
                    <button
                      onClick={() => setExpandedFeatures((v) => !v)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                    >
                      {expandedFeatures ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {expandedFeatures ? 'Hide' : 'Show'} feature details
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{featureRows.length}</Badge>
                    </button>
                  </td>
                </tr>
                {expandedFeatures && featureRows.map((feature, idx) => (
                  <tr
                    key={feature}
                    className={cn('border-b text-sm', idx % 2 === 0 ? 'bg-background' : 'bg-muted/10')}
                  >
                    <td className="p-3 text-xs text-muted-foreground">
                      {featureLabels[feature] || feature}
                    </td>
                    {sortedProducts.map((product) => (
                      <td key={product.id} className="p-3 text-center">
                        {renderFeatureValue(product.features?.[feature])}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}
          </tbody>

          {/* CTA row */}
          <tfoot>
            <tr className="bg-muted/20">
              <td className="p-3"></td>
              {sortedProducts.map((product) => (
                <td key={product.id} className="p-3 text-center">
                  {product.affiliateUrl ? (
                    <Button asChild size="sm" className="w-full max-w-[130px] text-xs h-8">
                      <a href={product.affiliateUrl} rel="noopener noreferrer sponsored">
                        {ctaText}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled className="w-full max-w-[130px] text-xs h-8">
                      Coming Soon
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-right">
        Click any criteria label to sort · Scores out of 10 · Green = winner in category
      </p>
    </div>
  );
}

export default ComparisonMatrix;
