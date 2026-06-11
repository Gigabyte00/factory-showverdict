/**
 * Sports Streaming Stack Finder — bespoke ShowVerdict tool.
 *
 * Targets the "best streaming services for sports" cluster (the site's #1
 * unowned query cluster per GSC). Interactive league picker → cheapest
 * covering stack with 2026 rights data (F1 → Apple TV, UFC → Paramount+).
 */

import type { Metadata } from 'next';
import { ToolLanding } from '@/components/tools';
import { canonicalUrl } from '@/lib/seo';
import { VERIFIED_AS_OF } from '@/lib/sports-streaming-matrix';
import { SportsStackFinderClient } from './SportsStackFinderClient';

export const metadata: Metadata = {
  title: 'Sports Streaming Stack Finder — Cheapest Way to Watch Your Leagues (2026)',
  description:
    'Free tool: pick your leagues (NFL, NBA, MLB, NHL, college football, Premier League, F1, UFC) and get the cheapest streaming stack that covers them — with 2026 rights, prices, and out-of-market caveats.',
  alternates: { canonical: canonicalUrl('/tools/sports-streaming-finder') },
};

const FAQ = [
  {
    q: 'What streaming service has NFL games?',
    a: 'NFL games are split across more services than any other league. CBS Sunday games stream on Paramount+ (in-market), FOX and NBC games via a live-TV service like YouTube TV, Fubo, or Hulu + Live TV, Sunday Night Football on Peacock, Monday Night Football on ESPN, and Thursday Night Football exclusively on Prime Video. Out-of-market Sunday-afternoon games require the NFL Sunday Ticket add-on (sold through YouTube). No single service carries every NFL game.',
  },
  {
    q: 'What is the cheapest way to stream live sports in 2026?',
    a: 'It depends entirely on your leagues. If you only watch one league, a single standalone app is usually cheapest: Peacock (~$11) covers every Premier League match, Apple TV (~$13) is the only home of F1 in the US in 2026, and Paramount+ (~$14) now carries every UFC event with no PPV fees. Multi-league households usually need a live-TV base (YouTube TV, Fubo, or Hulu + Live TV at ~$83-85) plus one or two standalone apps. This tool computes the cheapest combination for your exact mix.',
  },
  {
    q: 'What streaming service has NBA, MLB, and NHL games?',
    a: 'For the NBA (2025-26 rights cycle onward): national games air on ESPN/ABC, NBC/Peacock, and Prime Video, while NBA League Pass covers out-of-market games. For MLB: FOX, TBS, NBC/Peacock (Sunday Night Baseball), and Apple TV (Friday Night Baseball) split national games, and MLB.TV covers out-of-market. For NHL: ESPN/ABC and TNT (via HBO Max) carry national games, and the ESPN app includes out-of-market NHL games. In all three leagues, local in-market games on regional sports networks are the hardest to stream — RSN availability varies by team and market.',
  },
  {
    q: 'Do I need YouTube TV or Fubo to watch sports?',
    a: 'Only if your leagues live on broadcast and cable networks (NFL Sundays, most college football, national NBA/MLB/NHL windows). A live-TV bundle is the only way to stream CBS, FOX, NBC, and ESPN together. But if you watch league-specific products — Premier League (Peacock), F1 (Apple TV), UFC (Paramount+), or an out-of-market team (League Pass, MLB.TV, Sunday Ticket) — you can often skip the $80+ bundle entirely and pay a fraction of the price.',
  },
];

export default function SportsStreamingFinderPage() {
  return (
    <ToolLanding
      title="Sports Streaming Stack Finder — Cheapest Way to Watch Your Leagues (2026)"
      intro={`Sports rights are scattered across more services than ever — F1 moved to Apple TV and UFC to Paramount+ this year alone. Pick the leagues you actually watch, tell us what you already pay for, and this free tool computes the cheapest stack of streaming services that covers them, with out-of-market caveats spelled out. Prices and rights verified ${VERIFIED_AS_OF}.`}
      faq={FAQ}
    >
      <SportsStackFinderClient />
    </ToolLanding>
  );
}
