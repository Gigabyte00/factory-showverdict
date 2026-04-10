import Image from 'next/image';
import { Quote } from 'lucide-react';

interface ExpertQuoteProps {
  quote: string;
  expertName: string;
  expertTitle?: string;
  expertImage?: string;
  source?: string;
  sourceUrl?: string;
  className?: string;
}

/**
 * Styled expert pull-quote with credentials.
 * Renders as a blockquote with Person-like attribution for credibility.
 *
 * Usage in markdown (via remark plugin):
 *   :::expert-quote[name="Dr. Smith" title="PhD Nutrition" image="/headshot.jpg"]
 *   "Vitamin C supplementation showed significant improvement..."
 *   :::
 *
 * Or directly in JSX for programmatic use.
 */
export function ExpertQuote({
  quote,
  expertName,
  expertTitle,
  expertImage,
  source,
  sourceUrl,
  className = '',
}: ExpertQuoteProps) {
  return (
    <figure
      className={`border-l-4 border-primary/40 bg-primary/5 rounded-r-xl pl-5 pr-4 py-4 my-6 ${className}`}
      itemScope
      itemType="https://schema.org/Statement"
    >
      <Quote className="h-6 w-6 text-primary/40 mb-2" aria-hidden />

      <blockquote
        className="text-base leading-relaxed text-foreground/90 italic mb-3"
        itemProp="text"
      >
        &ldquo;{quote}&rdquo;
      </blockquote>

      <figcaption
        className="flex items-center gap-2.5"
        itemScope
        itemType="https://schema.org/Person"
      >
        {expertImage ? (
          <Image
            src={expertImage}
            alt={expertName}
            width={36}
            height={36}
            className="rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">{expertName.charAt(0)}</span>
          </div>
        )}
        <div>
          <span className="text-sm font-semibold" itemProp="name">
            {expertName}
          </span>
          {expertTitle && (
            <span className="text-xs text-muted-foreground ml-1.5" itemProp="jobTitle">
              {expertTitle}
            </span>
          )}
          {source && (
            <p className="text-xs text-muted-foreground">
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition"
                >
                  {source}
                </a>
              ) : (
                source
              )}
            </p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export default ExpertQuote;
