import { ShieldCheck, FlaskConical, RefreshCw, FileText } from 'lucide-react';

interface TrustBadgesProps {
  reviewCount?: number | null;
  lastUpdated?: string | null;
  yearsActive?: number | null;
  variant?: 'row' | 'grid';
  className?: string;
}

/**
 * Trust signal badges — displayed on homepage hero, methodology pages,
 * and comparison post sidebars.
 *
 * Shows: independently reviewed, update date, review count, years of coverage.
 */
export function TrustBadges({
  reviewCount,
  lastUpdated,
  yearsActive,
  variant = 'row',
  className = '',
}: TrustBadgesProps) {
  const badges = [
    {
      icon: ShieldCheck,
      label: 'Independently Reviewed',
      show: true,
    },
    {
      icon: RefreshCw,
      label: lastUpdated
        ? `Updated ${new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
        : 'Regularly Updated',
      show: true,
    },
    {
      icon: FileText,
      label: reviewCount != null ? `${reviewCount.toLocaleString()}+ Reviews Published` : null,
      show: reviewCount != null && reviewCount > 0,
    },
    {
      icon: FlaskConical,
      label: yearsActive != null ? `${yearsActive}+ Years of Testing` : null,
      show: yearsActive != null && yearsActive > 0,
    },
  ].filter((b) => b.show && b.label);

  const containerClass =
    variant === 'grid'
      ? `grid grid-cols-2 gap-2 ${className}`
      : `flex flex-wrap gap-3 ${className}`;

  return (
    <div className={containerClass} aria-label="Trust credentials">
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.label}
            className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-full"
          >
            <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default TrustBadges;
