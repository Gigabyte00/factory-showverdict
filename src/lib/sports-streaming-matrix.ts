/**
 * Sports Streaming Matrix — data for the Sports Streaming Stack Finder tool.
 *
 * Coverage matrix of major US streaming services × leagues, with monthly
 * prices, in-market vs out-of-market caveats, and RSN notes.
 *
 * IMPORTANT 2026 rights notes baked in:
 *  - F1 US rights moved to Apple TV for the 2026 season (ESPN through 2025).
 *  - UFC moved to Paramount+ in 2026 (numbered events + Fight Nights, no PPV).
 *  - NBA national package (2025-26 onward): ESPN/ABC, NBC/Peacock, Prime Video.
 *  - MLB Sunday Night Baseball moved to NBC/Peacock for 2026.
 *
 * Re-verify prices and rights each season before refreshing this page.
 */

export const VERIFIED_AS_OF = '2026-06';

export const LEAGUES = [
  'NFL',
  'NBA',
  'MLB',
  'NHL',
  'CFB',
  'Premier League',
  'F1',
  'UFC',
] as const;

export type League = (typeof LEAGUES)[number];

export type CoverageLevel = 'full' | 'partial' | 'none';

export interface LeagueCoverage {
  /** Coverage when you live in the team's home market */
  inMarket: CoverageLevel;
  /** Coverage for out-of-market (displaced fan) viewing */
  outMarket: CoverageLevel;
  note?: string;
}

export interface SportsService {
  id: string;
  name: string;
  monthlyPrice: number;
  priceNote?: string;
  /** 'live-tv' = cable replacement, 'standalone' = single-app streamer,
   *  'addon' = bolt-on package, 'league-pass' = league out-of-market product */
  kind: 'live-tv' | 'standalone' | 'addon' | 'league-pass';
  /** Site offer slug for /go routing (affiliate). null = plain external link. */
  offerSlug: string | null;
  /** Plain destination when there is no offer slug */
  url: string;
  coverage: Partial<Record<League, LeagueCoverage>>;
  notes?: string;
}

