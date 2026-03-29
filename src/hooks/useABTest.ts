'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackEvent } from '@/lib/analytics';

const STORAGE_PREFIX = 'ab_test_';

export function useABTest(testName: string, variants: string[]): {
  variant: string;
  trackConversion: () => void;
} {
  const [variant, setVariant] = useState(variants[0] || '');

  useEffect(() => {
    if (variants.length === 0) return;

    const key = STORAGE_PREFIX + testName;
    const stored = sessionStorage.getItem(key);
    if (stored && variants.includes(stored)) {
      setVariant(stored);
      return;
    }

    const selected = variants[Math.floor(Math.random() * variants.length)];
    sessionStorage.setItem(key, selected);
    trackEvent('ab_test_impression', { test_name: testName, variant: selected });
    setVariant(selected);
  }, [testName, variants]);

  const trackConversion = useCallback(() => {
    trackEvent('ab_test_conversion', { test_name: testName, variant });
  }, [testName, variant]);

  return { variant, trackConversion };
}
