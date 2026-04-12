'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import React from 'react';
import { trackEvent } from '@/lib/analytics';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BountyVariant =
  | 'article-inline'
  | 'article-bottom'
  | 'homepage-banner';

const BOUNTY_VARIANTS: BountyVariant[] = [
  'article-inline',
  'article-bottom',
  'homepage-banner',
];

const STORAGE_KEY = 'bounty_ab_variant';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface BountyABTestContextValue {
  /** The placement variant assigned to this visitor. */
  variant: BountyVariant;
  /**
   * Fire a GA4 conversion event tied to the current variant.
   * @param bountyType – free-form label for the bounty (e.g. "review", "deal")
   */
  trackConversion: (bountyType: string) => void;
}

const BountyABTestContext = createContext<BountyABTestContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidVariant(value: unknown): value is BountyVariant {
  return typeof value === 'string' && BOUNTY_VARIANTS.includes(value as BountyVariant);
}

/**
 * Read the persisted variant from localStorage, or assign a new one randomly.
 * Returns the variant string AND whether it was freshly assigned (so we can
 * fire the assignment event exactly once).
 */
function resolveVariant(): { variant: BountyVariant; isNew: boolean } {
  if (typeof window === 'undefined') {
    return { variant: BOUNTY_VARIANTS[0], isNew: false };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isValidVariant(stored)) {
      return { variant: stored, isNew: false };
    }
  } catch {
    // localStorage may be unavailable (e.g. private browsing in some browsers)
  }

  const selected =
    BOUNTY_VARIANTS[Math.floor(Math.random() * BOUNTY_VARIANTS.length)];

  try {
    localStorage.setItem(STORAGE_KEY, selected);
  } catch {
    // Silently degrade – the user just won't get persistence
  }

  return { variant: selected, isNew: true };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface BountyABTestProviderProps {
  children: ReactNode;
  /**
   * Optionally force a specific variant (useful for previewing / testing).
   * When set, no random assignment occurs and no assignment event fires.
   */
  forceVariant?: BountyVariant;
}

export function BountyABTestProvider({
  children,
  forceVariant,
}: BountyABTestProviderProps) {
  const [variant, setVariant] = useState<BountyVariant>(
    forceVariant ?? BOUNTY_VARIANTS[0],
  );

  useEffect(() => {
    if (forceVariant) {
      setVariant(forceVariant);
      return;
    }

    const { variant: resolved, isNew } = resolveVariant();
    setVariant(resolved);

    if (isNew) {
      trackEvent('bounty_ab_assignment', { variant: resolved });
    }
  }, [forceVariant]);

  const trackConversion = useCallback(
    (bountyType: string) => {
      trackEvent('bounty_ab_conversion', {
        variant,
        bounty_type: bountyType,
      });
    },
    [variant],
  );

  const value = useMemo<BountyABTestContextValue>(
    () => ({ variant, trackConversion }),
    [variant, trackConversion],
  );

  return React.createElement(
    BountyABTestContext.Provider,
    { value },
    children,
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the bounty A/B test variant and conversion tracker.
 *
 * Must be used inside a `<BountyABTestProvider>`.
 *
 * @example
 * ```tsx
 * const { variant, trackConversion } = useBountyABTest();
 *
 * if (variant === 'article-inline') {
 *   return <InlineBountyWidget onClaim={() => trackConversion('review')} />;
 * }
 * ```
 */
export function useBountyABTest(): BountyABTestContextValue {
  const ctx = useContext(BountyABTestContext);
  if (!ctx) {
    throw new Error(
      'useBountyABTest must be used within a <BountyABTestProvider>',
    );
  }
  return ctx;
}
