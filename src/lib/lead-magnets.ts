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
