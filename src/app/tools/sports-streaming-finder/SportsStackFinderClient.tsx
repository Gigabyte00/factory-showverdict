'use client';

/**
 * Sports Streaming Stack Finder — interactive client component.
 *
 * Pick your leagues, tell us what you already pay for, set a budget cap,
 * and we compute the cheapest stack of streaming services that covers
 * your leagues (greedy set-cover by price), plus a no-compromise
 * full-coverage alternative and explicit gap callouts.
 */

import { useMemo, useState, type FormEvent } from 'react';
import {
  LEAGUES,
  LEAGUE_LABELS,
  SPORTS_SERVICES,
  VERIFIED_AS_OF,
  type League,
  type SportsService,
} from '@/lib/sports-streaming-matrix';

type MarketMode = 'in-market' | 'out-of-market';

interface StackResult {
  picks: SportsService[];
  /** Leagues covered at full level by the stack */
  full: League[];
  /** Leagues covered only partially */
  partial: League[];
  /** Leagues with no coverage at all */
  uncovered: League[];
  total: number;
}

function coverageLevel(svc: SportsService, league: League, mode: MarketMode): number {
  const cov = svc.coverage[league];
  if (!cov) return 0;
  const level = mode === 'in-market' ? cov.inMarket : cov.outMarket;
  return level === 'full' ? 2 : level === 'partial' ? 1 : 0;
}

/**
 * Greedy set-cover by value-per-dollar. Owned services contribute coverage
 * for free. `requireFull` demands full-level coverage for every league.
 */
function buildStack(
  leagues: League[],
  mode: MarketMode,
  ownedIds: Set<string>,
  budget: number | null,
  requireFull: boolean
): StackResult {
  const target = requireFull ? 2 : 1;
  // current best coverage level per league (start from owned services)
  const covered = new Map<League, number>();
  for (const lg of leagues) {
    let best = 0;
    for (const svc of SPORTS_SERVICES) {
      if (ownedIds.has(svc.id)) best = Math.max(best, coverageLevel(svc, lg, mode));
    }
    covered.set(lg, best);
  }

  const picks: SportsService[] = [];
  let total = 0;
  const candidates = SPORTS_SERVICES.filter((s) => !ownedIds.has(s.id));

  // NFL out-of-market combo rule: a base service's in-market 'full' + Sunday
  // Ticket's out-of-market Sunday games together equal full coverage.
  const stCombo = () =>
    mode === 'out-of-market' &&
    leagues.includes('NFL') &&
    (picks.some((p) => p.id === 'nfl-sunday-ticket') || ownedIds.has('nfl-sunday-ticket')) &&
    (picks.some((p) => coverageLevel(p, 'NFL', 'in-market') === 2) ||
      [...ownedIds].some((id) => {
        const s = SPORTS_SERVICES.find((x) => x.id === id);
        return s ? coverageLevel(s, 'NFL', 'in-market') === 2 : false;
      }));

  const effectiveLevel = (lg: League): number => {
    const base = covered.get(lg) ?? 0;
    if (lg === 'NFL' && stCombo()) return Math.max(base, 2);
    return base;
  };

  for (let iter = 0; iter < 8; iter++) {
    const unmet = leagues.filter((lg) => effectiveLevel(lg) < target);
    if (unmet.length === 0) break;

    let best: SportsService | null = null;
    let bestScore = 0;
    for (const svc of candidates) {
      if (picks.includes(svc)) continue;
      if (budget != null && total + svc.monthlyPrice > budget) continue;
      let gain = 0;
      for (const lg of unmet) {
        const lvl = coverageLevel(svc, lg, mode);
        const cur = covered.get(lg) ?? 0;
        if (lvl > cur) gain += Math.min(lvl, target) - Math.min(cur, target);
        // bonus: Sunday Ticket completing the NFL combo
        if (
          lg === 'NFL' &&
          mode === 'out-of-market' &&
          ((svc.id === 'nfl-sunday-ticket' &&
            picks.some((p) => coverageLevel(p, 'NFL', 'in-market') === 2)) ||
            (coverageLevel(svc, 'NFL', 'in-market') === 2 &&
              picks.some((p) => p.id === 'nfl-sunday-ticket')))
        ) {
          gain += 1;
        }
      }
      if (gain <= 0) continue;
      const score = gain / svc.monthlyPrice;
      if (score > bestScore || (score === bestScore && best && svc.monthlyPrice < best.monthlyPrice)) {
        best = svc;
        bestScore = score;
      }
    }
    if (!best) break;
    picks.push(best);
    total += best.monthlyPrice;
    for (const lg of leagues) {
      covered.set(lg, Math.max(covered.get(lg) ?? 0, coverageLevel(best, lg, mode)));
    }
  }

  const full: League[] = [];
  const partial: League[] = [];
  const uncovered: League[] = [];
  for (const lg of leagues) {
    const lvl = effectiveLevel(lg);
    if (lvl >= 2) full.push(lg);
    else if (lvl === 1) partial.push(lg);
    else uncovered.push(lg);
  }
  return { picks, full, partial, uncovered, total };
}

function fmtUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

const chipBase =
  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer select-none';
