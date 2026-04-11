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

    // eBike Range Calculator (ebikerevolt)
    case 'ebike_range': {
      const { battery_wh = 500, motor_wattage = 250, rider_weight = 175, terrain = 1.0, speed_mph = 15 } = inputs;
      const efficiency_wh_per_mile = (motor_wattage / speed_mph) * terrain * (rider_weight / 150);
      const range_miles = battery_wh / efficiency_wh_per_mile;
      const range_km = range_miles * 1.609;
      results.range_miles = Math.round(range_miles * 10) / 10;
      results.range_km = Math.round(range_km * 10) / 10;
      results.efficiency_wh_per_mile = Math.round(efficiency_wh_per_mile * 10) / 10;
      break;
    }

    // eBike vs Car Cost Comparison (ebikerevolt)
    case 'ebike_vs_car': {
      const { miles_per_week = 100, gas_price = 3.50, mpg = 28, ebike_price = 1500, car_insurance_monthly = 150 } = inputs;
      const annual_miles = miles_per_week * 52;
      const annual_gas_cost = (annual_miles / mpg) * gas_price;
      const annual_car_cost = annual_gas_cost + car_insurance_monthly * 12;
      const annual_ebike_electricity = (annual_miles / 20) * 0.013; // ~13 cents per kWh, 20 miles/kWh
      const annual_ebike_maintenance = 100;
      const annual_ebike_cost = annual_ebike_electricity + annual_ebike_maintenance;
      const annual_savings = annual_car_cost - annual_ebike_cost;
      const payback_months = annual_savings > 0 ? Math.ceil((ebike_price / annual_savings) * 12) : 0;
      results.annual_car_cost = Math.round(annual_car_cost);
      results.annual_ebike_cost = Math.round(annual_ebike_cost);
      results.annual_savings = Math.round(annual_savings);
      results.payback_months = payback_months;
      results.five_year_savings = Math.round(annual_savings * 5 - ebike_price);
      break;
    }

    // Life Insurance Needs Calculator (termhaven)
    case 'life_insurance_needs': {
      const { annual_income = 75000, years_income = 10, debts = 50000, dependents = 2, existing_coverage = 0 } = inputs;
      const income_replacement = annual_income * years_income;
      const child_education = dependents * 50000;
      const total_needed = income_replacement + debts + child_education;
      const recommended_coverage = Math.max(0, total_needed - existing_coverage);
      results.income_replacement = income_replacement;
      results.total_needed = total_needed;
      results.recommended_coverage = recommended_coverage;
      results.coverage_gap = recommended_coverage;
      break;
    }

    // Term vs Whole Life Cost Comparison (termhaven)
    case 'term_vs_whole': {
      const { age = 35, coverage = 500000, term_years = 20, health_rating = 1 } = inputs;
      // Approximate monthly premiums (rough industry averages, adjusted by health)
      const base_term_rate = (age < 40 ? 0.14 : age < 50 ? 0.26 : 0.55) * health_rating;
      const term_monthly = (coverage / 1000) * base_term_rate;
      const whole_monthly = term_monthly * 12; // Whole life ~12x term on average
      const term_total_20yr = term_monthly * 12 * term_years;
      const whole_total_20yr = whole_monthly * 12 * term_years;
      const whole_cash_value_20yr = whole_total_20yr * 0.3; // ~30% cash value accumulation
      results.term_monthly = Math.round(term_monthly * 100) / 100;
      results.whole_monthly = Math.round(whole_monthly * 100) / 100;
      results.term_total_20yr = Math.round(term_total_20yr);
      results.whole_total_20yr = Math.round(whole_total_20yr);
      results.whole_cash_value_20yr = Math.round(whole_cash_value_20yr);
      results.cost_difference_20yr = Math.round(whole_total_20yr - term_total_20yr);
      break;
    }

    // Debt Payoff Optimizer (mypersonalfi)
    case 'debt_payoff': {
      const { debt_balance = 10000, interest_rate = 19.99, monthly_payment = 300 } = inputs;
      const monthly_rate = interest_rate / 100 / 12;
      // Months to payoff
      let months = 0;
      let balance = debt_balance;
      let total_interest = 0;
      if (monthly_rate > 0 && monthly_payment > balance * monthly_rate) {
        while (balance > 0 && months < 600) {
          const interest = balance * monthly_rate;
          total_interest += interest;
          balance = balance + interest - monthly_payment;
          if (balance < 0) balance = 0;
          months++;
        }
      }
      results.months_to_payoff = months;
      results.years_to_payoff = Math.round((months / 12) * 10) / 10;
      results.total_interest_paid = Math.round(total_interest);
      results.total_paid = Math.round(debt_balance + total_interest);
      // Avalanche: same calc but shows interest saved vs minimum payment
      const min_payment = debt_balance * monthly_rate * 1.05;
      results.vs_minimum_months_saved = Math.max(0, 360 - months); // rough estimate
      break;
    }

    // Emergency Fund Calculator (mypersonalfi)
    case 'emergency_fund': {
      const { monthly_expenses = 3500, months_coverage = 6, current_savings = 500, monthly_contribution = 300 } = inputs;
      const target_fund = monthly_expenses * months_coverage;
      const funding_gap = Math.max(0, target_fund - current_savings);
      const months_to_goal = monthly_contribution > 0 ? Math.ceil(funding_gap / monthly_contribution) : 0;
      results.target_fund = target_fund;
      results.funding_gap = funding_gap;
      results.months_to_goal = months_to_goal;
      results.percent_funded = Math.min(100, Math.round((current_savings / target_fund) * 100));
      break;
    }

    // Self-Employment Tax Estimator (refundatlas / taxsite)
    case 'self_employment_tax': {
      const { net_income = 60000, other_income = 0, deductions = 12950 } = inputs;
      const se_tax = net_income * 0.9235 * 0.153; // SE tax on 92.35% of net income
      const se_deduction = se_tax / 2;
      const agi = net_income + other_income - se_deduction;
      const taxable_income = Math.max(0, agi - deductions);
      // Simplified 2024 tax brackets (single)
      let federal_tax = 0;
      if (taxable_income > 578125) federal_tax = 174238 + (taxable_income - 578125) * 0.37;
      else if (taxable_income > 231250) federal_tax = 52832 + (taxable_income - 231250) * 0.35;
      else if (taxable_income > 100525) federal_tax = 17168 + (taxable_income - 100525) * 0.24;
      else if (taxable_income > 47150) federal_tax = 5147 + (taxable_income - 47150) * 0.22;
      else if (taxable_income > 11600) federal_tax = 1160 + (taxable_income - 11600) * 0.12;
      else federal_tax = taxable_income * 0.10;
      const total_tax = se_tax + federal_tax;
      const quarterly_payment = total_tax / 4;
      results.se_tax = Math.round(se_tax);
      results.federal_income_tax = Math.round(federal_tax);
      results.total_tax = Math.round(total_tax);
      results.quarterly_payment = Math.round(quarterly_payment);
      results.effective_rate = Math.round((total_tax / net_income) * 100 * 10) / 10;
      break;
    }

    // ABV Calculator (homebrewexpert)
    case 'abv': {
      const { og = 1.050, fg = 1.010 } = inputs;
      // Standard ABW formula, then convert to ABV
      const abv = (og - fg) * 131.25;
      const calories_per_12oz = abv * 2.5 * 12; // ~2.5 cal per oz per %ABV
      results.abv = Math.round(abv * 100) / 100;
      results.calories_per_12oz = Math.round(calories_per_12oz);
      results.attenuation = Math.round(((og - fg) / (og - 1)) * 100);
      break;
    }

    // Brew Recipe Scaler (homebrewexpert)
    case 'brew_recipe': {
      const { original_batch_gallons = 5, new_batch_gallons = 3, grain_lbs = 10, hops_oz = 2, yeast_packets = 1 } = inputs;
      const scale = new_batch_gallons / original_batch_gallons;
      results.scaled_grain_lbs = Math.round(grain_lbs * scale * 100) / 100;
      results.scaled_hops_oz = Math.round(hops_oz * scale * 100) / 100;
      results.scaled_yeast_packets = Math.round(yeast_packets * scale * 10) / 10;
      results.scale_factor = Math.round(scale * 100) / 100;
      break;
    }

    // Coffee Dose Calculator (homebrewexpert)
    case 'coffee_dose': {
      const { brew_method = 1, water_ml = 300, ratio_preference = 1 } = inputs;
      // Golden ratios: 1=standard (1:15), 2=strong (1:12), 3=light (1:17)
      const ratios: Record<number, number> = { 1: 15, 2: 12, 3: 17 };
      const base_ratio = ratios[Math.round(brew_method)] || 15;
      const adjusted_ratio = base_ratio * ratio_preference;
      const coffee_grams = water_ml / adjusted_ratio;
      results.coffee_grams = Math.round(coffee_grams * 10) / 10;
      results.coffee_tbsp = Math.round((coffee_grams / 7) * 10) / 10; // ~7g per tbsp
      results.ratio = Math.round(adjusted_ratio);
      results.water_ml = water_ml;
      break;
    }

    // Recipe Scaler (dubaichocolate)
    case 'recipe_scaler': {
      const { original_servings = 4, desired_servings = 8, ingredient_1 = 100, ingredient_2 = 50, ingredient_3 = 25 } = inputs;
      const scale = desired_servings / original_servings;
      results.scale_factor = Math.round(scale * 100) / 100;
      results.scaled_ingredient_1 = Math.round(ingredient_1 * scale * 10) / 10;
      results.scaled_ingredient_2 = Math.round(ingredient_2 * scale * 10) / 10;
      results.scaled_ingredient_3 = Math.round(ingredient_3 * scale * 10) / 10;
      break;
    }

    // Streaming Cost Optimizer (showverdict)
    case 'streaming_cost': {
      const { num_services = 3, avg_monthly_cost = 15, hours_watched_weekly = 10, content_overlap = 30 } = inputs;
      const total_monthly = num_services * avg_monthly_cost;
      const effective_services = num_services - (content_overlap / 100) * (num_services - 1);
      const cost_per_hour = total_monthly / (hours_watched_weekly * 4);
      const potential_savings = (content_overlap / 100) * avg_monthly_cost * Math.floor(num_services / 2);
      results.total_monthly = Math.round(total_monthly * 100) / 100;
      results.total_annual = Math.round(total_monthly * 12 * 100) / 100;
      results.cost_per_hour = Math.round(cost_per_hour * 100) / 100;
      results.potential_monthly_savings = Math.round(potential_savings * 100) / 100;
      results.effective_unique_services = Math.round(effective_services * 10) / 10;
      break;
    }

    // Audiobook Platform Comparison (bookstackreviews)
    case 'audiobook_platform': {
      const { books_per_month = 3, avg_book_price = 15, podcast_hours_weekly = 5 } = inputs;
      // Compare: Audible ($14.99/mo = 1 credit), Scribd ($11.99 unlimited), Libro.fm ($14.99 = 1 credit)
      const audible_monthly = 14.99 + Math.max(0, books_per_month - 1) * avg_book_price;
      const scribd_monthly = 11.99; // unlimited
      const libro_monthly = 14.99 + Math.max(0, books_per_month - 1) * avg_book_price;
      const buy_direct_monthly = books_per_month * avg_book_price;
      results.audible_monthly = Math.round(audible_monthly * 100) / 100;
      results.scribd_monthly = scribd_monthly;
      results.buy_direct_monthly = buy_direct_monthly;
      results.best_value_index = audible_monthly < scribd_monthly ? 1 : 2; // 1=Audible, 2=Scribd
      results.annual_scribd_vs_buy = Math.round((buy_direct_monthly - scribd_monthly) * 12 * 100) / 100;
      break;
    }

    // Business Loan Payment Calculator (capitalready)
    case 'business_loan_payment': {
      const { loan_amount = 100000, annual_rate = 7.5, term_years = 5 } = inputs;
      const monthly_rate = annual_rate / 100 / 12;
      const num_payments = term_years * 12;
      const monthly_payment = loan_amount * (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) /
        (Math.pow(1 + monthly_rate, num_payments) - 1);
      const total_paid = monthly_payment * num_payments;
      const total_interest = total_paid - loan_amount;
      results.monthly_payment = Math.round(monthly_payment * 100) / 100;
      results.total_paid = Math.round(total_paid);
      results.total_interest = Math.round(total_interest);
      results.interest_rate_monthly = Math.round(monthly_rate * 10000) / 100;
      break;
    }

    // ERP ROI Calculator (quickbookstoerp)
    case 'erp_roi': {
      const { current_software_cost = 500, erp_monthly_cost = 2000, employees = 20, hours_saved_per_employee = 3 } = inputs;
      const hourly_rate = 25; // avg admin hourly rate
      const monthly_hours_saved = employees * hours_saved_per_employee * 4; // weeks
      const monthly_value_saved = monthly_hours_saved * hourly_rate;
      const error_reduction_savings = employees * 50; // $50/employee/month in reduced errors
      const total_monthly_benefit = monthly_value_saved + error_reduction_savings;
      const net_monthly_roi = total_monthly_benefit - (erp_monthly_cost - current_software_cost);
      const payback_months = net_monthly_roi > 0 ? Math.ceil((erp_monthly_cost * 3) / net_monthly_roi) : 0; // 3mo setup cost
      results.monthly_hours_saved = monthly_hours_saved;
      results.monthly_value_saved = Math.round(monthly_value_saved);
      results.total_monthly_benefit = Math.round(total_monthly_benefit);
      results.net_monthly_roi = Math.round(net_monthly_roi);
      results.annual_roi = Math.round(net_monthly_roi * 12);
      results.payback_months = payback_months;
      break;
    }

    // Payment Processing Fee Calculator (goflowpay)
    case 'payment_processing_fees': {
      const { monthly_volume = 50000, avg_transaction = 150, card_type = 1 } = inputs;
      const num_transactions = monthly_volume / avg_transaction;
      // card_type: 1=credit, 2=debit, 3=high-risk
      const rates: Record<number, { rate: number; per_tx: number }> = {
        1: { rate: 0.029, per_tx: 0.30 },  // Standard credit: 2.9% + $0.30
        2: { rate: 0.015, per_tx: 0.10 },  // Debit: 1.5% + $0.10
        3: { rate: 0.045, per_tx: 0.50 },  // High-risk: 4.5% + $0.50
      };
      const { rate, per_tx } = rates[Math.round(card_type)] || rates[1];
      const monthly_fees = monthly_volume * rate + num_transactions * per_tx;
      const annual_fees = monthly_fees * 12;
      results.monthly_fees = Math.round(monthly_fees * 100) / 100;
      results.annual_fees = Math.round(annual_fees * 100) / 100;
      results.effective_rate = Math.round((monthly_fees / monthly_volume) * 10000) / 100;
      results.num_transactions = Math.round(num_transactions);
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
