'use client';

/**
 * LeadGenForm — Phase 8B
 *
 * Progressive multi-step lead capture for YMYL sites (insurance, loans, finance).
 * 3-step wizard: qualification → contact → confirmation.
 * Stores leads in Supabase `leads` table via API route.
 *
 * Usage:
 *   <LeadGenForm
 *     siteId="uuid"
 *     niche="life insurance"
 *     steps={[...]}
 *   />
 */

import { useState } from 'react';
import { ChevronRight, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface LeadFormStep {
  id: string;
  question: string;
  subtext?: string;
  type: 'choice' | 'text' | 'email' | 'phone';
  choices?: Array<{ label: string; value: string; icon?: string }>;
  placeholder?: string;
  required?: boolean;
}

interface LeadGenFormProps {
  siteId: string;
  niche?: string | null;
  /** Page URL where the form was shown */
  sourceUrl?: string;
  steps: LeadFormStep[];
  /** CTA text on the final submit button */
  submitLabel?: string;
  /** Headline shown above the form */
  headline?: string;
  subheadline?: string;
  /** Shown in the success state */
  successMessage?: string;
  className?: string;
}

export function LeadGenForm({
  siteId,
  niche,
  sourceUrl,
  steps,
  submitLabel = 'Get My Free Quote',
  headline,
  subheadline,
  successMessage,
  className,
}: LeadGenFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep) / steps.length) * 100;

  const handleChoice = (value: string) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleTextNext = (value: string) => {
    if (step.required && !value.trim()) return;
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
    } else {
      submitLead(newAnswers);
    }
  };

  const submitLead = async (finalAnswers: Record<string, string>) => {
    setStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: siteId,
          email: finalAnswers.email || finalAnswers[steps.find((s) => s.type === 'email')?.id || ''] || '',
          name: finalAnswers.name || finalAnswers[steps.find((s) => s.id === 'name')?.id || ''] || '',
          metadata: finalAnswers,
          source_url: sourceUrl || (typeof window !== 'undefined' ? window.location.href : ''),
        }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <Card className={cn('border-emerald-200 dark:border-emerald-800', className)}>
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">You&apos;re all set!</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {successMessage || `Thank you! A ${niche || 'specialist'} will be in touch with your personalized options shortly.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        {/* Header */}
        {(headline || subheadline) && (
          <div className="bg-primary/10 px-6 py-5 border-b">
            {headline && <h3 className="font-bold text-lg">{headline}</h3>}
            {subheadline && <p className="text-sm text-muted-foreground mt-0.5">{subheadline}</p>}
          </div>
        )}

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          {/* Step counter */}
          <p className="text-xs text-muted-foreground mb-4">
            Step {currentStep + 1} of {steps.length}
          </p>

          {/* Question */}
          <h4 className="font-semibold text-base mb-1">{step.question}</h4>
          {step.subtext && (
            <p className="text-sm text-muted-foreground mb-4">{step.subtext}</p>
          )}

          {/* Choice type */}
          {step.type === 'choice' && step.choices && (
            <div className="grid gap-2 mt-4">
              {step.choices.map((choice) => (
                <button
                  key={choice.value}
                  onClick={() => handleChoice(choice.value)}
                  className="flex items-center gap-3 w-full text-left p-3.5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition text-sm font-medium group"
                >
                  {choice.icon && (
                    <span className="text-xl w-8 text-center shrink-0">{choice.icon}</span>
                  )}
                  <span className="flex-1">{choice.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          )}

          {/* Text / email / phone type */}
          {(step.type === 'text' || step.type === 'email' || step.type === 'phone') && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = (e.currentTarget.elements.namedItem('field') as HTMLInputElement).value;
                if (isLastStep) {
                  submitLead({ ...answers, [step.id]: val });
                } else {
                  handleTextNext(val);
                }
              }}
              className="mt-4 space-y-3"
            >
              <input
                name="field"
                type={step.type === 'email' ? 'email' : step.type === 'phone' ? 'tel' : 'text'}
                placeholder={step.placeholder || ''}
                required={step.required !== false}
                defaultValue={answers[step.id] || ''}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isLastStep ? (
                  submitLabel
                ) : (
                  <>Continue <ChevronRight className="h-4 w-4" /></>
                )}
              </Button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-3 text-sm text-red-500">Something went wrong. Please try again.</p>
          )}
        </div>

        {/* Trust footer */}
        <div className="px-6 pb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          Your information is secure and never shared with third parties.
        </div>
      </CardContent>
    </Card>
  );
}

export default LeadGenForm;
