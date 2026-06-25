// components/OddsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookmakerOdds {
  odds: string;
  spread?: string;
  overUnder?: string;
  available: boolean;
  lastUpdatedAt: string;
}

interface Odd {
  oddID: string;
  betTypeID: string;
  sideID: string;
  periodID: string;
  byBookmaker: Record<string, BookmakerOdds>;
}

interface Event {
  eventID: string;
  teams: {
    home: { names: { long: string; medium: string; short: string } };
    away: { names: { long: string; medium: string; short: string } };
  };
  status: {
    startsAt: string;
  };
  odds: Record<string, Odd>;
}

interface GroupedOdds {
  [bookmaker: string]: {
    home?: BookmakerOdds & { sideID: string };
    away?: BookmakerOdds & { sideID: string };
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format American odds — adds + prefix for positive numbers.
 * e.g. 150 → "+150", -110 → "-110"
 */
const formatOdds = (price: string | number): string => {
  const num = typeof price === 'string' ? parseInt(price) : price;
  if (isNaN(num)) return 'N/A';
  return num > 0 ? `+${num}` : num.toString();
};

/**
 * Group odds by bookmaker for a given bet type (sp, ml, ou).
 * Returns { draftkings: { home: {...}, away: {...} }, fanduel: {...}, ... }
 */
const groupOddsByMarket = (
  odds: Record<string, Odd>,
  betType: string
): GroupedOdds => {
  const grouped: GroupedOdds = {};

  Object.values(odds).forEach((odd) => {
    if (odd.betTypeID !== betType || odd.periodID !== 'game') return;

    Object.entries(odd.byBookmaker || {}).forEach(([bookmakerID, bookmakerOdds]) => {
      if (!bookmakerOdds.available) return;

      if (!grouped[bookmakerID]) grouped[bookmakerID] = {};

      grouped[bookmakerID][odd.sideID as 'home' | 'away'] = {
        ...bookmakerOdds,
        sideID: odd.sideID,
      };
    });
  });

  return grouped;
};

/**
 * Find the bookmaker offering the best odds for a given side.
 * For American odds, higher numbers = better value for the bettor.
 * e.g. +150 beats +120, -110 beats -120
 */
const findBestOdds = (
  odds: Record<string, Odd>,
  betType: string,
  side: 'home' | 'away'
): string | null => {
  let bestBookmaker: string | null = null;
  let bestOddsValue = -Infinity;

  Object.values(odds).forEach((odd) => {
    if (odd.betTypeID !== betType || odd.sideID !== side || odd.periodID !== 'game') return;

    Object.entries(odd.byBookmaker || {}).forEach(([bookmakerID, bookmakerOdds]) => {
      if (!bookmakerOdds.available) return;

      const oddsNum = parseInt(bookmakerOdds.odds);
      if (!isNaN(oddsNum) && oddsNum > bestOddsValue) {
        bestOddsValue = oddsNum;
        bestBookmaker = bookmakerID;
      }
    });
  });

  return bestBookmaker;
};

// ─── Component ────────────────────────────────────────────────────────────────

const LEAGUES = ['NBA', 'NFL', 'NHL', 'MLB'] as const;
type League = typeof LEAGUES[number];

export default function OddsDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [league, setLeague] = useState<League>('NBA');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchOdds = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/odds?league=${league}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);
      if (data.data) {
        setEvents(data.data);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Error fetching odds:', err);
      setError('Failed to load odds. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOdds();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOdds, 30_000);
    return () => clearInterval(interval);
  }, [league]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Odds Comparison Dashboard</h1>
        <p className="text-gray-500 mb-4">
          Powered by{' '}
          <a
            href="https://sportsgameodds.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            SportsGameOdds API
          </a>{' '}
          — 87+ bookmakers, real-time data
        </p>

        {/* League selector */}
        <div className="flex gap-3 mb-3">
          {LEAGUES.map((l) => (
            <button
              key={l}
              onClick={() => setLeague(l)}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors ${
                league === l
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Last update timestamp */}
        {lastUpdate && (
          <p className="text-sm text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()} · auto-refreshes every 30s
          </p>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64 text-gray-500">
          Loading odds...
        </div>
      )}

      {/* Games */}
      {!loading && (
        <div className="space-y-8">
          {events.map((event) => {
            const spreadOdds = groupOddsByMarket(event.odds, 'sp');
            const bestHomeSpread = findBestOdds(event.odds, 'sp', 'home');
            const bestAwaySpread = findBestOdds(event.odds, 'sp', 'away');

            return (
              <div key={event.eventID} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">

                {/* Matchup header */}
                <div className="mb-5">
                  <h2 className="text-xl font-bold">
                    {event.teams.away.names.long} @ {event.teams.home.names.long}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {event.status?.startsAt
                      ? new Date(event.status.startsAt).toLocaleString()
                      : 'Time TBD'}
                  </p>
                </div>

                {/* Spread odds table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th className="text-left py-2 pr-4 font-medium">Bookmaker</th>
                        <th className="text-center py-2 px-4 font-medium">
                          {event.teams.away.names.medium} (spread)
                        </th>
                        <th className="text-center py-2 px-4 font-medium">
                          {event.teams.home.names.medium} (spread)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(spreadOdds).map(([bookmaker, odds]) => (
                        <tr key={bookmaker} className="border-b last:border-0 hover:bg-gray-50">

                          {/* Bookmaker name */}
                          <td className="py-3 pr-4 font-medium capitalize text-gray-700">
                            {bookmaker}
                          </td>

                          {/* Away team spread */}
                          <td className="py-3 px-4 text-center">
                            {odds.away ? (
                              <span
                                className={`inline-block px-3 py-1 rounded-md font-mono ${
                                  bestAwaySpread === bookmaker
                                    ? 'bg-green-100 border-2 border-green-500 font-bold text-green-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {odds.away.spread} {formatOdds(odds.away.odds)}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>

                          {/* Home team spread */}
                          <td className="py-3 px-4 text-center">
                            {odds.home ? (
                              <span
                                className={`inline-block px-3 py-1 rounded-md font-mono ${
                                  bestHomeSpread === bookmaker
                                    ? 'bg-green-100 border-2 border-green-500 font-bold text-green-800'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {odds.home.spread} {formatOdds(odds.home.odds)}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Best odds summary */}
                {(bestAwaySpread || bestHomeSpread) && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg text-sm">
                    <p className="font-semibold text-green-800 mb-2">Best available odds</p>
                    <div className="grid grid-cols-2 gap-3 text-green-700">
                      {bestAwaySpread && spreadOdds[bestAwaySpread]?.away && (
                        <div>
                          <span className="font-medium">{event.teams.away.names.medium}:</span>{' '}
                          {spreadOdds[bestAwaySpread].away?.spread}{' '}
                          {formatOdds(spreadOdds[bestAwaySpread].away?.odds || '')}{' '}
                          <span className="text-green-500">@ {bestAwaySpread}</span>
                        </div>
                      )}
                      {bestHomeSpread && spreadOdds[bestHomeSpread]?.home && (
                        <div>
                          <span className="font-medium">{event.teams.home.names.medium}:</span>{' '}
                          {spreadOdds[bestHomeSpread].home?.spread}{' '}
                          {formatOdds(spreadOdds[bestHomeSpread].home?.odds || '')}{' '}
                          <span className="text-green-500">@ {bestHomeSpread}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {events.length === 0 && !error && (
            <div className="text-center text-gray-400 py-16">
              No upcoming {league} games found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
