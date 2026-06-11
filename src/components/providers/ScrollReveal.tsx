'use client';

/**
 * ScrollReveal — progressive-enhancement driver for .animate-on-scroll /
 * .stagger-children (see globals.css).
 *
 * Content ships visible in SSR HTML. Only when JS runs do we:
 *   1. mark everything already in (or near) the viewport as .is-revealed
 *   2. add `js-anim` to <html>, enabling the hidden initial state
 *   3. reveal remaining elements via IntersectionObserver (20% rootMargin)
 *   4. failsafe: reveal everything after 2s — nothing can stay hidden
 *
 * Elements are never re-hidden on exit. Skipped entirely for
 * prefers-reduced-motion and browsers without IntersectionObserver.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SELECTOR = '.animate-on-scroll, .stagger-children';

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return; // content stays visible

    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    if (els.length === 0) return;

    const reveal = (el: Element) => el.classList.add('is-revealed');

    // Mark anything already in (or near) the viewport BEFORE enabling the
    // hidden state, so adding js-anim never blanks visible content.
    const vh = window.innerHeight;
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 1.2 && rect.bottom > -vh * 0.2) reveal(el);
    }
    root.classList.add('js-anim');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target); // never re-hide on exit
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '20% 0px 20% 0px' }
    );

    for (const el of els) {
      if (!el.classList.contains('is-revealed')) observer.observe(el);
    }

    // Failsafe — fast scrolling or observer quirks can never strand content
    const failsafe = window.setTimeout(() => {
      els.forEach(reveal);
      observer.disconnect();
    }, 2000);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
