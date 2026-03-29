'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { QuizTemplate, QuizQuestion, QuizResult, QuizOption } from '@/types';

interface QuizWizardProps {
  template: QuizTemplate;
  questions: QuizQuestion[];
  results: QuizResult[];
  siteId: string;
}

/**
 * Interactive Quiz Wizard Component
 *
 * Multi-step quiz with:
 * - Progress tracking
 * - Multiple question types (single_choice, multiple_choice, range, budget)
 * - Score-based result matching
 * - Email capture for lead generation
 * - Personalized product recommendations
 */
export function QuizWizard({ template, questions, results, siteId }: QuizWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [score, setScore] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [matchedResult, setMatchedResult] = useState<QuizResult | null>(null);
  const [responseId, setResponseId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const sortedQuestions = [...questions].sort((a, b) => a.order_index - b.order_index);
  const currentQuestion = sortedQuestions[currentStep];
  const isLastQuestion = currentStep === sortedQuestions.length - 1;
  const progress = ((currentStep + 1) / sortedQuestions.length) * 100;

  const handleSingleChoice = (questionId: string, option: QuizOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option.value }));

    // Update score and tags
    if (option.score) {
      setScore((prev) => prev + option.score!);
    }
    if (option.tags) {
      setTags((prev) => [...new Set([...prev, ...option.tags!])]);
    }
  };

  const handleMultipleChoice = (questionId: string, option: QuizOption, checked: boolean) => {
    const current = (answers[questionId] as string[]) || [];
    const updated = checked
      ? [...current, option.value]
      : current.filter((v) => v !== option.value);

    setAnswers((prev) => ({ ...prev, [questionId]: updated }));

    // Update score and tags based on selection
    if (option.score) {
      setScore((prev) => prev + (checked ? option.score! : -option.score!));
    }
    if (option.tags && checked) {
      setTags((prev) => [...new Set([...prev, ...option.tags!])]);
    }
  };

  const handleRangeChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const canProceed = (): boolean => {
    if (!currentQuestion?.is_required) return true;
    const answer = answers[currentQuestion.id];

    if (currentQuestion.question_type === 'multiple_choice') {
      return Array.isArray(answer) && answer.length > 0;
    }

    return answer !== undefined && answer !== null && answer !== '';
  };

  const findMatchingResult = (): QuizResult | null => {
    // Sort by priority (highest first)
    const sortedResults = [...results].sort((a, b) => b.priority - a.priority);

    for (const result of sortedResults) {
      // Check score range
      const scoreMatch = (
        (result.min_score === null || score >= result.min_score) &&
        (result.max_score === null || score <= result.max_score)
      );

      // Check required tags
      const tagsMatch = !result.required_tags ||
        result.required_tags.every(tag => tags.includes(tag));

      if (scoreMatch && tagsMatch) {
        return result;
      }
    }

    // Fallback to first result if no match
    return results[0] || null;
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      setShowEmailCapture(true);

      // Track quiz start and save partial response
      const result = findMatchingResult();
      setMatchedResult(result);

      const { data } = await supabase.from('quiz_responses').insert({
        quiz_id: template.id,
        result_id: result?.id,
        answers,
        score,
        tags,
        started_at: new Date().toISOString(),
      }).select().single();

      if (data) {
        setResponseId(data.id);
      }

      // Increment completion count
      supabase
        .from('quiz_templates')
        .update({ completion_count: template.completion_count + 1 })
        .eq('id', template.id)
        .then(() => {});

    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (showEmailCapture) {
      setShowEmailCapture(false);
    } else if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Update response with email if provided
      if (email && responseId) {
        // Add to newsletter
        const { data: subscriber } = await supabase
          .from('newsletter_subscribers')
          .upsert({
            site_id: siteId,
            email,
            source: 'quiz',
            metadata: { quiz_slug: template.slug, result: matchedResult?.result_key },
          })
          .select()
          .single();

        // Update quiz response
        await supabase
          .from('quiz_responses')
          .update({
            email,
            completed_at: new Date().toISOString(),
            subscribed_newsletter: true,
          })
          .eq('id', responseId);
      } else if (responseId) {
        await supabase
          .from('quiz_responses')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', responseId);
      }
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show result after email capture
  if (matchedResult && !showEmailCapture && responseId) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{matchedResult.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {matchedResult.image_url && (
              <img
                src={matchedResult.image_url}
                alt={matchedResult.title}
                className="w-full rounded-lg"
              />
            )}

            {matchedResult.description && (
              <p className="text-muted-foreground">{matchedResult.description}</p>
            )}

            {matchedResult.cta_url && (
              <Button asChild className="w-full" size="lg">
                <a href={matchedResult.cta_url}>
                  {matchedResult.cta_text || 'View Recommendations'}
                </a>
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setCurrentStep(0);
                setAnswers({});
                setScore(0);
                setTags([]);
                setMatchedResult(null);
                setResponseId(null);
                setEmail('');
              }}
            >
              Retake Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email capture screen
  if (showEmailCapture) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <Progress value={100} className="mb-4" />
          <div className="text-sm text-muted-foreground text-right">Complete!</div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get Your Personalized Results</CardTitle>
            <CardDescription>
              Enter your email to receive your recommendations and exclusive deals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {template.show_email_capture && (
              <div className="space-y-2">
                <Label htmlFor="quiz-email">Email Address (optional)</Label>
                <Input
                  id="quiz-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="max-w-md mx-auto"
                />
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-32">
                {isSubmitting ? 'Loading...' : 'See My Results'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              We only use your email to send recommendations. No spam.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Question screen
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentStep + 1} of {sortedQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="mb-4" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion?.question_text}</CardTitle>
          {currentQuestion?.help_text && (
            <CardDescription>{currentQuestion.help_text}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion?.question_type === 'single_choice' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((opt: QuizOption) => (
                <button
                  key={opt.value}
                  onClick={() => handleSingleChoice(currentQuestion.id, opt)}
                  className={`w-full flex items-center p-4 border rounded-lg hover:bg-accent transition-colors text-left ${
                    answers[currentQuestion.id] === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[currentQuestion.id] === opt.value
                      ? 'border-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {answers[currentQuestion.id] === opt.value && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.question_type === 'multiple_choice' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((opt: QuizOption) => {
                const isChecked = ((answers[currentQuestion.id] as string[]) || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleMultipleChoice(currentQuestion.id, opt, !isChecked)}
                    className={`w-full flex items-center p-4 border rounded-lg hover:bg-accent transition-colors text-left ${
                      isChecked ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                      isChecked ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {isChecked && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {(currentQuestion?.question_type === 'budget' || currentQuestion?.question_type === 'range') && (
            <div className="space-y-3">
              {currentQuestion.options?.map((opt: QuizOption) => (
                <button
                  key={opt.value}
                  onClick={() => handleSingleChoice(currentQuestion.id, opt)}
                  className={`w-full flex items-center p-4 border rounded-lg hover:bg-accent transition-colors text-left ${
                    answers[currentQuestion.id] === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[currentQuestion.id] === opt.value
                      ? 'border-primary'
                      : 'border-muted-foreground'
                  }`}>
                    {answers[currentQuestion.id] === opt.value && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              {isLastQuestion ? 'See Results' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
