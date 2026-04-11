'use client';

/**
 * ReadingProgress — Phase 9B
 *
 * Thin fixed progress bar that fills as the user scrolls through an article.
 * Improves engagement signals (time on page, scroll depth).
 * Only renders on client — no SSR needed.
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ReadingProgressProps {
  /** CSS selector for the article element to measure. Defaults to 'article'. */
  target?: string;
  className?: string;
}

export function ReadingProgress({ target = 'article', className }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = document.querySelector(target) as HTMLElement | null;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const totalHeight = el.scrollHeight;
      const viewportH = window.innerHeight;
      // How far into the article the bottom of the viewport has scrolled
      const scrolled = Math.max(0, viewportH - rect.top);
      const pct = Math.min(1, scrolled / totalHeight);
      setProgress(pct);
    };

    window.addEventListener('scroll', update, { passive: true });
    update(); // initial
    return () => window.removeEventListener('scroll', update);
  }, [target]);

  return (
    <div
      className={cn('fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent pointer-events-none', className)}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-primary transition-[width] duration-75 ease-linear"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

export default ReadingProgress;
