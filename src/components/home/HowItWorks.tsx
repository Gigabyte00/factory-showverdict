import { BookOpen, Scale, CheckCircle2 } from 'lucide-react';
import { getHowItWorksSteps } from '@/lib/site-config';

const defaultSteps = [
  { title: 'Read Our Reviews', description: 'In-depth, hands-on reviews written by real experts' },
  { title: 'Compare Options', description: 'Side-by-side comparisons to find the perfect fit' },
  { title: 'Make an Informed Choice', description: 'Buy with confidence using our unbiased recommendations' },
];

const stepIcons = [BookOpen, Scale, CheckCircle2];

/**
 * 3-step "How It Works" strip.
 * Steps can be customized via SITE_HOW_IT_WORKS_STEPS env var (JSON array of 3 objects).
 */
export function HowItWorks() {
  const customSteps = getHowItWorksSteps();
  const steps = (customSteps || defaultSteps).map((step, i) => ({
    number: i + 1,
    icon: stepIcons[i],
    ...step,
  }));

  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Dotted connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px border-t-2 border-dashed border-border"
            aria-hidden="true"
          />

          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-4 relative z-10 bg-background">
                <step.icon className="w-8 h-8 text-primary" />
                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                  {step.number}
                </span>
              </div>
              <span className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">
                Step {step.number}
              </span>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
