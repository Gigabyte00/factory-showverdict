'use client';

/**
 * SocialProof — Phase 6D
 *
 * Displays trust signals: X reviews, X posts, last updated, etc.
 * Pulls from props (passed from server component DB fetches).
 *
 * Variants:
 * - 'inline'  — compact row of badges (for post headers)
 * - 'banner'  — full-width trust bar (for homepage hero)
 * - 'sidebar' — vertical stack (for comparison page sidebar)
 */

import { cn } from '@/lib/utils';
import { Users, FileText, Star, RefreshCw, ThumbsUp } from 'lucide-react';

interface SocialProofProps {
  /** Total reviews / offers evaluated */
  reviewCount?: number | null;
  /** Total articles published */
  postCount?: number | null;
  /** Average rating across reviewed products */
  avgRating?: number | null;
  /** Last content update date string */
  lastUpdated?: string | null;
  /** "X people found this helpful this week" */
  weeklyReaders?: number | null;
  variant?: 'inline' | 'banner' | 'sidebar';
  className?: string;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function SocialProof({
  reviewCount,
  postCount,
  avgRating,
  lastUpdated,
  weeklyReaders,
  variant = 'inline',
  className,
}: SocialProofProps) {
  const items: Array<{ icon: React.ReactNode; label: string; value: string }> = [];

  if (reviewCount != null && reviewCount > 0) {
    items.push({
      icon: <Star className="h-4 w-4 text-amber-500" />,
      label: 'reviews',
      value: `${formatNumber(reviewCount)}+ Reviews`,
    });
  }
  if (postCount != null && postCount > 0) {
    items.push({
      icon: <FileText className="h-4 w-4 text-primary" />,
      label: 'guides',
      value: `${formatNumber(postCount)} Guides`,
    });
  }
  if (avgRating != null && avgRating > 0) {
    items.push({
      icon: <ThumbsUp className="h-4 w-4 text-emerald-600" />,
      label: 'rating',
      value: `${avgRating.toFixed(1)}/5 Avg Rating`,
    });
  }
  if (lastUpdated) {
    items.push({
      icon: <RefreshCw className="h-4 w-4 text-muted-foreground" />,
      label: 'updated',
      value: `Updated ${formatDate(lastUpdated)}`,
    });
  }
  if (weeklyReaders != null && weeklyReaders > 0) {
    items.push({
      icon: <Users className="h-4 w-4 text-blue-500" />,
      label: 'readers',
      value: `${formatNumber(weeklyReaders)} readers this week`,
    });
  }

  if (!items.length) return null;

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1', className)}>
        {items.map((item) => (
          <span key={item.label} className="flex items-center gap-1 text-xs text-muted-foreground">
            {item.icon}
            {item.value}
          </span>
        ))}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn('flex flex-wrap items-center justify-center gap-6 py-3 bg-muted/40 rounded-xl px-4', className)}>
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            {item.icon}
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }

  // sidebar
  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2.5 text-sm">
          <div className="p-1.5 rounded-lg bg-muted/60 shrink-0">
            {item.icon}
          </div>
          <span className="text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default SocialProof;