export const SPORTS_SERVICES: SportsService[] = [
  {
    id: 'youtube-tv',
    name: 'YouTube TV',
    monthlyPrice: 82.99,
    kind: 'live-tv',
    offerSlug: null,
    url: 'https://tv.youtube.com',
    coverage: {
      NFL: {
        inMarket: 'full',
        outMarket: 'partial',
        note: 'CBS/FOX/NBC/ESPN in-market Sundays; out-of-market Sunday-afternoon games need the Sunday Ticket add-on',
      },
      NBA: {
        inMarket: 'partial',
        outMarket: 'partial',
        note: 'National games on ESPN/ABC + NBC; most local RSN games not carried',
      },
      MLB: {
        inMarket: 'partial',
        outMarket: 'partial',
        note: 'FOX/TBS/NBC national windows; local RSN games usually missing',
      },
      NHL: {
        inMarket: 'partial',
        outMarket: 'partial',
        note: 'ESPN/TNT national games; local RSN games usually missing',
      },
      CFB: { inMarket: 'full', outMarket: 'full', note: 'ESPN/ABC, FOX, CBS, NBC — the full Saturday slate' },
      'Premier League': {
        inMarket: 'partial',
        outMarket: 'partial',
        note: 'NBC + USA Network matches only — Peacock-exclusive matches missing',
      },
    },
    notes: 'Best single base for NFL Sundays; pairs with Sunday Ticket for displaced NFL fans.',
  },
  {
    id: 'fubo',
    name: 'Fubo (Pro)',
    monthlyPrice: 84.99,
    kind: 'live-tv',
    offerSlug: null,
    url: 'https://www.fubo.tv',
    coverage: {
      NFL: { inMarket: 'full', outMarket: 'partial', note: 'CBS/FOX/NBC/ESPN; no out-of-market Sunday Ticket option' },
      NBA: { inMarket: 'partial', outMarket: 'partial', note: 'ESPN/ABC + NBC national games; RSN availability varies by market' },
      MLB: { inMarket: 'partial', outMarket: 'partial', note: 'FOX/FS1 + NBC; no TBS — some playoff games missing' },
      NHL: { inMarket: 'partial', outMarket: 'partial', note: 'ESPN national games; no TNT — TNT-night games missing' },
      CFB: { inMarket: 'full', outMarket: 'full', note: 'Sports-first lineup with all the big CFB networks' },
      'Premier League': { inMarket: 'partial', outMarket: 'partial', note: 'NBC/USA matches; Peacock exclusives missing' },
    },
    notes: 'Sports-first cable replacement; historically no Turner (TNT/TBS) networks.',
  },
  {
    id: 'hulu-live',
    name: 'Hulu + Live TV',
    monthlyPrice: 82.99,
    kind: 'live-tv',
    offerSlug: null,
    url: 'https://www.hulu.com/live-tv',
    coverage: {
      NFL: { inMarket: 'full', outMarket: 'partial', note: 'CBS/FOX/NBC/ESPN in-market; no Sunday Ticket option' },
      NBA: { inMarket: 'partial', outMarket: 'partial', note: 'ESPN/ABC + NBC national games' },
      MLB: { inMarket: 'partial', outMarket: 'partial', note: 'National windows only; RSN caveats apply' },
      NHL: { inMarket: 'partial', outMarket: 'partial', note: 'ESPN/TNT national games' },
      CFB: { inMarket: 'full', outMarket: 'full' },
      'Premier League': { inMarket: 'partial', outMarket: 'partial', note: 'NBC/USA matches; Peacock exclusives missing' },
    },
    notes: 'Bundles Disney+ and ESPN+ content at no extra cost — good value if you want entertainment too.',
  },
  {
    id: 'sling-orange',
    name: 'Sling Orange',
    monthlyPrice: 45.99,
    kind: 'live-tv',
    offerSlug: null,
    url: 'https://www.sling.com',
    coverage: {
      NFL: { inMarket: 'partial', outMarket: 'partial', note: 'ESPN Monday Night Football only — no CBS/FOX/NBC' },
      NBA: { inMarket: 'partial', outMarket: 'partial', note: 'ESPN/TNT national games only' },
      NHL: { inMarket: 'partial', outMarket: 'partial', note: 'ESPN/TNT national games only' },
      CFB: { inMarket: 'partial', outMarket: 'partial', note: 'ESPN networks only — no FOX/CBS/NBC games' },
    },
    notes: 'Cheapest way to get the ESPN cable feed; single-stream only.',
  },
  {
    id: 'sling-blue',
    name: 'Sling Blue',
    monthlyPrice: 50.99,
    kind: 'live-tv',
    offerSlug: null,
    url: 'https://www.sling.com',
    coverage: {
      NFL: { inMarket: 'partial', outMarket: 'partial', note: 'FOX/NBC in select markets + NFL Network — no CBS or ESPN' },
      MLB: { inMarket: 'partial', outMarket: 'partial', note: 'FOX/FS1 national games' },
      CFB: { inMarket: 'partial', outMarket: 'partial', note: 'FOX/FS1/NBC games; no ESPN/ABC or CBS' },
      'Premier League': { inMarket: 'partial', outMarket: 'partial', note: 'USA Network matches only' },
    },
  },
  {
    id: 'espn-unlimited',
    name: 'ESPN (Unlimited)',
    monthlyPrice: 29.99,
    kind: 'standalone',
    offerSlug: null,
    url: 'https://www.espn.com/watch',
    coverage: {
      NFL: { inMarket: 'partial', outMarket: 'partial', note: 'Monday Night Football + some simulcasts' },
      NBA: { inMarket: 'partial', outMarket: 'partial', note: 'Full ESPN/ABC national slate incl. Finals' },
      NHL: {
        inMarket: 'partial',
        outMarket: 'full',
        note: 'National games + out-of-market NHL games (former NHL Power Play package) included',
      },
      CFB: { inMarket: 'full', outMarket: 'full', note: 'The biggest college football slate incl. SEC and the CFP' },
    },
    notes: "ESPN's direct-to-consumer app — everything on the ESPN linear networks plus ESPN+ content. F1 left ESPN for Apple TV in 2026; UFC left for Paramount+.",
  },
  {
    id: 'peacock',
    name: 'Peacock Premium',
    monthlyPrice: 10.99,
    kind: 'standalone',
    offerSlug: null,
    url: 'https://www.peacocktv.com',
    coverage: {
      NFL: { inMarket: 'partial', outMarket: 'partial', note: 'Sunday Night Football + exclusive games' },
      NBA: { inMarket: 'partial', outMarket: 'partial', note: 'NBC/Peacock national package (Mon + Tue nights)' },
      MLB: { inMarket: 'partial', outMarket: 'partial', note: 'Sunday Night Baseball moved to NBC/Peacock for 2026' },
      CFB: { inMarket: 'partial', outMarket: 'partial', note: 'Big Ten Saturday games + Notre Dame home games' },
      'Premier League': {
        inMarket: 'full',
        outMarket: 'full',
        note: 'Every Premier League match — most are Peacock exclusives',
      },
    },
    notes: 'The best $11 in sports streaming if you watch Premier League.',
  },
  {
    id: 'paramount-plus',
    name: 'Paramount+ Premium',
    monthlyPrice: 13.99,
    kind: 'standalone',
    offerSlug: null,
    url: 'https://www.paramountplus.com',
    coverage: {
      NFL: { inMarket: 'partial', outMarket: 'partial', note: 'Live CBS feed — in-market AFC Sunday games' },
      CFB: { inMarket: 'partial', outMarket: 'partial', note: 'Big Ten on CBS Saturday games' },
      UFC: {
        inMarket: 'full',
        outMarket: 'full',
        note: 'All UFC numbered events + Fight Nights moved to Paramount+ in 2026 — no PPV fees',
      },
    },
    notes: 'The new home of UFC as of 2026; also carries Champions League soccer.',
  },
  {
    id: 'max',
    name: 'HBO Max (with B/R Sports)',
    monthlyPrice: 16.99,
    kind: 'standalone',
    offerSlug: null,
    url: 'https://www.max.com',
    coverage: {
      NHL: { inMarket: 'partial', outMarket: 'partial', note: 'TNT regular-season games + Stanley Cup playoffs' },
      MLB: { inMarket: 'partial', outMarket: 'partial', note: 'TBS Tuesday games + postseason' },
    },
    notes: 'TNT lost the NBA after 2024-25 — Max is now mainly an NHL/MLB complement.',
  },
  {
    id: 'prime-video',
    name: 'Prime Video',
    monthlyPrice: 14.99,
    priceNote: 'Included with Amazon Prime ($139/yr)',
    kind: 'standalone',
    offerSlug: 'amazon-prime',
    url: 'https://www.amazon.com/primevideo',
    coverage: {
      NFL: { inMarket: 'partial', outMarket: 'partial', note: 'Exclusive Thursday Night Football' },
      NBA: {
        inMarket: 'partial',
        outMarket: 'partial',
        note: 'Exclusive national package from 2025-26 incl. play-in tournament and select playoffs',
      },
    },
    notes: 'TNF + a meaningful NBA package; effectively free if you already have Prime shipping.',
  },
  {
    id: 'apple-tv',
    name: 'Apple TV',
    monthlyPrice: 12.99,
    kind: 'standalone',
    offerSlug: null,
    url: 'https://tv.apple.com',
    coverage: {
      F1: {
        inMarket: 'full',
        outMarket: 'full',
        note: 'Every F1 race — US rights moved from ESPN to Apple TV for the 2026 season',
      },
      MLB: { inMarket: 'partial', outMarket: 'partial', note: 'Friday Night Baseball doubleheader' },
    },
    notes: 'The only way to stream F1 in the US in 2026. MLS Season Pass available as an add-on.',
  },
  {
    id: 'nfl-sunday-ticket',
    name: 'NFL Sunday Ticket (add-on)',
    monthlyPrice: 47.0,
    priceNote: '≈$378/season, billed during the NFL season (Sep–Jan)',
    kind: 'addon',
    offerSlug: null,
    url: 'https://tv.youtube.com/learn/nflsundayticket',
    coverage: {
      NFL: {
        inMarket: 'none',
        outMarket: 'partial',
        note: 'Out-of-market Sunday-afternoon games only — national games (SNF/MNF/TNF) still need a base service',
      },
    },
    notes: 'For displaced NFL fans. Pair with YouTube TV (or any CBS/FOX/NBC/ESPN source) for full coverage.',
  },
  {
    id: 'nba-league-pass',
    name: 'NBA League Pass',
    monthlyPrice: 16.99,
    kind: 'league-pass',
    offerSlug: null,
    url: 'https://www.nba.com/leaguepass',
    coverage: {
      NBA: {
        inMarket: 'none',
        outMarket: 'full',
        note: 'Every out-of-market game; local + national games are blacked out',
      },
    },
    notes: 'The displaced NBA fan answer — useless for your local team in-market.',
  },
  {
    id: 'mlb-tv',
    name: 'MLB.TV',
    monthlyPrice: 29.99,
    priceNote: 'Yearly plan is cheaper (~$150/season)',
    kind: 'league-pass',
    offerSlug: null,
    url: 'https://www.mlb.com/tv',
    coverage: {
      MLB: {
        inMarket: 'none',
        outMarket: 'full',
        note: 'Every out-of-market game; local-market blackouts apply',
      },
    },
    notes: 'Best per-game value in sports for out-of-market MLB fans.',
  },
];

/** League pretty-labels for UI chips */
export const LEAGUE_LABELS: Record<League, string> = {
  NFL: 'NFL',
  NBA: 'NBA',
  MLB: 'MLB',
  NHL: 'NHL',
  CFB: 'College Football',
  'Premier League': 'Premier League',
  F1: 'Formula 1',
  UFC: 'UFC',
};
