'use client';

/**
 * ArticleSidebar — Phase 9C
 *
 * Sticky desktop sidebar for longform/pillar content.
 * Features:
 * - Table of Contents extracted from heading tags
 * - Active heading highlight on scroll
 * - Featured offer callout (appears after page load)
 * - Newsletter opt-in that slides in after 50% scroll
 * - Share buttons
 *
 * Only renders visibly on lg+ screens; hidden on mobile.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ExternalLink, Twitter, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface FeaturedOffer {
  name: string;
  href: string;
  badge?: string;
  rating?: number;
}

interface ArticleSidebarProps {
  /** CSS selector of the article element to extract headings from */
  articleSelector?: string;
  featuredOffer?: FeaturedOffer | null;
  siteId?: string;
  niche?: string | null;
  className?: string;
}

function extractToc(selector: string): TocItem[] {
  const article = document.querySelector(selector);
  if (!article) return [];
  const headings = article.querySelectorAll('h2, h3');
  const items: TocItem[] = [];
  headings.forEach((h) => {
    if (!h.id) {
      // Auto-assign id from text
      h.id = h.textContent?.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || `h-${items.length}`;
    }
    items.push({
      id: h.id,
      text: h.textContent?.trim() || '',
      level: parseInt(h.tagName[1]),
    });
  });
  return items;
}

export function ArticleSidebar({
  articleSelector = 'article',
  featuredOffer,
  siteId,
  niche,
  className,
}: ArticleSidebarProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [showOptIn, setShowOptIn] = useState(false);
  const [copied, setCopied] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract TOC on mount
  useEffect(() => {
    setToc(extractToc(articleSelector));
  }, [articleSelector]);

  // Highlight active heading via IntersectionObserver
  useEffect(() => {
    if (!toc.length) return;
    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [toc]);

  // Show newsletter opt-in after 50% scroll
  useEffect(() => {
    const check = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.body.scrollHeight;
      if (scrolled / total > 0.5) setShowOptIn(true);
    };
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  if (!toc.length && !featuredOffer) return null;

  return (
    <aside
      className={cn(
        'hidden lg:block sticky top-24 space-y-5 self-start',
        className
      )}
    >
      {/* Table of Contents */}
      {toc.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            In this article
          </p>
          <nav>
            <ul className="space-y-1">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={cn(
                      'block text-sm leading-snug py-1 transition-colors hover:text-primary',
                      item.level === 3 && 'pl-3 text-xs',
                      activeId === item.id
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Featured offer */}
      {featuredOffer && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          {featuredOffer.badge && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {featuredOffer.badge}
            </span>
          )}
          <p className="font-semibold text-sm mt-1 mb-3">{featuredOffer.name}</p>
          {featuredOffer.rating && (
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={cn('text-xs', i <= Math.round(featuredOffer.rating!) ? 'text-amber-500' : 'text-muted')}>★</span>
              ))}
              <span className="text-xs text-muted-foreground">{featuredOffer.rating.toFixed(1)}</span>
            </div>
          )}
          <Button asChild size="sm" className="w-full gap-1.5 text-xs">
            <a href={featuredOffer.href} rel="noopener noreferrer sponsored" target="_blank">
              View Deal
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      )}

      {/* Newsletter opt-in — fades in after 50% scroll */}
      {showOptIn && siteId && (
        <div className={cn(
          'rounded-xl border p-4 transition-all duration-500',
          showOptIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        )}>
          <p className="text-xs font-semibold mb-1">Stay updated</p>
          <p className="text-xs text-muted-foreground mb-3">
            Get the best {niche || 'tips'} guides in your inbox.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, site_id: siteId }),
              });
              form.reset();
            }}
            className="flex gap-2"
          >
            <input
              name="email"
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 min-w-0 rounded-lg border border-input bg-background px-2 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button type="submit" size="sm" className="text-xs shrink-0">Join</Button>
          </form>
        </div>
      )}

      {/* Share buttons */}
      <div className="flex items-center gap-2">
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition border rounded-lg px-2.5 py-1.5"
        >
          <Twitter className="h-3.5 w-3.5" />
          Share
        </a>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition border rounded-lg px-2.5 py-1.5"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Link2 className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </aside>
  );
}

export default ArticleSidebar;
