import { CheckCircle2, XCircle } from 'lucide-react';

export interface AudienceFitData {
  /** Reasons this product/guide IS a good fit. Short phrases, not full sentences. */
  forYou?: string[];
  /** Reasons this product/guide IS NOT a good fit. Honest gatekeeping. */
  notForYou?: string[];
}

interface AudienceFitProps {
  data: AudienceFitData;
  className?: string;
}

/**
 * "Who this is for / Who it's NOT for" — respects the reader's time by naming
 * the cases where the current article or product is the wrong match. Honest
 * gatekeeping outperforms generic "great for everyone" marketing copy.
 *
 * Opt-in: render only when the post's metadata includes an `audienceFit` block.
 */
export function AudienceFit({ data, className }: AudienceFitProps) {
  const { forYou = [], notForYou = [] } = data;
  const hasForYou = forYou.length > 0;
  const hasNotForYou = notForYou.length > 0;

  if (!hasForYou && !hasNotForYou) return null;

  return (
    <aside
      className={`my-8 rounded-lg border border-border bg-card overflow-hidden ${className ?? ''}`}
      aria-label="Is this for you"
    >
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {hasForYou && (
          <div className="p-5">
            <h3 className="flex items-center gap-2 mb-3 font-semibold text-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>This is for you if…</span>
            </h3>
            <ul className="space-y-2">
              {forYou.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasNotForYou && (
          <div className="p-5 bg-muted/20">
            <h3 className="flex items-center gap-2 mb-3 font-semibold text-foreground">
              <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span>Skip this if…</span>
            </h3>
            <ul className="space-y-2">
              {notForYou.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
