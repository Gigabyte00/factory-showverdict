import { BookMarked, ExternalLink } from 'lucide-react';

export interface Source {
  /** Display title of the source. */
  title: string;
  /** URL the source points to. Optional — some sources are books/papers without a URL. */
  url?: string;
  /** Publisher/author line, e.g. "National Electrical Code 2023" or "Consumer Reports, Feb 2026" */
  publisher?: string;
  /** When this source was accessed or the data it reports. */
  accessedOn?: string;
}

interface SourcesProps {
  sources: Source[];
  /** Override section heading. Defaults to "Sources & References". */
  title?: string;
}

/**
 * Sources / References section for articles — a major E-E-A-T and AEO signal.
 *
 * LLMs and search systems prioritize content that visibly cites its sources.
 * Also builds reader trust directly: showing your homework prevents the "made
 * up on the spot" vibe that kills credibility in review/how-to content.
 *
 * Opt-in: only renders when `post.metadata.sources` is a non-empty array.
 * Uses <cite> + schema.org markup for machine-readable citations.
 */
export function Sources({ sources, title = 'Sources & References' }: SourcesProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <section
      className="mt-12 pt-8 border-t border-border"
      aria-label="Sources and references"
      itemScope
      itemType="https://schema.org/Article"
    >
      <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-foreground">
        <BookMarked className="h-5 w-5 text-primary" aria-hidden="true" />
        {title}
      </h2>
      <ol className="space-y-3 list-decimal list-inside text-sm text-muted-foreground">
        {sources.map((source, i) => (
          <li key={i} className="leading-relaxed" itemProp="citation" itemScope itemType="https://schema.org/CreativeWork">
            <cite className="not-italic">
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                  itemProp="url"
                >
                  <span itemProp="name">{source.title}</span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                </a>
              ) : (
                <span className="font-medium text-foreground" itemProp="name">
                  {source.title}
                </span>
              )}
              {source.publisher && (
                <>
                  {' — '}
                  <span itemProp="publisher">{source.publisher}</span>
                </>
              )}
              {source.accessedOn && (
                <span className="text-xs">
                  {' '}(accessed {source.accessedOn})
                </span>
              )}
            </cite>
          </li>
        ))}
      </ol>
    </section>
  );
}
