import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Minus, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ComparisonProduct {
  id: string;
  name: string;
  /** Image URL for product */
  image?: string;
  /** Price display string (e.g., "$99/mo" or "From $199") */
  price?: string;
  /** Optional affiliate URL */
  affiliateUrl?: string;
  /** Rating out of 5 */
  rating?: number;
  /** Optional badge text (e.g., "Best Value", "Editor's Choice") */
  badge?: string;
  /** Feature values - keyed by feature name */
  features: Record<string, string | boolean | number>;
}

interface ComparisonTableProps {
  /** Array of products to compare */
  products: ComparisonProduct[];
  /** Array of feature names to display (in order) */
  features: string[];
  /** Optional: Labels for features (if different from feature keys) */
  featureLabels?: Record<string, string>;
  className?: string;
  /** CTA button text */
  ctaText?: string;
}

/**
 * Comparison table for affiliate product comparisons.
 * Responsive design with horizontal scroll on mobile.
 *
 * @example
 * <ComparisonTable
 *   products={[
 *     { id: '1', name: 'Product A', features: { 'Free Trial': true, 'Price': '$99' } },
 *     { id: '2', name: 'Product B', features: { 'Free Trial': false, 'Price': '$79' } },
 *   ]}
 *   features={['Free Trial', 'Price']}
 * />
 */
export function ComparisonTable({
  products,
  features,
  featureLabels = {},
  className,
  ctaText = 'View Deal',
}: ComparisonTableProps) {
  const renderFeatureValue = (value: string | boolean | number | undefined) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />;
    }
    if (value === false) {
      return <X className="h-5 w-5 text-red-500 dark:text-red-400 mx-auto" />;
    }
    if (value === undefined || value === null || value === '') {
      return <Minus className="h-5 w-5 text-muted-foreground mx-auto" />;
    }
    return <span className="text-sm">{String(value)}</span>;
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center justify-center gap-1">
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0', className)}>
      <table className="w-full min-w-[600px] border-collapse">
        {/* Header with product info */}
        <thead>
          {/* Product images/names */}
          <tr className="border-b border-border">
            <th className="text-left p-4 bg-muted/50 font-semibold text-sm text-muted-foreground w-40">
              Product
            </th>
            {products.map((product) => (
              <th key={product.id} className="p-4 bg-muted/50 text-center relative">
                {product.badge && (
                  <Badge
                    className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    variant="default"
                  >
                    {product.badge}
                  </Badge>
                )}
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-auto object-contain mx-auto mb-2"
                  />
                )}
                <p className="font-semibold text-foreground">{product.name}</p>
                {product.rating && (
                  <div className="mt-1">{renderRating(product.rating)}</div>
                )}
              </th>
            ))}
          </tr>

          {/* Price row */}
          <tr className="border-b border-border">
            <td className="p-4 text-sm font-medium text-muted-foreground">Price</td>
            {products.map((product) => (
              <td key={product.id} className="p-4 text-center">
                <span className="font-bold text-lg text-foreground">
                  {product.price || '—'}
                </span>
              </td>
            ))}
          </tr>
        </thead>

        {/* Feature rows */}
        <tbody>
          {features.map((feature, index) => (
            <tr
              key={feature}
              className={cn(
                'border-b border-border',
                index % 2 === 0 ? 'bg-background' : 'bg-muted/30'
              )}
            >
              <td className="p-4 text-sm font-medium text-muted-foreground">
                {featureLabels[feature] || feature}
              </td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  {renderFeatureValue(product.features[feature])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {/* CTA row */}
        <tfoot>
          <tr>
            <td className="p-4"></td>
            {products.map((product) => (
              <td key={product.id} className="p-4 text-center">
                {product.affiliateUrl ? (
                  <Button asChild size="sm" className="w-full max-w-[140px]">
                    <a
                      href={product.affiliateUrl.startsWith('/go/') ? product.affiliateUrl : `/go/${product.id}`}
                      rel="noopener noreferrer sponsored"
                    >
                      {ctaText}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" disabled className="w-full max-w-[140px]">
                    Coming Soon
                  </Button>
                )}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
