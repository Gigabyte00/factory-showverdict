/**
 * Lead magnet registry.
 *
 * Each entry defines a free resource visitors can download in exchange for their email.
 * The actual download URL is read from LEAD_MAGNET_URL env var at request time, allowing
 * each Vercel project to point to its own hosted asset (Vercel Blob, Google Drive, etc.).
 *
 * Usage: set on Vercel per-project:
 *   LEAD_MAGNET_SLUG   = ebike-buying-guide
 *   LEAD_MAGNET_TITLE  = Ultimate eBike Buying Guide
 *   LEAD_MAGNET_DESC   = 12-page guide covering ...
 *   LEAD_MAGNET_URL    = https://storage.example.com/ebike-guide.pdf
 */

export interface LeadMagnet {
  slug: string;
  title: string;
  description: string;
  subline: string;
  icon: string;           // emoji used when no image is available
  ctaText: string;
  downloadLabel: string;
}

/** Built-in magnets keyed by slug — used as defaults if env vars aren't set */
export const LEAD_MAGNETS: Record<string, LeadMagnet> = {
  'ebike-buying-guide': {
    slug: 'ebike-buying-guide',
    title: 'Ultimate eBike Buying Guide',
    description: '12-page guide covering motor types, battery range, frame geometry, and how to avoid common beginner mistakes. Includes a 30-point inspection checklist.',
    subline: 'Used by 2,000+ eBike shoppers',
    icon: '⚡',
    ctaText: 'Download Free Guide',
    downloadLabel: 'eBike Buying Guide (PDF)',
  },
  'betting-bankroll-calculator': {
    slug: 'betting-bankroll-calculator',
    title: 'Sports Betting Bankroll Calculator',
    description: 'Google Sheet template for tracking bets, calculating Kelly Criterion stake sizes, and monitoring your ROI across different sportsbooks.',
    subline: 'Includes 12-month profit tracker',
    icon: '📊',
    ctaText: 'Get Free Calculator',
    downloadLabel: 'Bankroll Calculator (Google Sheet)',
  },
  'broker-comparison-chart': {
    slug: 'broker-comparison-chart',
    title: 'Top 10 Brokers Comparison Chart',
    description: 'Side-by-side PDF comparing commissions, margin rates, platform features, and account minimums for the top 10 brokers. Updated quarterly.',
    subline: 'Save hours of research',
    icon: '📈',
    ctaText: 'Download Comparison Chart',
    downloadLabel: 'Broker Comparison (PDF)',
  },
  'budget-spreadsheet': {
    slug: 'budget-spreadsheet',
    title: 'Zero-Based Budget Spreadsheet',
    description: 'Free Google Sheets template for zero-based budgeting. Tracks income, fixed expenses, variable spending, and savings goals with automated monthly summaries.',
    subline: 'Trusted by 5,000+ users',
    icon: '💰',
    ctaText: 'Get Free Spreadsheet',
    downloadLabel: 'Budget Template (Google Sheet)',
  },
  'ai-tools-cheatsheet': {
    slug: 'ai-tools-cheatsheet',
    title: 'AI Coding Tools Cheatsheet',
    description: '1-page reference card covering prompting shortcuts, keyboard shortcuts, and workflow tips for GitHub Copilot, Cursor, and Claude Code. Print-friendly PDF.',
    subline: 'The cheatsheet 10,000+ devs use daily',
    icon: '🤖',
    ctaText: 'Download Cheatsheet',
    downloadLabel: 'AI Tools Cheatsheet (PDF)',
  },
  'jdm-import-guide': {
    slug: 'jdm-import-guide',
    title: 'JDM Import Checklist',
    description: 'Step-by-step guide to importing a JDM vehicle: 25-year rule timelines, EPA/DOT compliance, shipping costs, and trusted importers list.',
    subline: 'Save thousands on your import',
    icon: '🚗',
    ctaText: 'Get Free Checklist',
    downloadLabel: 'JDM Import Checklist (PDF)',
  },
  'dubai-chocolate-guide': {
    slug: 'dubai-chocolate-guide',
    title: 'Dubai Chocolate Recipe Collection',
    description: '15 authentic Dubai chocolate recipes — from classic pistachio knafeh bark to saffron truffles. Includes sourcing tips for specialty ingredients and professional tempering techniques.',
    subline: 'The recipes going viral on TikTok',
    icon: '🍫',
    ctaText: 'Get Free Recipes',
    downloadLabel: 'Dubai Chocolate Recipes (PDF)',
  },
  'homebrewing-starter-guide': {
    slug: 'homebrewing-starter-guide',
    title: 'Beginner Homebrewing Starter Guide',
    description: 'Everything you need to brew your first 5-gallon batch: equipment checklist, step-by-step brew day instructions, common mistakes to avoid, and 3 beginner-friendly recipes.',
    subline: 'Used by 3,000+ first-time brewers',
    icon: '🍺',
    ctaText: 'Download Free Guide',
    downloadLabel: 'Homebrewing Starter Guide (PDF)',
  },
  'payment-processor-comparison': {
    slug: 'payment-processor-comparison',
    title: 'Merchant Services Comparison Chart',
    description: 'Side-by-side comparison of 12 payment processors: interchange rates, monthly fees, contract terms, chargeback policies, and best-fit business types.',
    subline: 'Stop overpaying on processing fees',
    icon: '💳',
    ctaText: 'Download Free Chart',
    downloadLabel: 'Payment Processor Comparison (PDF)',
  },
  'business-loan-checklist': {
    slug: 'business-loan-checklist',
    title: 'Business Funding Readiness Checklist',
    description: '27-point checklist to prepare your business for funding: credit score requirements, documents lenders want, red flags that kill applications, and which loan type fits your stage.',
    subline: 'Get approved faster',
    icon: '📋',
    ctaText: 'Get Free Checklist',
    downloadLabel: 'Business Funding Checklist (PDF)',
  },
  'tax-deductions-checklist': {
    slug: 'tax-deductions-checklist',
    title: 'Maximum Tax Deductions Checklist',
    description: '47 commonly missed tax deductions for freelancers, small business owners, and W-2 employees. Includes home office, vehicle, equipment, and retirement contribution strategies.',
    subline: 'The average user saves $1,200+',
    icon: '🧾',
    ctaText: 'Get Free Checklist',
    downloadLabel: 'Tax Deductions Checklist (PDF)',
  },
  'life-insurance-guide': {
    slug: 'life-insurance-guide',
    title: "Life Insurance Buyer's Guide",
    description: 'Plain-English guide to term vs whole life insurance: how much coverage you actually need, the 5 questions agents hope you never ask, and how to compare quotes without getting upsold.',
    subline: 'Rated #1 by independent reviewers',
    icon: '🛡️',
    ctaText: 'Download Free Guide',
    downloadLabel: "Life Insurance Buyer's Guide (PDF)",
  },
  'payment-gateway-guide': {
    slug: 'payment-gateway-guide',
    title: 'Payment Gateway Selection Guide',
    description: 'How to choose the right payment gateway for your business: API capabilities, transaction limits, international support, fraud tools, and total cost of ownership calculator.',
    subline: 'Save 40+ hours of vendor research',
    icon: '⚡',
    ctaText: 'Download Free Guide',
    downloadLabel: 'Payment Gateway Guide (PDF)',
  },
  'skincare-routine-builder': {
    slug: 'skincare-routine-builder',
    title: 'Skincare Routine Builder Worksheet',
    description: 'Customizable worksheet to build your AM + PM skincare routine: skin-type quiz, ingredient compatibility checker, product layering order guide, and 4-week results tracker.',
    subline: 'Trusted by 4,000+ skincare enthusiasts',
    icon: '✨',
    ctaText: 'Get Free Worksheet',
    downloadLabel: 'Skincare Routine Builder (PDF)',
  },
  'streaming-cost-optimizer': {
    slug: 'streaming-cost-optimizer',
    title: 'Streaming Service Cost Optimizer',
    description: 'Google Sheet template that calculates your true cost-per-hour watched across Netflix, Hulu, HBO Max, Disney+, and more. Find which services are actually worth keeping.',
    subline: 'Average user saves $23/month',
    icon: '📺',
    ctaText: 'Get Free Optimizer',
    downloadLabel: 'Streaming Cost Optimizer (Google Sheet)',
  },
  'audiobook-platform-guide': {
    slug: 'audiobook-platform-guide',
    title: 'Audiobook Platform Comparison Guide',
    description: "Side-by-side comparison of Audible, Libro.fm, Scribd, and 6 other audiobook platforms: credit systems, catalog size, offline playback, and which is best for your listening habits.",
    subline: 'Find the right platform in 5 minutes',
    icon: '🎧',
    ctaText: 'Download Free Guide',
    downloadLabel: 'Audiobook Platform Guide (PDF)',
  },
};

/** Get a lead magnet by slug, falling back to env-var config or null */
export function getLeadMagnet(slug: string): LeadMagnet | null {
  // If env vars define a site-specific magnet, override
  const envSlug = process.env.LEAD_MAGNET_SLUG;
  if (envSlug === slug) {
    return {
      slug,
      title: process.env.LEAD_MAGNET_TITLE || LEAD_MAGNETS[slug]?.title || slug,
      description: process.env.LEAD_MAGNET_DESC || LEAD_MAGNETS[slug]?.description || '',
      subline: process.env.LEAD_MAGNET_SUBLINE || LEAD_MAGNETS[slug]?.subline || '',
      icon: LEAD_MAGNETS[slug]?.icon || '📄',
      ctaText: process.env.LEAD_MAGNET_CTA || LEAD_MAGNETS[slug]?.ctaText || 'Download Free',
      downloadLabel: LEAD_MAGNETS[slug]?.downloadLabel || 'Download',
    };
  }
  return LEAD_MAGNETS[slug] || null;
}

/** Get the download URL for a magnet (from env var) */
export function getLeadMagnetDownloadUrl(slug: string): string | null {
  return process.env.LEAD_MAGNET_URL || null;
}
