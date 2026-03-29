import { getSiteConfig } from '@/lib/site-config';
import { createServerClient } from '@/lib/supabase';
import type { Category } from '@/types';
import { getTemplate, getDefaultVariant } from '@/lib/templates/registry';

export const revalidate = 3600; // Revalidate every hour

export default async function OffersPage() {
  const site = getSiteConfig();
  const supabase = createServerClient();

  const [offersResult, categoriesResult] = await Promise.all([
    supabase
      .from('offers')
      .select('*')
      .eq('site_id', site.id)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('name'),
    supabase
      .from('categories')
      .select('*')
      .eq('site_id', site.id)
      .order('name'),
  ]);

  const offers = offersResult.data || [];
  const categories = categoriesResult.data || [];

  // Determine template variant
  // Priority: 1. Site settings, 2. Auto-detect based on offer count, 3. Default
  let variant = site.settings?.offersVariant;

  if (!variant) {
    // Auto-detect based on offer count
    if (offers.length <= 5) {
      variant = 'carousel'; // Showcase format for small number
    } else if (offers.length <= 10) {
      variant = 'table'; // Comparison view for moderate number
    } else {
      variant = 'grid'; // Grid browsing for large number
    }
  }

  // Get template component
  const Template = getTemplate('offers', variant);

  // Fallback to default if variant not found
  if (!Template) {
    const defaultVariant = getDefaultVariant('offers');
    const DefaultTemplate = getTemplate('offers', defaultVariant);

    if (!DefaultTemplate) {
      throw new Error('No offers templates available');
    }

    return (
      <DefaultTemplate offers={offers} categories={categories} site={site} />
    );
  }

  return <Template offers={offers} categories={categories} site={site} />;
}
