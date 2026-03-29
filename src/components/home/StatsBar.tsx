import { Newspaper, ShieldCheck, RefreshCw, Award } from 'lucide-react';

interface StatsBarProps {
  articles?: number;
  products?: number;
}

/**
 * Full-width colored stats bar — creates a bold visual break on the page.
 * Uses the site's primary color as background.
 * Falls back to qualitative text when real numbers are low.
 */
export function StatsBar({ articles = 0, products = 0 }: StatsBarProps) {
  const hasRealStats = articles >= 5 || products >= 5;

  const stats = hasRealStats
    ? [
        { icon: Newspaper, value: `${articles}+`, label: 'Expert Articles' },
        { icon: ShieldCheck, value: `${products}+`, label: 'Products Reviewed' },
        { icon: Award, value: 'Independent', label: 'Unbiased Reviews' },
        { icon: RefreshCw, value: 'Monthly', label: 'Content Updates' },
      ]
    : [
        { icon: ShieldCheck, value: 'Independent', label: 'Reviews' },
        { icon: Award, value: 'Expert', label: 'Verified' },
        { icon: RefreshCw, value: 'Updated', label: 'Monthly' },
        { icon: Newspaper, value: '100%', label: 'Free Access' },
      ];

  return (
    <section className="py-14 lg:py-16 bg-primary text-primary-foreground">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <stat.icon className="w-6 h-6 mb-3 opacity-80" />
              <div className="text-2xl lg:text-3xl font-bold">{stat.value}</div>
              <div className="text-sm opacity-80 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
