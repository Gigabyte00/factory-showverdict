'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calculator, ClipboardList, Search, BookOpen, MessagesSquare, Scale, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ToolItem {
  id: string;
  name: string;
  description: string | null;
  href: string;
  kind: 'calculator' | 'quiz' | 'reference';
  metrics?: { label: string; value: string } | null;
}

interface ToolsBrowserProps {
  tools: ToolItem[];
  niche: string | null;
}

const KIND_META: Record<
  ToolItem['kind'],
  { label: string; Icon: typeof Calculator; color: string }
> = {
  calculator: { label: 'Calculators', Icon: Calculator, color: 'text-blue-600 dark:text-blue-400' },
  quiz: { label: 'Quizzes', Icon: ClipboardList, color: 'text-purple-600 dark:text-purple-400' },
  reference: { label: 'Reference', Icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400' },
};

type FilterKind = 'all' | ToolItem['kind'];

export function ToolsBrowser({ tools, niche }: ToolsBrowserProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKind>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      if (filter !== 'all' && t.kind !== filter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [tools, filter, query]);

  const counts = useMemo(() => {
    return {
      all: tools.length,
      calculator: tools.filter((t) => t.kind === 'calculator').length,
      quiz: tools.filter((t) => t.kind === 'quiz').length,
      reference: tools.filter((t) => t.kind === 'reference').length,
    };
  }, [tools]);

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <div className="rounded-lg border bg-card p-4 flex flex-wrap items-center gap-3">
        <label className="relative block flex-1 min-w-[220px]">
          <span className="sr-only">Search tools</span>
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder={`Search ${niche ? niche + ' ' : ''}tools…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter tools by type">
          {(['all', 'calculator', 'quiz', 'reference'] as const).map((k) => {
            const active = filter === k;
            const label = k === 'all' ? 'All' : KIND_META[k].label;
            const count = counts[k];
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={count === 0 && k !== 'all'}
                onClick={() => setFilter(k)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70',
                  count === 0 && k !== 'all' && 'opacity-40 cursor-not-allowed'
                )}
              >
                <span>{label}</span>
                <span className="text-[10px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
          <p className="font-medium text-foreground">No matching tools</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different keyword, or clear the filter.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none">
          {filtered.map((tool) => {
            const { Icon, label, color } = KIND_META[tool.kind];
            return (
              <li key={tool.id}>
                <Link href={tool.href} className="block h-full group">
                  <Card className="h-full transition hover:border-primary/30 hover:shadow-md">
                    <CardContent className="p-5 flex flex-col gap-3 h-full">
                      <div className="flex items-start justify-between gap-2">
                        <Icon className={cn('h-5 w-5', color)} aria-hidden="true" />
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {label.replace(/s$/, '')}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                        {tool.description && (
                          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                            {tool.description}
                          </p>
                        )}
                      </div>
                      {tool.metrics && (
                        <p className="text-xs text-muted-foreground mt-auto">
                          {tool.metrics.value} {tool.metrics.label}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Secondary CTA — comparison builder is a tool too */}
      <aside className="rounded-lg border bg-muted/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Scale className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Compare products side-by-side</p>
            <p className="text-sm text-muted-foreground">
              Pick any 2–4 products from our catalogue and see the differences at a glance.
            </p>
          </div>
        </div>
        <Link
          href="/compare/builder"
          className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          Open builder →
        </Link>
      </aside>

      <aside className="rounded-lg border bg-muted/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MessagesSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Have a specific question?</p>
            <p className="text-sm text-muted-foreground">
              Browse our {niche ? `${niche} ` : ''}FAQ or jump into the glossary of terms.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/glossary"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Glossary
          </Link>
        </div>
      </aside>
    </div>
  );
}
