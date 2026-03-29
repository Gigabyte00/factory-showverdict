'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CalculatorTemplate, CalculatorInputField } from '@/types';

interface CalculatorProps {
  template: CalculatorTemplate;
  siteId: string;
}

/**
 * Safe math operations for calculator formulas
 * Instead of eval/Function, we use predefined operations
 */
function safeCalculate(
  calculatorType: string,
  inputs: Record<string, number>
): Record<string, number> {
  const results: Record<string, number> = {};

  switch (calculatorType) {
    // ROI Calculator
    case 'roi': {
      const { investment = 0, annual_return = 0, years = 1 } = inputs;
      results.total_return = investment * Math.pow(1 + annual_return / 100, years);
      results.profit = results.total_return - investment;
      results.roi_percent = ((results.profit / investment) * 100) || 0;
      break;
    }

    // AI Coding Tool ROI (aicoderhq)
    case 'ai_coding_roi': {
      const { hourly_rate = 50, hours_per_week = 40, time_saved_percent = 20, tool_cost = 20 } = inputs;
      const weekly_hours_saved = hours_per_week * (time_saved_percent / 100);
      const weekly_value = weekly_hours_saved * hourly_rate;
      const monthly_value = weekly_value * 4;
      const annual_value = monthly_value * 12;
      const annual_cost = tool_cost * 12;
      results.hours_saved_weekly = weekly_hours_saved;
      results.monthly_savings = monthly_value - tool_cost;
      results.annual_savings = annual_value - annual_cost;
      results.roi_multiple = annual_value / annual_cost;
      break;
    }

    // Pet Food Calculator (pawsrated)
    case 'pet_food': {
      const { weight = 30, activity_level = 1, age_factor = 1 } = inputs;
      // Base: 30 calories per pound, adjusted for activity
      const daily_calories = weight * 30 * activity_level * age_factor;
      const daily_cups = daily_calories / 400; // ~400 cal per cup average
      results.daily_calories = daily_calories;
      results.daily_cups = daily_cups;
      results.monthly_cups = daily_cups * 30;
      results.monthly_bags = (daily_cups * 30) / 48; // ~48 cups per 30lb bag
      break;
    }

    // Sleep Debt Calculator (sleepwise)
    case 'sleep_debt': {
      const { ideal_sleep = 8, actual_sleep = 6, days = 7 } = inputs;
      const daily_debt = ideal_sleep - actual_sleep;
      const total_debt = daily_debt * days;
      const recovery_days = total_debt / 2; // Can recover ~2 hours per day max
      results.daily_debt = daily_debt;
      results.total_debt = total_debt;
      results.recovery_days = Math.ceil(recovery_days);
      results.health_impact = Math.min(100, total_debt * 5); // Impact score 0-100
      break;
    }

    // TDEE/Macro Calculator (homegymhq)
    case 'tdee': {
      const { weight = 150, height = 68, age = 30, activity = 1.55, gender = 1 } = inputs;
      // Mifflin-St Jeor formula (weight in lbs, height in inches)
      const weight_kg = weight * 0.453592;
      const height_cm = height * 2.54;
      let bmr: number;
      if (gender === 1) { // Male
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
      } else { // Female
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
      }
      const tdee = bmr * activity;
      results.bmr = Math.round(bmr);
      results.tdee = Math.round(tdee);
      results.cut_calories = Math.round(tdee - 500);
      results.bulk_calories = Math.round(tdee + 300);
      results.protein_grams = Math.round(weight * 0.8); // 0.8g per lb
      break;
    }

    // Planting Calendar (tinygrow) - simplified
    case 'planting': {
      const { zone = 7, frost_tolerance = 0 } = inputs;
      // Days before/after last frost (zone 7 avg last frost = day 100, ~April 10)
      const last_frost_day = 60 + (10 - zone) * 10; // Approximate
      const planting_day = last_frost_day + frost_tolerance;
      results.planting_day = planting_day;
      results.start_indoors_day = planting_day - 42; // 6 weeks before
      results.last_frost_day = last_frost_day;
      break;
    }

    // Savings Calculator (generic)
    case 'savings': {
      const { current_cost = 100, new_cost = 50, usage_per_month = 1 } = inputs;
      const monthly_savings = (current_cost - new_cost) * usage_per_month;
      results.monthly_savings = monthly_savings;
      results.annual_savings = monthly_savings * 12;
      results.five_year_savings = monthly_savings * 60;
      results.savings_percent = ((current_cost - new_cost) / current_cost) * 100;
      break;
    }

    // Default: pass through inputs as results
    default:
      Object.assign(results, inputs);
  }

  return results;
}

