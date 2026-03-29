'use client';

import { CalendarDays, RefreshCw } from 'lucide-react';

interface LastUpdatedProps {
  /**
   * The date when the content was last updated.
   */
  date: string | Date | null;
  /**
   * Optional original publication date.
   */
  publishedDate?: string | Date | null;
  /**
   * Show relative time (e.g., "2 days ago") instead of absolute date.
   */
  showRelative?: boolean;
  /**
   * Optional CSS class for styling.
   */
  className?: string;
  /**
   * Whether to show the refresh icon.
   */
  showIcon?: boolean;
  /**
   * Custom label for the updated date.
   * @default "Last updated"
   */
  updatedLabel?: string;
  /**
   * Custom label for the published date.
   * @default "Published"
   */
  publishedLabel?: string;
}

/**
 * Formats a date for display
 */
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Gets relative time string (e.g., "2 days ago")
 */
function getRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Gets ISO date string for schema.org
 */
function toISOString(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * LastUpdated Component
 *
 * Displays content freshness information prominently.
 * Critical for AI systems and users to assess content currency.
 *
 * Benefits for AEO:
 * - AI systems prioritize recent content
 * - Schema.org dateModified support
 * - Builds user trust
 * - Helps with featured snippet selection
 *
 * Usage:
 * ```tsx
 * <LastUpdated
 *   date="2026-02-04"
 *   publishedDate="2026-01-15"
 *   showRelative
 * />
 * ```
 */
export function LastUpdated({
  date,
  publishedDate,
  showRelative = false,
  className = '',
  showIcon = true,
  updatedLabel = 'Last updated',
  publishedLabel = 'Published',
}: LastUpdatedProps) {
  const displayDate = showRelative ? getRelativeTime(date) : formatDate(date);
  const isoDate = toISOString(date);

  return (
    <div
      className={`
        flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400
        ${className}
      `}
    >
      {/* Last Updated */}
      <span className="flex items-center gap-1.5">
        {showIcon && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
        <span className="font-medium">{updatedLabel}:</span>
        <time dateTime={isoDate} itemProp="dateModified">
          {displayDate}
        </time>
      </span>

      {/* Published Date (if different) */}
      {publishedDate && (
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          <span className="font-medium">{publishedLabel}:</span>
          <time dateTime={toISOString(publishedDate)} itemProp="datePublished">
            {formatDate(publishedDate)}
          </time>
        </span>
      )}
    </div>
  );
}

/**
 * Checks if content is considered "fresh" (updated within threshold).
 * Useful for conditionally showing freshness badges.
 *
 * @param date - Last updated date
 * @param thresholdDays - Number of days to consider fresh (default: 90)
 * @returns Whether the content is fresh
 */
export function isContentFresh(date: string | Date, thresholdDays = 90): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= thresholdDays;
}

/**
 * Gets freshness score (0-100) based on content age.
 * Used by the Refresh Queue workflow to prioritize updates.
 *
 * @param date - Last updated date
 * @returns Freshness score (100 = just updated, 0 = very stale)
 */
export function getFreshnessScore(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Score decay: 100 at day 0, ~50 at 90 days, ~0 at 365 days
  const score = Math.max(0, Math.round(100 * Math.exp(-diffDays / 130)));
  return score;
}

export default LastUpdated;