const chipOn =
  'border-[var(--sv-burgundy,#6B1F2A)] bg-[var(--sv-burgundy,#6B1F2A)] text-[var(--sv-cream,#F5EFE4)]';
const chipOff = 'border-border bg-background text-muted-foreground hover:text-foreground';

export function SportsStackFinderClient() {
  const [selected, setSelected] = useState<League[]>(['NFL']);
  const [mode, setMode] = useState<MarketMode>('in-market');
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [budget, setBudget] = useState(120);
  const [capEnabled, setCapEnabled] = useState(false);

  // Email capture
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const toggleLeague = (lg: League) =>
    setSelected((prev) => (prev.includes(lg) ? prev.filter((x) => x !== lg) : [...prev, lg]));

  const toggleOwned = (id: string) =>
    setOwned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const cheapest = useMemo(
    () => buildStack(selected, mode, owned, capEnabled ? budget : null, false),
    [selected, mode, owned, budget, capEnabled]
  );
  const fullCoverage = useMemo(
    () => buildStack(selected, mode, owned, null, true),
    [selected, mode, owned]
  );

  const showFullAlt =
    fullCoverage.picks.length > 0 &&
    (fullCoverage.total !== cheapest.total ||
      fullCoverage.picks.map((p) => p.id).join() !== cheapest.picks.map((p) => p.id).join()) &&
    fullCoverage.uncovered.length === 0 &&
    fullCoverage.partial.length === 0;

  // Gap callouts
  const gaps: string[] = [];
  if (mode === 'out-of-market' && selected.includes('NFL')) {
    const hasST =
      cheapest.picks.some((p) => p.id === 'nfl-sunday-ticket') || owned.has('nfl-sunday-ticket');
    if (!hasST)
      gaps.push(
        'Out-of-market Sunday-afternoon NFL games need the NFL Sunday Ticket add-on — no live-TV bundle carries them.'
      );
  }
  if (selected.includes('F1') && !cheapest.picks.some((p) => p.id === 'apple-tv') && !owned.has('apple-tv')) {
    gaps.push('Formula 1 is an Apple TV exclusive in the US for 2026 — no other service carries the races.');
  }
  if (selected.includes('UFC') && !cheapest.picks.some((p) => p.id === 'paramount-plus') && !owned.has('paramount-plus')) {
    gaps.push('UFC moved to Paramount+ in 2026 (numbered events included, no PPV) — it is the only place to stream fights.');
  }
  for (const lg of cheapest.partial) {
    if (lg === 'NBA' && mode === 'out-of-market')
      gaps.push('Following an out-of-market NBA team? NBA League Pass is the only way to get every game (local/national blackouts apply).');
    if (lg === 'MLB' && mode === 'out-of-market')
      gaps.push('Out-of-market MLB needs MLB.TV — national windows alone miss most of the 162-game season.');
    if (lg === 'NHL' && mode === 'out-of-market')
      gaps.push('Out-of-market NHL games are bundled into the ESPN (Unlimited) app — the cheapest full NHL option.');
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailStatus('sending');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: 'sports-stack-finder',
          metadata: {
            leagues: selected.join(','),
            budget: capEnabled ? String(budget) : 'none',
            market: mode,
          },
          website: honeypot,
        }),
      });
      setEmailStatus(res.ok ? 'sent' : 'error');
    } catch {
      setEmailStatus('error');
    }
  }

  const renderServiceCta = (svc: SportsService) => {
    if (svc.offerSlug) {
      return (
        <a
          href={`/go/${svc.offerSlug}`}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[var(--sv-burgundy,#6B1F2A)] text-[var(--sv-cream,#F5EFE4)] hover:bg-[var(--sv-ink,#14110F)] border border-[var(--sv-brass,#B8893B)] transition-colors"
        >
          Try Prime Video Free
        </a>
      );
    }
    return (
      <a
        href={svc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        Visit site →
      </a>
    );
  };

  const renderStack = (stack: StackResult, label: string, highlight: boolean) => (
    <div
      className={`rounded-xl border p-5 ${
        highlight ? 'border-[var(--sv-brass,#B8893B)] shadow-sm' : 'border-border'
      }`}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-bold text-foreground">{label}</h3>
        <p className="text-xl font-bold text-[var(--sv-burgundy,#6B1F2A)] whitespace-nowrap">
          {fmtUsd(stack.total)}<span className="text-sm font-medium text-muted-foreground">/mo</span>
        </p>
      </div>
      {stack.picks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {owned.size > 0
            ? 'Your current services already cover everything you selected.'
            : 'Select at least one league to build a stack.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {stack.picks.map((svc) => (
            <li key={svc.id} className="flex flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  {svc.name}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    — {fmtUsd(svc.monthlyPrice)}/mo
                  </span>
                </p>
                {svc.priceNote && (
                  <p className="text-xs text-muted-foreground">{svc.priceNote}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Covers:{' '}
                  {selected
                    .filter((lg) => coverageLevel(svc, lg, mode) > 0)
                    .map((lg) => `${LEAGUE_LABELS[lg]}${coverageLevel(svc, lg, mode) === 1 ? ' (partial)' : ''}`)
                    .join(', ') || '—'}
                </p>
              </div>
              {renderServiceCta(svc)}
            </li>
          ))}
        </ul>
      )}
      {(stack.partial.length > 0 || stack.uncovered.length > 0) && (
        <div className="mt-4 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          {stack.partial.length > 0 && (
            <p>
              Partial coverage: {stack.partial.map((lg) => LEAGUE_LABELS[lg]).join(', ')} — national
              windows only, see notes.
            </p>
          )}
          {stack.uncovered.length > 0 && (
            <p className="text-[var(--sv-burgundy,#6B1F2A)] font-medium">
              Not covered{capEnabled ? ' within your budget' : ''}:{' '}
              {stack.uncovered.map((lg) => LEAGUE_LABELS[lg]).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Step 1: leagues */}
      <fieldset>
        <legend className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
          1. Which leagues do you watch?
        </legend>
        <div className="flex flex-wrap gap-2">
          {LEAGUES.map((lg) => (
            <button
              key={lg}
              type="button"
              aria-pressed={selected.includes(lg)}
              onClick={() => toggleLeague(lg)}
              className={`${chipBase} ${selected.includes(lg) ? chipOn : chipOff}`}
            >
              {LEAGUE_LABELS[lg]}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Step 2: market mode */}
      <fieldset>
        <legend className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
          2. Do you live in your team&apos;s home market?
        </legend>
        <div className="flex flex-wrap gap-4">
          {(
            [
              ['in-market', 'Yes — I follow local teams'],
              ['out-of-market', 'No — my teams play in another market'],
            ] as [MarketMode, string][]
          ).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="market-mode"
                value={value}
                checked={mode === value}
                onChange={() => setMode(value)}
                className="h-4 w-4 accent-[var(--sv-burgundy,#6B1F2A)]"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Step 3: owned services */}
      <fieldset>
        <legend className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
          3. I already pay for…
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SPORTS_SERVICES.map((svc) => (
            <label
              key={svc.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm text-foreground hover:bg-muted/40"
            >
              <input
                type="checkbox"
                checked={owned.has(svc.id)}
                onChange={() => toggleOwned(svc.id)}
                className="h-4 w-4 accent-[var(--sv-burgundy,#6B1F2A)]"
              />
              <span className="truncate">{svc.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Step 4: budget cap */}
      <fieldset>
        <legend className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
          4. Monthly budget cap (optional)
        </legend>
        <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={capEnabled}
            onChange={(e) => setCapEnabled(e.target.checked)}
            className="h-4 w-4 accent-[var(--sv-burgundy,#6B1F2A)]"
          />
          Cap my spend
        </label>
        {capEnabled && (
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={10}
              max={250}
              step={5}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full max-w-sm accent-[var(--sv-burgundy,#6B1F2A)]"
              aria-label="Monthly budget cap in dollars"
            />
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              ${budget}/mo
            </span>
          </div>
        )}
      </fieldset>

      {/* Results */}
      {selected.length > 0 && (
        <section aria-label="Your recommended streaming stack" className="space-y-5">
          {renderStack(cheapest, 'Cheapest stack for your leagues', true)}
          {showFullAlt && renderStack(fullCoverage, 'No-compromise full-coverage stack', false)}

          {gaps.length > 0 && (
            <div className="rounded-xl border border-[var(--sv-brass,#B8893B)]/40 bg-[rgba(184,137,59,0.06)] p-4">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-foreground">
                Worth knowing
              </h3>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Results-first email capture */}
          <div className="rounded-xl border border-border bg-muted/30 p-5">
            {emailStatus === 'sent' ? (
              <p className="text-sm font-medium text-foreground">
                Done — your stack is on its way. We&apos;ll email you if carriage or pricing changes for your leagues.
              </p>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Email me my stack — and alert me when carriage changes
                </p>
                <p className="text-xs text-muted-foreground">
                  Rights move every season (F1 → Apple TV, UFC → Paramount+ this year alone). We&apos;ll
                  let you know when your stack stops covering a league.
                </p>
                {/* Honeypot — hidden from humans */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label htmlFor="ssf-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="ssf-email"
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sv-brass,#B8893B)]"
                  />
                  <button
                    type="submit"
                    disabled={emailStatus === 'sending'}
                    className="shrink-0 rounded-lg bg-[var(--sv-burgundy,#6B1F2A)] px-5 py-2 text-sm font-semibold text-[var(--sv-cream,#F5EFE4)] hover:bg-[var(--sv-ink,#14110F)] disabled:opacity-60 transition-colors"
                  >
                    {emailStatus === 'sending' ? 'Sending…' : 'Email my stack'}
                  </button>
                </div>
                {emailStatus === 'error' && (
                  <p className="text-xs text-[var(--sv-burgundy,#6B1F2A)]">
                    Something went wrong — please try again.
                  </p>
                )}
              </form>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Prices and league rights verified as of {VERIFIED_AS_OF}. Regional sports network (RSN)
            availability varies by market — local team games on RSNs are often missing from national
            bundles. Out-of-market products black out local and national broadcasts.
          </p>
        </section>
      )}
    </div>
  );
}
