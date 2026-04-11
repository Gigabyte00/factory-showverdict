'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Play, TrendingUp } from 'lucide-react';

const PLATFORM_BADGES = [
  { name: 'Netflix', color: 'bg-red-600', text: 'text-white' },
  { name: 'HBO Max', color: 'bg-purple-700', text: 'text-white' },
  { name: 'Disney+', color: 'bg-blue-700', text: 'text-white' },
  { name: 'Prime', color: 'bg-sky-500', text: 'text-white' },
  { name: 'Hulu', color: 'bg-green-500', text: 'text-white' },
  { name: 'Apple TV+', color: 'bg-zinc-800 border border-white/20', text: 'text-white' },
];

const CRITICS_PICKS = [
  {
    title: 'Severance S2',
    platform: 'Apple TV+',
    platformColor: 'bg-zinc-700',
    genre: 'Thriller',
    score: 9.4,
    verdict: 'Essential',
    verdictColor: 'bg-emerald-500/20 text-emerald-400',
    description: 'Mind-bending workplace thriller returns stronger than ever.',
  },
  {
    title: 'The Last of Us S2',
    platform: 'HBO Max',
    platformColor: 'bg-purple-700',
    genre: 'Drama',
    score: 9.1,
    verdict: 'Must Watch',
    verdictColor: 'bg-purple-500/20 text-purple-400',
    description: 'Post-apocalyptic storytelling at its absolute peak.',
  },
  {
    title: 'Adolescence',
    platform: 'Netflix',
    platformColor: 'bg-red-700',
    genre: 'Crime',
    score: 9.3,
    verdict: 'Essential',
    verdictColor: 'bg-emerald-500/20 text-emerald-400',
    description: 'Devastating single-take drama that demands your attention.',
  },
];

function StarScore({ score }: { score: number }) {
  const full = Math.floor(score / 2);
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < full ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-white/30'}`}
        />
      ))}
      <span className="text-xs text-white/60 ml-1">{score}/10</span>
    </div>
  );
}

export function ShowVerdictHero() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-16 lg:py-24">
      {/* Cinematic gradient overlays */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/30 via-transparent to-zinc-950" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="lg:grid lg:grid-cols-[1fr_420px] lg:gap-14 lg:items-start">
          {/* Left: Copy */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-white/80">500+ shows & movies reviewed</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              The{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Verdict
              </span>{' '}
              on Every Show
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-lg">
              Honest streaming reviews for Amazon Prime, Netflix, Max, Hulu and Disney+ —
              so you only watch what&apos;s worth it.
            </p>

            {/* Platform badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              {PLATFORM_BADGES.map((p) => (
                <span key={p.name} className={`rounded-md px-2.5 py-1 text-xs font-semibold ${p.color} ${p.text}`}>
                  {p.name}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8">
                <Link href="/blog">Browse Reviews <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/20 !text-white !bg-transparent hover:!bg-white/10 px-8">
                <Link href="/offers"><Play className="mr-2 h-5 w-5" />Top Streaming Picks</Link>
              </Button>
            </div>

            <div className="flex gap-6 pt-6 border-t border-white/10 text-sm text-white/60">
              <span>📺 500+ Reviews</span>
              <span>🆓 Free to Browse</span>
              <span>✅ No Spoilers</span>
            </div>
          </div>

          {/* Right: Critics' Picks This Week */}
          <div className="mt-12 lg:mt-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-semibold">Critics&apos; Picks</p>
                <span className="text-[10px] text-white/40 bg-white/5 rounded-full px-2 py-1">Updated weekly</span>
              </div>

              <div className="space-y-3">
                {CRITICS_PICKS.map((show, i) => (
                  <div key={show.title} className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-white/30 text-lg font-bold w-5 flex-shrink-0">#{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{show.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${show.platformColor} text-white`}>
                              {show.platform}
                            </span>
                            <span className="text-white/40 text-[10px]">{show.genre}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`flex-shrink-0 text-[10px] font-bold rounded-full px-2 py-1 ${show.verdictColor}`}>
                        {show.verdict}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs mt-2 line-clamp-1">{show.description}</p>
                    <div className="mt-2">
                      <StarScore score={show.score} />
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/blog">
                <Button className="w-full mt-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 h-10 text-sm">
                  See All Reviews <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
