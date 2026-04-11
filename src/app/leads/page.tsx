/**
 * Lead Generation Landing Page — Phase 8B
 *
 * Niche-aware multi-step qualification form for YMYL sites.
 * Reads site.niche at render time to configure the right wizard steps.
 * Works for: life insurance, business finance, tax, trading, personal finance
 * Degrades gracefully for all other niches with a generic email-capture form.
 */

import { getSiteConfig } from '@/lib/site-config';
import { LeadGenForm, type LeadFormStep } from '@/components/forms/LeadGenForm';
import { Shield } from 'lucide-react';
import type { Metadata } from 'next';

// ─── Niche step configs ────────────────────────────────────────────────────

interface NicheConfig {
  headline: string;
  subheadline: string;
  submitLabel: string;
  successMessage: string;
  steps: LeadFormStep[];
}

function getNicheConfig(niche: string | null): NicheConfig {
  const n = (niche || '').toLowerCase();

  // Life Insurance
  if (n.includes('insurance') || n.includes('term') || n.includes('life')) {
    return {
      headline: 'Get Your Free Life Insurance Quote',
      subheadline: 'Answer 3 quick questions and we\'ll match you with the best coverage options.',
      submitLabel: 'Get My Free Quote',
      successMessage: 'Great! Check your inbox for personalized life insurance options tailored to your needs.',
      steps: [
        {
          id: 'coverage_type',
          question: 'What type of life insurance are you looking for?',
          subtext: 'Not sure? Term life is the most affordable for most families.',
          type: 'choice',
          choices: [
            { label: 'Term Life Insurance', value: 'term', icon: '📅' },
            { label: 'Whole Life Insurance', value: 'whole', icon: '♾️' },
            { label: 'Universal Life', value: 'universal', icon: '🔄' },
            { label: 'I\'m not sure — help me decide', value: 'unsure', icon: '🤔' },
          ],
        },
        {
          id: 'coverage_amount',
          question: 'How much coverage do you need?',
          subtext: 'A common rule of thumb is 10–12× your annual income.',
          type: 'choice',
          choices: [
            { label: 'Under $250,000', value: '<250k', icon: '💰' },
            { label: '$250,000 – $500,000', value: '250-500k', icon: '💰' },
            { label: '$500,000 – $1,000,000', value: '500k-1m', icon: '💰' },
            { label: 'Over $1,000,000', value: '>1m', icon: '💰' },
          ],
        },
        {
          id: 'name',
          question: 'What\'s your name?',
          type: 'text',
          placeholder: 'First and last name',
          required: true,
        },
        {
          id: 'email',
          question: 'Where should we send your free quote?',
          subtext: 'We\'ll email you personalized options — no spam, ever.',
          type: 'email',
          placeholder: 'you@example.com',
          required: true,
        },
      ],
    };
  }

  // Business Finance / Loans
  if (n.includes('business') || n.includes('loan') || n.includes('capital') || n.includes('finance') && n.includes('busi')) {
    return {
      headline: 'Find the Right Business Funding',
      subheadline: 'Tell us about your needs and we\'ll show you the best options for your business.',
      submitLabel: 'See My Funding Options',
      successMessage: 'Thanks! We\'re finding the best funding matches for your business — check your inbox shortly.',
      steps: [
        {
          id: 'funding_type',
          question: 'What type of funding are you looking for?',
          type: 'choice',
          choices: [
            { label: 'SBA Loan', value: 'sba', icon: '🏛️' },
            { label: 'Business Line of Credit', value: 'loc', icon: '💳' },
            { label: 'Equipment Financing', value: 'equipment', icon: '🏭' },
            { label: 'Merchant Cash Advance', value: 'mca', icon: '⚡' },
          ],
        },
        {
          id: 'funding_amount',
          question: 'How much funding do you need?',
          type: 'choice',
          choices: [
            { label: 'Under $50,000', value: '<50k', icon: '💵' },
            { label: '$50,000 – $250,000', value: '50-250k', icon: '💵' },
            { label: '$250,000 – $1,000,000', value: '250k-1m', icon: '💵' },
            { label: 'Over $1,000,000', value: '>1m', icon: '💵' },
          ],
        },
        {
          id: 'name',
          question: 'Your name and business name?',
          type: 'text',
          placeholder: 'Jane Smith, Acme Corp',
          required: true,
        },
        {
          id: 'email',
          question: 'Best email to send your funding matches?',
          type: 'email',
          placeholder: 'you@yourbusiness.com',
          required: true,
        },
      ],
    };
  }

  // Tax
  if (n.includes('tax') || n.includes('refund') || n.includes('irs')) {
    return {
      headline: 'Get Your Personalized Tax Savings Plan',
      subheadline: 'Answer 3 quick questions to find the best tax software and maximize your deductions.',
      submitLabel: 'Get My Tax Savings Guide',
      successMessage: 'Perfect! Your personalized tax guide is on its way — check your inbox.',
      steps: [
        {
          id: 'tax_situation',
          question: 'What best describes your tax situation?',
          type: 'choice',
          choices: [
            { label: 'W-2 Employee', value: 'w2', icon: '👔' },
            { label: 'Self-Employed / Freelancer', value: 'self_employed', icon: '💻' },
            { label: 'Small Business Owner', value: 'business_owner', icon: '🏢' },
            { label: 'Investor / Rental Income', value: 'investor', icon: '📈' },
          ],
        },
        {
          id: 'tax_challenge',
          question: 'What\'s your biggest tax challenge?',
          type: 'choice',
          choices: [
            { label: 'Maximizing deductions', value: 'deductions', icon: '🎯' },
            { label: 'Filing in multiple states', value: 'multi_state', icon: '🗺️' },
            { label: 'Self-employment / business taxes', value: 'self_employment', icon: '📊' },
            { label: 'Investment & capital gains', value: 'investments', icon: '📉' },
          ],
        },
        {
          id: 'email',
          question: 'Where should we send your personalized guide?',
          subtext: 'Includes the best software for your situation + top deductions checklist.',
          type: 'email',
          placeholder: 'you@example.com',
          required: true,
        },
      ],
    };
  }

  // Trading / Investing / Brokers
  if (n.includes('trading') || n.includes('broker') || n.includes('invest') || n.includes('stock') || n.includes('forex')) {
    return {
      headline: 'Find Your Perfect Broker in 60 Seconds',
      subheadline: 'Tell us how you invest and we\'ll match you with the best platform for your style.',
      submitLabel: 'See My Broker Matches',
      successMessage: 'Your personalized broker comparison is on its way — check your inbox!',
      steps: [
        {
          id: 'investor_type',
          question: 'How would you describe yourself as an investor?',
          type: 'choice',
          choices: [
            { label: 'Beginner (just starting out)', value: 'beginner', icon: '🌱' },
            { label: 'Intermediate investor', value: 'intermediate', icon: '📊' },
            { label: 'Active / day trader', value: 'active', icon: '⚡' },
            { label: 'Options / Forex trader', value: 'options', icon: '🔧' },
          ],
        },
        {
          id: 'broker_priority',
          question: 'What\'s most important to you in a broker?',
          type: 'choice',
          choices: [
            { label: 'Commission-free trades', value: 'low_fees', icon: '💸' },
            { label: 'Research & analysis tools', value: 'research', icon: '🔍' },
            { label: 'Options & advanced trading', value: 'advanced', icon: '📈' },
            { label: 'Crypto support', value: 'crypto', icon: '₿' },
          ],
        },
        {
          id: 'email',
          question: 'Where should we send your broker comparison?',
          subtext: 'Includes fees, features, and our top pick for your trading style.',
          type: 'email',
          placeholder: 'you@example.com',
          required: true,
        },
      ],
    };
  }

  // Personal Finance
  if (n.includes('personal finance') || n.includes('budget') || n.includes('debt') || n.includes('saving')) {
    return {
      headline: 'Build Your Personalized Financial Plan',
      subheadline: 'Answer 3 quick questions and we\'ll send you a custom roadmap for your goals.',
      submitLabel: 'Get My Financial Plan',
      successMessage: 'Your personalized financial plan is on its way — check your inbox!',
      steps: [
        {
          id: 'priority',
          question: 'What\'s your biggest financial priority right now?',
          type: 'choice',
          choices: [
            { label: 'Pay off debt', value: 'debt', icon: '🎯' },
            { label: 'Build my emergency fund', value: 'savings', icon: '🛡️' },
            { label: 'Start investing for retirement', value: 'invest', icon: '📈' },
            { label: 'Get better at budgeting', value: 'budget', icon: '📋' },
          ],
        },
        {
          id: 'savings_status',
          question: 'What\'s your current emergency savings situation?',
          type: 'choice',
          choices: [
            { label: 'No emergency fund yet', value: 'none', icon: '🚨' },
            { label: 'Less than 1 month of expenses', value: '<1mo', icon: '📉' },
            { label: '1–3 months saved', value: '1-3mo', icon: '📊' },
            { label: '3+ months saved', value: '>3mo', icon: '✅' },
          ],
        },
        {
          id: 'email',
          question: 'Where should we send your personalized plan?',
          subtext: 'We\'ll include resources tailored to your specific situation.',
          type: 'email',
          placeholder: 'you@example.com',
          required: true,
        },
      ],
    };
  }

  // Generic fallback (works for any niche)
  return {
    headline: 'Get Expert Recommendations',
    subheadline: 'Tell us what you\'re looking for and we\'ll send you our top picks.',
    submitLabel: 'Send My Recommendations',
    successMessage: 'You\'re all set! Check your inbox for personalized recommendations.',
    steps: [
      {
        id: 'goal',
        question: 'What are you primarily looking for?',
        type: 'choice',
        choices: [
          { label: 'The best value option', value: 'value', icon: '💰' },
          { label: 'The top-rated option', value: 'top_rated', icon: '⭐' },
          { label: 'Something beginner-friendly', value: 'beginner', icon: '🌱' },
          { label: 'A professional-grade solution', value: 'pro', icon: '🚀' },
        ],
      },
      {
        id: 'email',
        question: 'Where should we send your recommendations?',
        type: 'email',
        placeholder: 'you@example.com',
        required: true,
      },
    ],
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();
  const config = getNicheConfig(site.niche);
  return {
    title: config.headline,
    description: config.subheadline,
    robots: { index: false }, // Lead gen pages shouldn't be indexed
  };
}

export default function LeadsPage() {
  const site = getSiteConfig();
  const config = getNicheConfig(site.niche);

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
      <div className="container max-w-2xl mx-auto px-4 py-16">
        {/* Trust header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 mb-6">
            <Shield className="h-3.5 w-3.5" />
            Free — No Obligation — Takes Under 60 Seconds
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3 sm:text-4xl">
            {config.headline}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {config.subheadline}
          </p>
        </div>

        {/* Form */}
        <LeadGenForm
          siteId={site.id}
          niche={site.niche}
          steps={config.steps}
          submitLabel={config.submitLabel}
          successMessage={config.successMessage}
          sourceUrl={`${site.domain}/leads`}
        />

        {/* Social proof */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Join thousands of readers who found their best option through {site.name}.
        </p>
      </div>
    </div>
  );
}