export function Calculator({ template, siteId }: CalculatorProps) {
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Initialize inputs with default values
  useEffect(() => {
    const defaults: Record<string, number> = {};
    template.input_fields.forEach((field: CalculatorInputField) => {
      defaults[field.name] = field.default_value;
    });
    setInputs(defaults);
  }, [template]);

  const handleInputChange = (fieldName: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [fieldName]: parseFloat(value) || 0,
    }));
  };

  const handleCalculate = async () => {
    setLoading(true);

    try {
      // Use safe calculation based on calculator_type
      const calculatedResults = safeCalculate(template.calculator_type, inputs);
      setResults(calculatedResults);

      // Track usage
      await supabase.from('calculator_responses').insert({
        site_id: siteId,
        template_id: template.id,
        session_id: typeof window !== 'undefined' ? sessionStorage.getItem('session_id') : null,
        inputs,
        results: calculatedResults,
      });

      // Increment usage count (fire and forget)
      supabase
        .from('calculator_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', template.id)
        .then(() => {});

    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !results) return;

    try {
      const { data: subscriber } = await supabase
        .from('newsletter_subscribers')
        .upsert({
          site_id: siteId,
          email,
          source: 'calculator',
          metadata: { calculator_slug: template.slug, results },
        })
        .select()
        .single();

      if (subscriber) {
        await supabase
          .from('calculator_responses')
          .update({ subscriber_id: subscriber.id, email_captured: true })
          .eq('template_id', template.id)
          .order('created_at', { ascending: false })
          .limit(1);
      }

      setEmailSubmitted(true);
      setShowEmailCapture(false);
    } catch (error) {
      console.error('Email submission failed:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(1)}K`;
    if (Number.isInteger(num)) return String(num);
    return num.toFixed(2);
  };

  const renderResults = () => {
    if (!results) return null;

    // Replace placeholders in result template
    let formattedText = template.result_template || '';

    Object.entries(results).forEach(([key, value]) => {
      const formatted = formatNumber(value);
      formattedText = formattedText.replace(new RegExp(`{{${key}}}`, 'g'), formatted);
    });

    // Also replace inputs in template
    Object.entries(inputs).forEach(([key, value]) => {
      formattedText = formattedText.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    return (
      <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200">
          Your Results
        </h3>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {formattedText.split('\n').map((line, index) => (
            <p key={index} className="mb-2">{line}</p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {template.cta_url && (
            <Button asChild>
              <a href={template.cta_url}>
                {template.cta_text || 'View Recommendations'}
              </a>
            </Button>
          )}
          {template.show_email_capture && !emailSubmitted && (
            <Button variant="outline" onClick={() => setShowEmailCapture(true)}>
              Get Detailed Report
            </Button>
          )}
          {emailSubmitted && (
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
              Report sent to your email!
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        {template.description && (
          <CardDescription>{template.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {template.input_fields.map((field: CalculatorInputField) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.unit && <span className="text-muted-foreground ml-1">({field.unit})</span>}
              </Label>
              {field.type === 'range' ? (
                <div className="space-y-1">
                  <input
                    id={field.name}
                    type="range"
                    min={field.min || 0}
                    max={field.max || 100}
                    step={field.step || 1}
                    value={inputs[field.name] ?? field.default_value}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground text-center">
                    {inputs[field.name] ?? field.default_value} {field.unit}
                  </div>
                </div>
              ) : (
                <Input
                  id={field.name}
                  type="number"
                  value={inputs[field.name] ?? field.default_value}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  min={field.min}
                  max={field.max}
                  step={field.step || 'any'}
                />
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleCalculate}
          disabled={loading}
          className="mt-6 w-full"
          size="lg"
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </Button>

        {renderResults()}

        {/* Email capture modal */}
        {showEmailCapture && results && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Get Your Detailed Report</CardTitle>
                <CardDescription>
                  We will email you a comprehensive breakdown with personalized recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Send Report
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEmailCapture(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
