'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ListOrdered } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface InlineTOCProps {
  /** CSS selector for the element whose headings feed the TOC. */
  articleSelector?: string;
  /** Minimum number of headings before the TOC renders at all. */
  minHeadings?: number;
}

/**
 * Collapsible inline "Table of Contents" that extracts h2/h3 headings from the
 * rendered article DOM. Designed for medium-length articles (1,200–3,000 words)
 * that use `StandardArticle`; LongformArticle already has ArticleSidebar with
 * its own TOC, so we don't double-render there.
 *
 * Starts closed by default so it doesn't push content below the fold; opens on
 * user tap. Auto-assigns missing heading IDs so anchor links actually resolve.
 */
export function InlineTOC({ articleSelector = 'article', minHeadings = 3 }: InlineTOCProps) {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const article = document.querySelector(articleSelector);
    if (!article) return;
    const headings = Array.from(article.querySelectorAll('h2, h3'));
    const toc: TocItem[] = [];
    headings.forEach((h, i) => {
      const text = h.textContent?.trim() || '';
      if (!text) return; // Skip decorative headings that have no text content
      if (!h.id) {
        const base = text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');
        h.id = base || `section-${i}`;
      }
      toc.push({
        id: h.id,
        text,
        level: parseInt(h.tagName[1], 10),
      });
    });
    setItems(toc);
  }, [articleSelector]);

  if (items.length < minHeadings) return null;

  return (
    <details className="group my-6 rounded-lg border border-border bg-muted/30 overflow-hidden">
      <summary className="flex items-center gap-2 cursor-pointer p-4 text-sm font-semibold text-foreground list-none select-none hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden">
        <ListOrdered className="h-4 w-4 text-primary" aria-hidden="true" />
        <span>Table of Contents</span>
        <span className="ml-1 text-xs font-normal text-muted-foreground">({items.length} sections)</span>
        <ChevronDown
          className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <nav aria-label="Table of contents" className="px-4 pb-4 pt-1 border-t border-border/50">
        <ol className="space-y-1 list-none">
          {items.map((item) => (
            <li
              key={item.id}
              className={item.level === 3 ? 'ml-4' : ''}
            >
              <a
                href={`#${item.id}`}
                className="block py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
