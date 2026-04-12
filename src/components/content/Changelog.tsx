import { History } from 'lucide-react';

export interface ChangelogEntry {
  /** ISO date or human-readable date of this update. */
  date: string;
  /** One-line summary of what changed. */
  summary: string;
  /** Optional longer description. */
  detail?: string;
}

interface ChangelogProps {
  entries: ChangelogEntry[];
  /** Override the section heading. */
  title?: string;
}

function formatDate(raw: string): string {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw; // fall back to raw string
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Article revision log — renders a collapsible "Why we updated this" list so
 * readers can see how the content has evolved. Complements the "Updated X ago"
 * freshness badge by explaining *what* changed, not just *when*.
 *
 * Opt-in: renders only when `post.metadata.changelog` is a non-empty array.
 * Uses native `<details>` so it starts collapsed (doesn't push content down).
 */
export function Changelog({ entries, title = 'Update history' }: ChangelogProps) {
  if (!entries || entries.length === 0) return null;

  // Sort entries most-recent first if they parse as dates; otherwise preserve order.
  const sorted = [...entries].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
    return tb - ta;
  });

  return (
    <details className="group my-6 rounded-lg border border-border bg-muted/20 overflow-hidden">
      <summary className="flex items-center gap-2 cursor-pointer p-4 text-sm font-semibold text-foreground list-none select-none hover:bg-muted/40 transition-colors [&::-webkit-details-marker]:hidden">
        <History className="h-4 w-4 text-primary" aria-hidden="true" />
        <span>{title}</span>
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          ({sorted.length} {sorted.length === 1 ? 'revision' : 'revisions'})
        </span>
      </summary>
      <ol className="list-none px-4 pb-4 pt-1 space-y-3 border-t border-border/50" aria-label="Revision history">
        {sorted.map((entry, i) => (
          <li key={i} className="relative pl-5">
            <span
              className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary/70"
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-baseline gap-2">
              <time className="text-xs font-medium text-primary" dateTime={entry.date}>
                {formatDate(entry.date)}
              </time>
              <span className="text-sm text-foreground">{entry.summary}</span>
            </div>
            {entry.detail && (
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{entry.detail}</p>
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}
