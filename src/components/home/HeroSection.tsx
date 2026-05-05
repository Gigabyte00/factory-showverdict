import { ArrowRight, Compass, Film, Tv, Clapperboard, RotateCw } from "lucide-react";

/**
 * HeroEditorial — ShowVerdict
 *
 * Editorial, cinema-noir hero. Burgundy / cream / brass with deep-ink accents.
 * Cormorant Garamond display paired with a crisp sans body.
 *
 * Server-Component-safe: no event handlers, no client state.
 * Tokens and utility classes (sv-*) are defined globally in globals.css.
 */
export default function HeroEditorial() {
  return (
    <section
      aria-label="ShowVerdict — spoiler-free TV and film reviews"
      className="relative isolate overflow-hidden bg-[var(--sv-cream)] text-[var(--sv-ink)]"
    >
      {/* Paper grain overlay */}
      <div aria-hidden className="sv-grain pointer-events-none absolute inset-0 opacity-70" />

      {/* Top masthead rule — editorial signal */}
      <div aria-hidden className="absolute inset-x-0 top-0 flex items-center gap-3 px-6 pt-5 sm:px-10 lg:px-16">
        <div className="h-px flex-1 bg-[var(--sv-rule)]" />
        <span className="sv-sans text-[10px] uppercase tracking-[0.32em] text-[var(--sv-ink-soft)]">
          Vol. IV · Spring 2026
        </span>
        <div className="h-px flex-1 bg-[var(--sv-rule)]" />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-6 pb-20 pt-20 sm:px-10 sm:pt-24 lg:px-16 lg:pb-28 lg:pt-28">
        {/* ── Hero grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-14">
          {/* Text column — 60% (3 of 5) */}
          <div className="lg:col-span-3">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span aria-hidden className="inline-block h-2 w-2 rotate-45 bg-[var(--sv-brass)]" />
              <p className="sv-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--sv-burgundy)]">
                Reviewed by Critics
                <span className="mx-2 text-[var(--sv-brass-2)]">·</span>
                Updated 2026
              </p>
            </div>

            {/* H1 */}
            <h1 className="sv-display mt-7 text-[44px] font-medium leading-[1.02] text-[var(--sv-ink)] sm:text-[56px] lg:text-[64px] xl:text-[72px]">
              The weekend you’ve been{" "}
              <em className="italic text-[var(--sv-burgundy)]">waiting for</em>
              <span className="text-[var(--sv-brass)]">,</span> reviewed
              before the credits roll.
            </h1>

            {/* Subhead */}
            <p className="sv-sans mt-7 max-w-[58ch] text-[17px] leading-[1.7] text-[var(--sv-ink-soft)] sm:text-[18px]">
              Spoiler-free verdicts on every prestige drama, sleeper film, and
              streaming premiere worth your Saturday night — written by people
              who actually finished the season.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
              <a
                href="/blog"
                className="sv-sans group inline-flex items-center justify-center gap-2.5 rounded-full bg-[var(--sv-burgundy)] px-7 py-3.5 text-[14px] font-semibold tracking-wide text-[var(--sv-cream)] shadow-[0_1px_0_rgba(0,0,0,0.08),0_10px_24px_-12px_rgba(90,26,36,0.55)] transition-colors hover:bg-[var(--sv-burgundy-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sv-brass)]"
              >
                Browse Reviews
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </a>
              <a
                href="/methodology"
                className="sv-sans group inline-flex items-center justify-center gap-2.5 rounded-full border border-[var(--sv-rule)] bg-transparent px-7 py-3.5 text-[14px] font-semibold tracking-wide text-[var(--sv-ink)] transition-colors hover:border-[var(--sv-brass)] hover:text-[var(--sv-burgundy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sv-brass)]"
              >
                <Compass className="h-4 w-4 text-[var(--sv-brass-2)]" aria-hidden />
                How We Test
              </a>
            </div>

            {/* Byline / meta */}
            <p className="sv-sans mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] uppercase tracking-[0.22em] text-[var(--sv-ink-soft)]">
              <span>Est. 2021</span>
              <span aria-hidden className="text-[var(--sv-brass-2)]">◆</span>
              <span>No spoilers, ever</span>
              <span aria-hidden className="text-[var(--sv-brass-2)]">◆</span>
              <span>Independent &amp; ad-light</span>
            </p>
          </div>

          {/* Photo-frame column — 40% (2 of 5) */}
          <div className="lg:col-span-2">
            <figure className="relative">
              {/* Brass frame */}
              <div className="relative rounded-2xl bg-[var(--sv-cream-2)] p-2 ring-1 ring-[var(--sv-brass)]/40 shadow-[0_30px_60px_-30px_rgba(26,20,16,0.45)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl ring-1 ring-[var(--sv-rule)]">
                  {/* Placeholder image: layered cinema-noir composition rendered in CSS so it works offline.
                      Swap with <img className="h-full w-full object-cover rounded-xl" src=... alt=... /> when art is ready. */}
                  <div
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{
                      backgroundImage: `
                        radial-gradient(120% 80% at 30% 20%, rgba(184,137,59,0.35), transparent 55%),
                        radial-gradient(90% 60% at 80% 90%, rgba(90,26,36,0.55), transparent 60%),
                        linear-gradient(160deg, #2A1418 0%, #5A1A24 45%, #1A0E11 100%)
                      `,
                    }}
                  />
                  {/* Faux film-still vignette + grain */}
                  <div aria-hidden className="absolute inset-0 sv-grain opacity-60" />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
                    }}
                  />

                  {/* Caption block, top-left */}
                  <div className="absolute left-4 top-4 right-4 flex items-start justify-between gap-3">
                    <div className="rounded-md bg-[var(--sv-cream)]/92 px-2.5 py-1 backdrop-blur-sm">
                      <p className="sv-sans text-[9px] font-semibold uppercase tracking-[0.28em] text-[var(--sv-burgundy)]">
                        Still · Editor’s Pick
                      </p>
                    </div>
                    <div className="rounded-md border border-[var(--sv-brass)]/60 bg-[var(--sv-ink)]/55 px-2 py-1 backdrop-blur-sm">
                      <p className="sv-sans text-[10px] font-semibold tracking-[0.18em] text-[var(--sv-brass)]">
                        Nº 047
                      </p>
                    </div>
                  </div>

                  {/* Filmstrip detail at bottom */}
                  <div className="absolute inset-x-0 bottom-0">
                    <div className="flex h-6 items-center justify-between bg-[var(--sv-ink)]/70 px-3 backdrop-blur-sm">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <span
                          key={i}
                          aria-hidden
                          className="block h-2 w-2 rounded-[1px] bg-[var(--sv-cream)]/60"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Centered film glyph as placeholder focal point */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Clapperboard
                      aria-hidden
                      className="h-14 w-14 text-[var(--sv-cream)]/85"
                      strokeWidth={1.25}
                    />
                  </div>
                </div>
              </div>

              {/* Pull-quote caption under frame */}
              <figcaption className="sv-display mt-5 pl-1 pr-2 text-[18px] italic leading-snug text-[var(--sv-ink-soft)]">
                <span className="text-[var(--sv-brass)]">“</span>
                A friend whose taste you trust — with the receipts to prove it.
                <span className="text-[var(--sv-brass)]">”</span>
                <span className="sv-sans ml-2 align-middle text-[10px] not-italic uppercase tracking-[0.28em] text-[var(--sv-ink-soft)]">
                  — Reader letter, Nº 312
                </span>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* ── Stat strip ──────────────────────────────────────────────────── */}
        <div className="relative mt-20 lg:mt-24">
          {/* brass hairline */}
          <div aria-hidden className="sv-brass-rule h-px w-full opacity-70" />
          <div aria-hidden className="mt-1 h-px w-full bg-[var(--sv-rule-soft)]" />

          <dl className="grid grid-cols-2 gap-y-10 pt-10 sm:grid-cols-4 sm:gap-x-8">
            <Stat
              icon={<Tv className="h-4 w-4" aria-hidden />}
              kicker="Series in review"
              value="1,284"
              suffix="shows"
            />
            <Stat
              icon={<Film className="h-4 w-4" aria-hidden />}
              kicker="Seat time logged"
              value="38,700"
              suffix="episodes &amp; films"
            />
            <Stat
              icon={<Clapperboard className="h-4 w-4" aria-hidden />}
              kicker="Streaming services"
              value="14"
              suffix="platforms covered"
            />
            <Stat
              icon={<RotateCw className="h-4 w-4" aria-hidden />}
              kicker="Retest cadence"
              value="90"
              suffix="days, every verdict"
            />
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ── Subcomponent (kept in same file for drop-in convenience) ──────────── */
function Stat({
  icon,
  kicker,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  kicker: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="relative pl-5 sm:pl-0 sm:pr-6">
      {/* Brass tick on mobile (left), divider on desktop (right) */}
      <span
        aria-hidden
        className="absolute left-0 top-1.5 h-7 w-px bg-[var(--sv-brass)] sm:hidden"
      />
      <div className="sv-sans flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[var(--sv-ink-soft)]">
        <span className="text-[var(--sv-brass-2)]">{icon}</span>
        <span>{kicker}</span>
      </div>
      <dd className="sv-display mt-2 text-[42px] font-medium leading-none text-[var(--sv-burgundy)] sm:text-[48px]">
        {value}
      </dd>
      <dt
        className="sv-sans mt-2 text-[12px] uppercase tracking-[0.22em] text-[var(--sv-ink-soft)]"
        // suffix may contain a stray entity for ampersand
        dangerouslySetInnerHTML={{ __html: suffix }}
      />
    </div>
  );
}

export function HeroSection(_props: Record<string, unknown>) {
  return <HeroEditorial />;
}
