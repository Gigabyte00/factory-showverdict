'use client';

import React, { useState } from 'react';
import { Tv, CheckCircle2, ShieldCheck } from 'lucide-react';

type Props = {
  siteId: string | null;
  niche?: string | null;
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function NewsletterSignup({ siteId, niche }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      setMessage("You're in. Look for The Sunday Cut this weekend.");
      form.reset();
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="sv-newsletter"
      data-niche={niche ?? undefined}
    >
      <style>{`
        .sv-newsletter {
          --brass-50:  #FBF7EE;
          --brass-100: #F4ECD8;
          --brass-200: #E6D6A8;
          --brass-300: #D4B870;
          --brass-400: #B8964A;
          --brass-500: #9A7A2E;
          --brass-600: #7A5F1F;
          --brass-700: #5A4516;
          --ink-900:   #1A1714;
          --ink-700:   #3A332B;
          --ink-500:   #6B6157;
          --ink-300:   #A89E92;
          --paper:     #FAF7F0;
          --paper-2:   #F2EBDB;
          --line:      rgba(26, 23, 20, 0.10);
          --danger:    #8B2E1F;
          --success:   #2E5A2E;

          --font-serif: 'GT Sectra', 'Tiempos Headline', 'Canela', Georgia, 'Times New Roman', serif;
          --font-sans:  'Söhne', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

          display: block;
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 24px;
          overflow: hidden;
          color: var(--ink-900);
          font-family: var(--font-sans);
          container-type: inline-size;
        }

        .sv-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }
        @container (min-width: 720px) {
          .sv-grid { grid-template-columns: 40% 60%; }
        }

        /* ---------- Image frame ---------- */
        .sv-frame {
          position: relative;
          padding: 20px;
          background:
            radial-gradient(120% 80% at 0% 0%, rgba(184,150,74,0.18), transparent 60%),
            linear-gradient(180deg, var(--paper-2) 0%, #EAE0C7 100%);
          min-height: 320px;
          display: flex;
          align-items: stretch;
        }
        @container (min-width: 720px) {
          .sv-frame { padding: 28px; }
        }
        .sv-frame-inner {
          flex: 1;
          border-radius: 16px;
          overflow: hidden;
          background:
            radial-gradient(60% 40% at 30% 25%, rgba(255,255,255,0.35), transparent 70%),
            linear-gradient(135deg, #2A2520 0%, #1A1714 100%);
          position: relative;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.06),
            0 24px 40px -24px rgba(26,23,20,0.45);
          aspect-ratio: 4 / 5;
        }

        /* Editorial flatlay illustration: remote, popcorn, ticket */
        .sv-flatlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .sv-frame-eyebrow {
          position: absolute;
          top: 20px;
          left: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(250,247,240,0.92);
          backdrop-filter: blur(6px);
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--brass-700);
          z-index: 2;
        }
        .sv-frame-eyebrow::before {
          content: "";
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--brass-400);
          box-shadow: 0 0 0 3px rgba(184,150,74,0.25);
        }

        .sv-frame-issue {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 20px;
          color: var(--paper);
          z-index: 2;
        }
        .sv-frame-issue-num {
          font-family: var(--font-serif);
          font-size: 11px;
          font-style: italic;
          letter-spacing: 0.04em;
          color: var(--brass-200);
          opacity: 0.85;
        }
        .sv-frame-issue-title {
          font-family: var(--font-serif);
          font-size: 20px;
          line-height: 1.15;
          font-weight: 500;
          letter-spacing: -0.01em;
          margin-top: 4px;
        }

        /* ---------- Form side ---------- */
        .sv-form-wrap {
          padding: 32px 28px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @container (min-width: 720px) {
          .sv-form-wrap { padding: 48px 48px 40px; gap: 24px; }
        }

        .sv-eyebrow {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brass-600);
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .sv-eyebrow-rule {
          height: 1px;
          width: 28px;
          background: var(--brass-400);
        }

        .sv-headline {
          font-family: var(--font-serif);
          font-weight: 500;
          font-size: clamp(28px, 4.2cqi, 40px);
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--ink-900);
          margin: 0;
          text-wrap: balance;
        }
        .sv-headline em {
          font-style: italic;
          color: var(--brass-600);
        }

        .sv-sub {
          font-family: var(--font-sans);
          font-size: 15px;
          line-height: 1.55;
          color: var(--ink-700);
          margin: 0;
          max-width: 48ch;
          text-wrap: pretty;
        }

        /* ---------- Value props ---------- */
        .sv-props {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 16px 18px;
          background: var(--paper-2);
          border: 1px solid var(--line);
          border-radius: 14px;
        }
        @container (min-width: 520px) {
          .sv-props { grid-template-columns: repeat(3, 1fr); gap: 14px; }
        }
        .sv-prop {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 12.5px;
          line-height: 1.35;
          color: var(--ink-700);
          font-weight: 500;
        }
        .sv-prop-icon {
          flex: none;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          background: var(--paper);
          color: var(--brass-600);
          border: 1px solid var(--line);
        }
        .sv-prop-icon svg {
          width: 16px;
          height: 16px;
          stroke-width: 1.75;
        }

        /* ---------- Form ---------- */
        .sv-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sv-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }
        @container (min-width: 520px) {
          .sv-row { grid-template-columns: 1fr auto; }
        }

        .sv-input {
          appearance: none;
          width: 100%;
          height: 52px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1px solid var(--line);
          background: #FFFFFF;
          font-family: var(--font-sans);
          font-size: 15px;
          color: var(--ink-900);
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        .sv-input::placeholder { color: var(--ink-300); }
        .sv-input:hover { border-color: rgba(26,23,20,0.18); }
        .sv-input:focus {
          outline: none;
          border-color: var(--brass-500);
          box-shadow: 0 0 0 4px rgba(184,150,74,0.18);
        }
        .sv-input[aria-invalid="true"] {
          border-color: var(--danger);
          box-shadow: 0 0 0 4px rgba(139,46,31,0.12);
        }

        .sv-btn {
          appearance: none;
          height: 52px;
          padding: 0 22px;
          border-radius: 12px;
          border: 1px solid var(--ink-900);
          background: var(--ink-900);
          color: var(--paper);
          font-family: var(--font-sans);
          font-size: 14.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform .12s ease, background .15s ease, box-shadow .15s ease;
          white-space: nowrap;
        }
        .sv-btn:hover {
          background: #2A2520;
          box-shadow: 0 8px 20px -10px rgba(26,23,20,0.5);
        }
        .sv-btn:active { transform: translateY(1px); }
        .sv-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .sv-btn .sv-spinner {
          width: 14px; height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(250,247,240,0.35);
          border-top-color: var(--paper);
          animation: sv-spin .7s linear infinite;
        }
        @keyframes sv-spin { to { transform: rotate(360deg); } }

        .sv-disclaimer {
          font-size: 12px;
          color: var(--ink-500);
          margin: 0;
          letter-spacing: 0.01em;
        }
        .sv-disclaimer .sv-dot {
          display: inline-block;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--ink-300);
          vertical-align: middle;
          margin: 0 8px;
        }

        /* ---------- Status ---------- */
        .sv-status {
          margin: 0;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sv-status[data-tone="success"] {
          background: rgba(46,90,46,0.08);
          color: var(--success);
          border: 1px solid rgba(46,90,46,0.18);
        }
        .sv-status[data-tone="error"] {
          background: rgba(139,46,31,0.06);
          color: var(--danger);
          border: 1px solid rgba(139,46,31,0.18);
        }
        .sv-status svg { width: 16px; height: 16px; flex: none; }
      `}</style>

      <div className="sv-grid">
        {/* ---------- Left: editorial frame ---------- */}
        <div className="sv-frame" aria-hidden="true">
          <div className="sv-frame-inner">
            <span className="sv-frame-eyebrow">The Sunday Cut</span>

            {/* Editorial flatlay placeholder: remote, popcorn bowl, ticket stub */}
            <svg
              className="sv-flatlay"
              viewBox="0 0 400 500"
              preserveAspectRatio="xMidYMid slice"
              role="presentation"
            >
              <defs>
                <radialGradient id="svLight" cx="32%" cy="22%" r="60%">
                  <stop offset="0%" stopColor="#3A2F22" />
                  <stop offset="60%" stopColor="#221C16" />
                  <stop offset="100%" stopColor="#15110D" />
                </radialGradient>
                <linearGradient id="svBrass" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#E6C46A" />
                  <stop offset="55%" stopColor="#B8964A" />
                  <stop offset="100%" stopColor="#7A5F1F" />
                </linearGradient>
                <linearGradient id="svBrass2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4B870" />
                  <stop offset="100%" stopColor="#9A7A2E" />
                </linearGradient>
              </defs>

              {/* table */}
              <rect width="400" height="500" fill="url(#svLight)" />
              {/* grain */}
              <g opacity="0.06">
                {Array.from({ length: 40 }).map((_, i) => (
                  <line
                    key={i}
                    x1={0}
                    x2={400}
                    y1={(i * 13) % 500}
                    y2={((i * 13) % 500) + 0.5}
                    stroke="#FAF7F0"
                  />
                ))}
              </g>

              {/* ticket stub */}
              <g transform="translate(60 320) rotate(-14)">
                <rect width="200" height="68" rx="6" fill="#F2EBDB" />
                <rect x="138" width="1" height="68" stroke="#1A1714" strokeDasharray="3 3" opacity="0.35" />
                <text x="14" y="26" fontFamily="Georgia, serif" fontSize="11" letterSpacing="2" fill="#7A5F1F">ADMIT ONE</text>
                <text x="14" y="48" fontFamily="Georgia, serif" fontSize="20" fontStyle="italic" fill="#1A1714">Sunday</text>
                <text x="14" y="62" fontFamily="Georgia, serif" fontSize="9" fill="#6B6157" letterSpacing="1">SCREENING ROOM · ROW B</text>
                <text x="156" y="42" fontFamily="Georgia, serif" fontSize="22" fill="#7A5F1F" textAnchor="middle">07</text>
              </g>

              {/* popcorn bowl */}
              <g transform="translate(220 200)">
                <ellipse cx="70" cy="118" rx="78" ry="14" fill="#000" opacity="0.35" />
                <path d="M10,40 Q70,-10 130,40 L120,110 Q70,130 20,110 Z" fill="url(#svBrass)" />
                <path d="M14,42 Q70,-2 126,42" stroke="#FBF7EE" strokeWidth="1" opacity="0.4" fill="none" />
                {/* kernels */}
                {[
                  [30, 30], [55, 18], [80, 14], [105, 22], [125, 36],
                  [42, 8], [70, 0], [98, 6], [22, 22], [115, 14],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={9 + (i % 3)} fill="#FBF7EE" opacity={0.92 - (i % 3) * 0.08} />
                ))}
                {[
                  [38, 18], [62, 8], [88, 6], [110, 16], [50, 26], [95, 22],
                ].map(([x, y], i) => (
                  <circle key={`k${i}`} cx={x} cy={y} r={6} fill="#F4ECD8" />
                ))}
              </g>

              {/* remote */}
              <g transform="translate(80 80) rotate(8)">
                <rect width="80" height="170" rx="14" fill="#1A1714" stroke="#3A332B" />
                <circle cx="40" cy="34" r="14" fill="url(#svBrass2)" />
                <circle cx="40" cy="34" r="5" fill="#1A1714" />
                <rect x="20" y="62" width="40" height="3" rx="1.5" fill="#3A332B" />
                <rect x="20" y="74" width="40" height="3" rx="1.5" fill="#3A332B" />
                <rect x="14" y="92" width="52" height="36" rx="8" fill="#0F0C09" stroke="#3A332B" />
                <circle cx="40" cy="110" r="9" fill="#B8964A" />
                <rect x="22" y="138" width="14" height="14" rx="3" fill="#3A332B" />
                <rect x="44" y="138" width="14" height="14" rx="3" fill="#3A332B" />
              </g>

              {/* coffee ring (subtle) */}
              <g transform="translate(280 380)" opacity="0.5">
                <circle cx="0" cy="0" r="34" fill="none" stroke="#5A4516" strokeWidth="2" opacity="0.5" />
                <circle cx="0" cy="0" r="34" fill="none" stroke="#3A2F22" strokeWidth="1" />
              </g>

              {/* vignette */}
              <rect width="400" height="500" fill="url(#svLight)" opacity="0" />
              <radialGradient id="svVig" cx="50%" cy="55%" r="70%">
                <stop offset="60%" stopColor="#000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
              </radialGradient>
              <rect width="400" height="500" fill="url(#svVig)" />
            </svg>

            <div className="sv-frame-issue">
              <div className="sv-frame-issue-num">Issue No. 47 · Sunday</div>
              <div className="sv-frame-issue-title">This week: a slow-burn limited series &amp; one quiet gem.</div>
            </div>
          </div>
        </div>

        {/* ---------- Right: form ---------- */}
        <div className="sv-form-wrap">
          <div className="sv-eyebrow">
            <span className="sv-eyebrow-rule" aria-hidden="true" />
            The Sunday Cut · Newsletter
          </div>

          <h2 id="newsletter-heading" className="sv-headline">
            One show pick. <em>Every Sunday morning.</em>
          </h2>

          <p className="sv-sub">
            Spoiler-free reviews and weekend watch picks from our screening room.
            <br />
            No fluff, no SPAM.
          </p>

          <ul className="sv-props" aria-label="What you get">
            <li className="sv-prop">
              <span className="sv-prop-icon" aria-hidden="true">
                <Tv />
              </span>
              <span>Watched by our critics</span>
            </li>
            <li className="sv-prop">
              <span className="sv-prop-icon" aria-hidden="true">
                <CheckCircle2 />
              </span>
              <span>1 show pick + 1 watchlist gem every Sunday</span>
            </li>
            <li className="sv-prop">
              <span className="sv-prop-icon" aria-hidden="true">
                <ShieldCheck />
              </span>
              <span>No paid placements ever</span>
            </li>
          </ul>

          <form
            className="sv-form"
            action="/api/newsletter"
            method="post"
            onSubmit={handleSubmit}
            noValidate
          >
            <input type="hidden" name="siteId" value={siteId ?? ''} />
            {niche ? <input type="hidden" name="niche" value={niche} /> : null}

            <div className="sv-row">
              <label className="sr-only" htmlFor="sv-email">Email address</label>
              <input
                id="sv-email"
                className="sv-input"
                type="email"
                name="email"
                placeholder="you@email.com"
                autoComplete="email"
                required
                aria-invalid={status === 'error' ? 'true' : 'false'}
                aria-describedby="sv-disclaimer sv-status"
                disabled={status === 'submitting' || status === 'success'}
              />
              <button
                className="sv-btn"
                type="submit"
                disabled={status === 'submitting' || status === 'success'}
              >
                {status === 'submitting' ? (
                  <>
                    <span className="sv-spinner" aria-hidden="true" />
                    Subscribing…
                  </>
                ) : status === 'success' ? (
                  'Subscribed'
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>

            {status === 'success' || status === 'error' ? (
              <p
                id="sv-status"
                className="sv-status"
                data-tone={status === 'success' ? 'success' : 'error'}
                role="status"
                aria-live="polite"
              >
                {status === 'success' ? <CheckCircle2 /> : <ShieldCheck />}
                <span>{message}</span>
              </p>
            ) : null}

            <p id="sv-disclaimer" className="sv-disclaimer">
              Free.<span className="sv-dot" aria-hidden="true" />Unsubscribe in one click.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}


export { NewsletterSignup };
