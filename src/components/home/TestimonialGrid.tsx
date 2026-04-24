import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  name: string;
  context: string;
  quote: string;
  rating: number;
  /** Set to true if this is representative/sample feedback, not a specific customer quote. FTC-compliant labeling. */
  isSample?: boolean;
}

interface TestimonialGridProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  /** Shown under the heading when any testimonial is flagged isSample — satisfies FTC 16 CFR 255 truth-in-advertising. */
  sampleDisclaimer?: string;
}

/**
 * 3-column testimonial grid with star ratings.
 * Only renders when testimonials data is provided via SITE_TESTIMONIALS env var.
 *
 * FTC compliance: any testimonial with `isSample: true` is labeled as "Representative feedback"
 * per 16 CFR Part 255. Once real verified customer quotes replace samples, omit the flag.
 */
export function TestimonialGrid({
  testimonials,
  title = 'What Our Readers Say',
  subtitle = 'Trusted by thousands of readers making smarter decisions',
  sampleDisclaimer = 'Representative reader feedback. Results vary and are not a guarantee.',
}: TestimonialGridProps) {
  if (testimonials.length === 0) return null;
  const hasSamples = testimonials.some((t) => t.isSample);

  return (
    <section className="py-16 lg:py-24 bg-muted/50">
      <div className="container">
        {/* Section heading */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
            Testimonials
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
          {hasSamples && (
            <p className="mt-4 text-xs text-muted-foreground/80 italic max-w-2xl mx-auto">
              {sampleDisclaimer}
            </p>
          )}
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, i) => (
            <Card key={i} className="border hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                {/* Star rating */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-4 h-4 ${
                        starIdx < testimonial.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-foreground italic mb-4 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Attribution */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{testimonial.name}</span>
                      {testimonial.isSample && (
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70 px-1.5 py-0.5 rounded border border-border">
                          Sample
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{testimonial.context}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
