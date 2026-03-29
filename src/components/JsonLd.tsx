import Script from 'next/script';

// ============================================================================
// Type Definitions
// ============================================================================

interface Entity {
  name: string;
  type?: string;
  url?: string;
  sameAs?: string[];
}

interface ArticleData {
  headline: string;
  description?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  author?: string;
  image?: string | null;
  url?: string;
  /**
   * CSS selectors for speakable content (AEO).
   * Example: ['#key-answer', '#summary']
   */
  speakableCssSelectors?: string[];
  /**
   * Entities mentioned or the article is about (AEO).
   */
  about?: Entity[];
  mentions?: Entity[];
  /**
   * Key takeaways as plain text for search enhancement.
   */
  keywords?: string[];
}

interface ProductData {
  name: string;
  description?: string | null;
  image?: string | null;
  rating?: number | null;
  reviewCount?: number;
  price?: number | null;
  currency?: string;
  url?: string;
  brand?: string;
  sku?: string;
}

interface ComparisonData {
  headline: string;
  description?: string | null;
  products: Array<{
    name: string;
    description?: string | null;
    image?: string | null;
    rating?: number | null;
    url?: string;
  }>;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQData {
  faqs: FAQItem[];
}

interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

interface HowToData {
  name: string;
  description?: string | null;
  image?: string | null;
  totalTime?: string; // ISO 8601 duration, e.g., "PT30M"
  estimatedCost?: { currency: string; value: number };
  supply?: string[];
  tool?: string[];
  steps: HowToStep[];
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbData {
  items: BreadcrumbItem[];
}

type JsonLdType = 'article' | 'product' | 'comparison' | 'faq' | 'howto' | 'breadcrumb';

interface JsonLdTypedProps {
  type: JsonLdType;
  data: ArticleData | ProductData | ComparisonData | FAQData | HowToData | BreadcrumbData;
}

/** Raw passthrough: pass a pre-built schema.org object directly */
interface JsonLdRawProps {
  type?: undefined;
  data: Record<string, unknown>;
}

type JsonLdProps = JsonLdTypedProps | JsonLdRawProps;

// ============================================================================
// Schema Generators
// ============================================================================

function generateArticleSchema(data: ArticleData) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    description: data.description || undefined,
    datePublished: data.datePublished || undefined,
    dateModified: data.dateModified || data.datePublished || undefined,
    author: data.author
      ? {
          '@type': 'Organization',
          name: data.author,
        }
      : undefined,
    image: data.image || undefined,
    mainEntityOfPage: data.url
      ? {
          '@type': 'WebPage',
          '@id': data.url,
        }
      : undefined,
    keywords: data.keywords?.join(', ') || undefined,
  };

  // Add speakable specification for voice/AI assistants
  if (data.speakableCssSelectors && data.speakableCssSelectors.length > 0) {
    schema.speakable = {
      '@type': 'SpeakableSpecification',
      cssSelector: data.speakableCssSelectors,
    };
  }

  // Add about entities (what the article is primarily about)
  if (data.about && data.about.length > 0) {
    schema.about = data.about.map((entity) => ({
      '@type': entity.type || 'Thing',
      name: entity.name,
      url: entity.url || undefined,
      sameAs: entity.sameAs || undefined,
    }));
  }

  // Add mentions entities (things mentioned but not the main topic)
  if (data.mentions && data.mentions.length > 0) {
    schema.mentions = data.mentions.map((entity) => ({
      '@type': entity.type || 'Thing',
      name: entity.name,
      url: entity.url || undefined,
      sameAs: entity.sameAs || undefined,
    }));
  }

  return schema;
}

function generateProductSchema(data: ProductData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description || undefined,
    image: data.image || undefined,
    brand: data.brand
      ? {
          '@type': 'Brand',
          name: data.brand,
        }
      : undefined,
    sku: data.sku || undefined,
    aggregateRating:
      data.rating != null
        ? {
            '@type': 'AggregateRating',
            ratingValue: data.rating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: data.reviewCount || 1,
          }
        : undefined,
    offers:
      data.price != null
        ? {
            '@type': 'Offer',
            price: data.price / 100,
            priceCurrency: data.currency || 'USD',
            availability: 'https://schema.org/InStock',
            url: data.url || undefined,
          }
        : undefined,
  };
}

function generateComparisonSchema(data: ComparisonData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: data.headline,
    description: data.description || undefined,
    itemListElement: data.products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description || undefined,
        image: product.image || undefined,
        url: product.url || undefined,
        aggregateRating:
          product.rating != null
            ? {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                bestRating: 5,
                worstRating: 1,
              }
            : undefined,
      },
    })),
  };
}

function generateFAQSchema(data: FAQData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

function generateHowToSchema(data: HowToData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    description: data.description || undefined,
    image: data.image || undefined,
    totalTime: data.totalTime || undefined,
    estimatedCost: data.estimatedCost
      ? {
          '@type': 'MonetaryAmount',
          currency: data.estimatedCost.currency,
          value: data.estimatedCost.value,
        }
      : undefined,
    supply: data.supply?.map((s) => ({ '@type': 'HowToSupply', name: s })),
    tool: data.tool?.map((t) => ({ '@type': 'HowToTool', name: t })),
    step: data.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image || undefined,
      url: step.url || undefined,
    })),
  };
}

function generateBreadcrumbSchema(data: BreadcrumbData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Structured data component for SEO and AEO (Answer Engine Optimization)
 *
 * Supports multiple schema types:
 * - article: Blog posts with speakable sections and entity mentions
 * - product: Product pages with ratings and offers
 * - comparison: Product comparison lists
 * - faq: FAQ pages for featured snippets
 * - howto: Step-by-step guides
 * - breadcrumb: Navigation breadcrumbs
 *
 * Uses Next.js Script component for safe JSON-LD injection.
 */
export default function JsonLd({ type, data }: JsonLdProps) {
  const generateSchema = (): Record<string, unknown> | null => {
    if (!type) return data as Record<string, unknown>;
    switch (type) {
      case 'article':
        return generateArticleSchema(data as ArticleData);
      case 'product':
        return generateProductSchema(data as ProductData);
      case 'comparison':
        return generateComparisonSchema(data as ComparisonData);
      case 'faq':
        return generateFAQSchema(data as FAQData);
      case 'howto':
        return generateHowToSchema(data as HowToData);
      case 'breadcrumb':
        return generateBreadcrumbSchema(data as BreadcrumbData);
      default:
        return null;
    }
  };

  const schema = generateSchema();

  if (!schema) return null;

  // Filter out undefined values for cleaner output
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <Script id={`jsonld-${type ?? (data as Record<string, unknown>)['@type'] ?? 'raw'}`} type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(cleanSchema)}
    </Script>
  );
}

// ============================================================================
// Export Types for External Use
// ============================================================================

export type {
  ArticleData,
  ProductData,
  ComparisonData,
  FAQData,
  FAQItem,
  HowToData,
  HowToStep,
  BreadcrumbData,
  BreadcrumbItem,
  Entity,
  JsonLdType,
};
