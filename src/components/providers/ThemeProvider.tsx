'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

/**
 * Theme provider wrapper for next-themes
 *
 * Features:
 * - System preference detection
 * - Persistent localStorage storage
 * - No flash on initial load (via suppressHydrationWarning)
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
