'use client';

/**
 * BestForWidget — Phase 2D: "Which [product] is best for you?"
 *
 * Inline 3-question micro-quiz embedded in comparison/review posts.
 * Maps answers to offer recommendations via a simple decision tree.
 *
 * Usage:
 *   <BestForWidget
 *     noun="electric bike"
 *     questions={[...]}
 *     recommendations={[...]}
 *   />
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, RotateCcw, Star, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  text: string;
  options: Array<{
    label: string;
    value: string;
    /** Optional emoji or icon label */
    emoji?: string;
  }>;
}

export interface QuizRecommendation {
  /** Answer pattern: object where keys = question IDs, values = selected option values.
   *  Partial match: if all listed keys match, this recommendation fires.
   *  More specific patterns (more keys) take priority over generic ones. */
  match: Record<string, string>;
  offerId: string;
  offerName: string;
  offerImage?: string;
  offerRating?: number;
  offerHref: string;
  badge?: string;
  reason: string;
  secondaryId?: string;
  secondaryName?: string;
  secondaryHref?: string;
}

interface BestForWidgetProps {
  /** Noun used in the prompt, e.g., "electric bike", "tax software", "broker" */
  noun: string;
  questions: QuizQuestion[];
  recommendations: QuizRecommendation[];
  /** Fallback recommendation when no pattern matches */
  fallback?: Omit<QuizRecommendation, 'match'>;
  className?: string;
}

// ─── Matching logic ───────────────────────────────────────────────────────────

function findRecommendation(
  answers: Record<string, string>,
  recommendations: QuizRecommendation[]
): QuizRecommendation | null {
  // Sort by specificity (more keys = more specific = higher priority)
  const sorted = [...recommendations].sort(
    (a, b) => Object.keys(b.match).length - Object.keys(a.match).length
  );
  return sorted.find((rec) =>
    Object.entries(rec.match).every(([qId, val]) => answers[qId] === val)
  ) ?? null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BestForWidget({
  noun,
  questions,
  recommendations,
  fallback,
  className,
}: BestForWidgetProps) {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = questions[currentQ];
  const totalQ = questions.length;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (currentQ < totalQ - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      setStep('result');
    }
  };

  const reset = () => {
    setStep('intro');
    setCurrentQ(0);
    setAnswers({});
  };

  const result = step === 'result'
    ? (findRecommendation(answers, recommendations) ?? (fallback ? { ...fallback, match: {} } : null))
    : null;

  return (
    <Card className={cn('my-6 border-2 border-primary/20 bg-primary/5', className)}>
      <CardContent className="p-5">

        {/* Intro state */}
        {step === 'intro' && (
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/15">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-base">
                Which {noun} is right for you?
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Answer {totalQ} quick questions and we'll match you to the best option.
            </p>
            <Button onClick={() => setStep('quiz')} size="sm" className="gap-1.5">
              Find My Match
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Quiz state */}
        {step === 'quiz' && question && (
          <div>
            {/* Progress */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">
                Question {currentQ + 1} of {totalQ}
              </span>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 w-6 rounded-full transition-colors',
                      i < currentQ ? 'bg-primary' : i === currentQ ? 'bg-primary/60' : 'bg-muted'
                    )}
                  />
                ))}
              </div>
            </div>

            <p className="font-semibold text-sm mb-3">{question.text}</p>

            <div className="grid gap-2">
              {question.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  className="flex items-center gap-2.5 w-full text-left p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition text-sm font-medium group"
                >
                  {opt.emoji && <span className="text-base w-6 text-center">{opt.emoji}</span>}
                  <span className="flex-1">{opt.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result state */}
        {step === 'result' && result && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <Star className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Best match for you</p>
                <h3 className="font-bold text-base leading-tight">{result.offerName}</h3>
              </div>
              {result.badge && (
                <Badge className="ml-auto text-xs shrink-0">{result.badge}</Badge>
              )}
            </div>

            <div className="flex gap-4 mb-4">
              {result.offerImage && (
                <img
                  src={result.offerImage}
                  alt={result.offerName}
                  className="h-16 w-16 object-contain rounded-lg border shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                {result.offerRating && (
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3.5 w-3.5',
                          i <= Math.round(result.offerRating!) ? 'text-amber-500 fill-amber-500' : 'text-muted'
                        )}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-0.5">{result.offerRating.toFixed(1)}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{result.reason}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="flex-1 min-w-[120px]">
                <a href={result.offerHref} rel="noopener noreferrer sponsored">
                  View {result.offerName}
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </a>
              </Button>
              {result.secondaryName && result.secondaryHref && (
                <Button asChild variant="outline" size="sm" className="flex-1 min-w-[120px]">
                  <a href={result.secondaryHref} rel="noopener noreferrer sponsored">
                    Also consider: {result.secondaryName}
                  </a>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Retake
              </Button>
            </div>
          </div>
        )}

        {/* No match fallback */}
        {step === 'result' && !result && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground mb-3">
              We couldn't find a perfect match. Browse all options to compare.
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline" size="sm">
                <a href="/offers">Browse All</a>
              </Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Retake Quiz
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BestForWidget;
