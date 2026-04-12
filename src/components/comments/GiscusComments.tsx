'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface GiscusCommentsProps {
  /** Post slug — becomes the discussion thread identifier so each article
   * gets its own thread on the GitHub Discussions side. */
  slug: string;
  /** Override the term strategy if you'd rather index by URL instead of slug. */
  mapping?: 'pathname' | 'url' | 'title' | 'og:title' | 'specific';
}

/**
 * Giscus-powered comments, env-gated.
 *
 * Returns null if any of the four required env vars are missing. This is
 * intentional: a half-configured widget renders nothing rather than showing
 * a broken embed. Per-site activation:
 *
 *   NEXT_PUBLIC_GISCUS_REPO           e.g. "your-org/discussions"
 *   NEXT_PUBLIC_GISCUS_REPO_ID        from giscus.app
 *   NEXT_PUBLIC_GISCUS_CATEGORY       e.g. "Comments"
 *   NEXT_PUBLIC_GISCUS_CATEGORY_ID    from giscus.app
 *
 * See docs/GISCUS-SETUP.md for the one-time per-site configuration steps.
 *
 * The script auto-theme-switches when `useTheme()` changes by posting a
 * message to the iframe — that's the officially supported pattern.
 */
export function GiscusComments({ slug, mapping = 'specific' }: GiscusCommentsProps) {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  // Keep the iframe theme in sync with the site's light/dark toggle.
  useEffect(() => {
    if (!containerRef.current) return;
    const iframe = containerRef.current.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (!iframe) return;
    const giscusTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
    iframe.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: giscusTheme } } },
      'https://giscus.app'
    );
  }, [resolvedTheme]);

  // Inject the script once the container is mounted. We do this manually
  // (instead of using next/script) because giscus needs to render into a
  // specific container element, not the document body.
  useEffect(() => {
    if (!containerRef.current || !repo || !repoId || !category || !categoryId) return;
    const el = containerRef.current;

    // Clear any previous giscus instance (e.g. client-side navigation between
    // posts). `replaceChildren()` with no args removes everything without
    // assigning HTML to the DOM.
    el.replaceChildren();

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', mapping);
    if (mapping === 'specific') {
      script.setAttribute('data-term', slug);
    }
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', resolvedTheme === 'dark' ? 'dark' : 'light');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    el.appendChild(script);

    return () => {
      el.replaceChildren();
    };
  }, [repo, repoId, category, categoryId, mapping, slug, resolvedTheme]);

  // Env not configured — render nothing (fail-closed).
  if (!repo || !repoId || !category || !categoryId) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border" aria-label="Comments">
      <h2 className="text-xl font-bold mb-4">Discussion</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Sign in with GitHub to leave a comment. Your replies are stored on this site&apos;s public
        discussion board.
      </p>
      <div ref={containerRef} className="giscus" />
    </section>
  );
}
