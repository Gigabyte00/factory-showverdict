import { ShieldCheck, Clock, Award, Newspaper, RefreshCw, CheckCircle2 } from 'lucide-react';

interface TrustStats {
  articles?: number;
  products_reviewed?: number;
}

interface TrustSignalsProps {
  stats?: TrustStats;
  variant?: 'default' | 'compact' | 'editorial';
}

/**
 * Trust signals strip for building credibility.
 *
 * Variants:
 * - "default": Shows real article/product counts if above threshold, otherwise falls back to editorial
 * - "compact": Single-line for header/footer
 * - "editorial": Qualitative trust badges (no fake numbers)
 */
export function TrustSignals({ stats, variant = 'default' }: TrustSignalsProps) {
  const articles = stats?.articles || 0;
  const products = stats?.products_reviewed || 0;

  // If real stats are too low, use editorial variant instead
  if (variant === 'default' && articles < 5 && products < 5) {
    variant = 'editorial';
  }

  if (variant === 'editorial') {
    return <EditorialTrustSignals />;
  }

  if (variant === 'compact') {
    return <CompactTrustSignals articles={articles} products={products} />;
  }

  return (
    <section className="py-12 border-y bg-muted/20">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {articles > 0 && (
            <TrustItem
              icon={Newspaper}
              value={`${articles}+`}
              label="Expert Articles"
            />
          )}
          {products > 0 && (
            <TrustItem
              icon={ShieldCheck}
              value={`${products}+`}
              label="Products Reviewed"
            />
          )}
          <TrustItem
            icon={Award}
            value="Independent"
            label="Unbiased Reviews"
          />
          <TrustItem
            icon={RefreshCw}
            value="Monthly"
            label="Content Updates"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Editorial variant — honest qualitative signals instead of fake numbers.
 */
function EditorialTrustSignals() {
  return (
    <section className="py-12 border-y bg-muted/20">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <TrustItem
            icon={ShieldCheck}
            value="Independent"
            label="Reviews"
          />
          <TrustItem
            icon={Award}
            value="No Sponsored"
            label="Rankings"
          />
          <TrustItem
            icon={RefreshCw}
            value="Updated"
            label="Monthly"
          />
          <TrustItem
            icon={CheckCircle2}
            value="Expert"
            label="Verified"
          />
        </div>
      </div>
    </section>
  );
}

interface TrustItemProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}

function TrustItem({ icon: Icon, value, label }: TrustItemProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

/**
 * Compact variant - single line for header/footer
 */
function CompactTrustSignals({ articles, products }: { articles: number; products: number }) {
  return (
    <div className="flex items-center justify-center gap-6 py-4 text-sm text-muted-foreground">
      {articles > 0 && (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>{articles}+ articles</span>
        </div>
      )}
      {products > 0 && (
        <div className="hidden sm:flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span>{products}+ products reviewed</span>
        </div>
      )}
      <div className="hidden md:flex items-center gap-2">
        <Award className="w-4 h-4 text-amber-500" />
        <span>Independent reviews</span>
      </div>
    </div>
  );
}

/**
 * "As Seen In" logo strip - for sites with press mentions
 */
export function AsSeenIn({ logos }: { logos: { name: string; src: string }[] }) {
  if (logos.length === 0) return null;

  return (
    <section className="py-8 border-t">
      <div className="container">
        <p className="text-center text-sm text-muted-foreground mb-6">As Seen In</p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
          {logos.map((logo) => (
            <img
              key={logo.name}
              src={logo.src}
              alt={logo.name}
              className="h-8 object-contain"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
