import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from '@/components/ui/category-icon';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryWithCount extends Category {
  postCount?: number;
}

interface CategoryGridProps {
  categories: CategoryWithCount[];
  title?: string;
  subtitle?: string;
}

/**
 * Category grid with icons, descriptions, and article counts
 *
 * Features:
 * - Dynamic icon selection based on category slug
 * - Article count badge
 * - Hover effects with primary color accent
 * - Responsive grid (2 cols mobile, 4 cols desktop)
 */
export function CategoryGrid({
  categories,
  title = 'Browse by Category',
  subtitle = 'Find exactly what you\'re looking for',
}: CategoryGridProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        {/* Section header — premium pattern */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Categories
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/${category.slug}`}>
              <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  {/* Icon container with scale-up hover */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                    <CategoryIcon
                      slug={category.slug}
                      size="lg"
                      className="text-primary"
                    />
                  </div>

                  {/* Category name */}
                  <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>

                  {/* Description (truncated) */}
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {category.description}
                    </p>
                  )}

                  {/* Article count badge */}
                  {category.postCount !== undefined && category.postCount > 0 && (
                    <Badge variant="secondary" className="mt-auto">
                      {category.postCount} {category.postCount === 1 ? 'article' : 'articles'}
                    </Badge>
                  )}

                  {/* Hover indicator */}
                  <div className="flex items-center gap-1 mt-3 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Compact version of CategoryGrid for sidebar or footer
 */
export function CategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link key={category.id} href={`/${category.slug}`}>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
          >
            <CategoryIcon slug={category.slug} size="sm" className="mr-1" />
            {category.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
