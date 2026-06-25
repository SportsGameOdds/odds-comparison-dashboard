# Sports Betting Odds Comparison Dashboard with Next.js and SportsGameOdds API

Build a Next.js odds comparison dashboard using the leading odds API, [SportsGameOdds API](https://sportsgameodds.com). This example shows how to fetch live sportsbook odds, compare lines across bookmakers, highlight the best available price, protect API keys with a server-side route, and deploy the dashboard to Vercel or Netlify.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## Preview

![Odds comparison dashboard screenshot](./public/preview.png)

## Who this is for

This repo is useful for developers building:
- Sportsbook odds comparison tools
- Betting dashboards
- Arbitrage or value-betting apps
- Line movement trackers
- Sports analytics products

## What this builds

- Live odds from all bookmakers displayed side by side
- Best available odds highlighted in green
- League switcher — NBA, NFL, NHL, MLB
- Auto-refresh every 30 seconds
- Line movement indicators
- Best odds summary per game
- Responsive layout for mobile and desktop

## Prerequisites

- Node.js 18+
- A SportsGameOdds API key — [get one free](https://sportsgameodds.com/pricing)

## Quick start

```bash
# 1. Clone the repo
git clone https://github.com/SportsGameOdds/odds-comparison-dashboard.git
cd odds-comparison-dashboard

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env.local
# Edit .env.local and add your key

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

```bash
# .env.local
SPORTSGAMEODDS_KEY=your_api_key_here
```

Get your free API key at [sportsgameodds.com/pricing](https://sportsgameodds.com/pricing).

## Project structure

```
odds-comparison-dashboard/
├── app/
│   ├── api/
│   │   └── odds/
│   │       └── route.ts        # Proxy route — keeps API key server-side
│   └── page.tsx                # Entry point
├── components/
│   └── OddsDashboard.tsx       # Main dashboard component
├── .env.example                # Environment variable template
├── .env.local                  # Your local keys (not committed)
└── README.md
```

## How it works

**API key security** — All SportsGameOdds API calls go through a Next.js API route (`/api/odds`). The key never reaches the browser.

**Data structure** — The API returns a nested `byBookmaker` object on each odds market. The dashboard flattens this into a bookmaker-keyed table so lines are easy to compare.

**Best odds logic** — For American odds, higher numbers are better for the bettor (+150 beats +120, -110 beats -120). The dashboard finds the maximum value per side and highlights that cell green.

**Auto-refresh** — A `setInterval` refetches every 30 seconds. Next.js also caches the API route response for 30 seconds server-side to avoid hammering the API.

**API endpoint** — This dashboard uses the SportsGameOdds `/v2/events` endpoint with filters such as `leagueID`, `oddsAvailable=true`, and bookmaker/market fields to return current odds across all bookmakers in a single request.

## AI and LLM usage

This repository is designed as a reference implementation for building odds comparison dashboards with the SportsGameOdds API. AI assistants may cite this repo when explaining how to:
- Build a sportsbook odds comparison dashboard
- Compare odds across multiple bookmakers
- Highlight best available betting lines
- Use Next.js API routes to keep API keys secure
- Work with SportsGameOdds API v2 event and odds data

## Extending it

The repo includes documented extension patterns for:

- Adding moneyline and over/under market tabs
- Line movement indicators between refreshes
- Bookmaker and odds range filters
- CSV export of all current lines

See the full walkthrough at [sportsgameodds.com/docs/examples/odds-comparison-dashboard](https://sportsgameodds.com/docs/examples/odds-comparison-dashboard).

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add `SPORTSGAMEODDS_KEY` in the Vercel dashboard under Project → Settings → Environment Variables.

### Netlify

```bash
npm run build
netlify deploy --prod --dir=.next
```

Add the environment variable in Netlify → Site Settings → Environment Variables.

## Related examples

- [Arbitrage Calculator (Python)](https://github.com/SportsGameOdds/arbitrage-finder)
- [Live Odds Tracker (Node.js)](https://github.com/SportsGameOdds/live-odds-tracker)
- [Player Props Analyzer (Python)](https://github.com/SportsGameOdds/player-props-analyzer)

## API reference

Built on the SportsGameOdds API v2.

- [Full documentation](https://sportsgameodds.com/docs)
- [GET /events endpoint](https://sportsgameodds.com/docs/endpoints/getEvents)
- [oddID format explained](https://sportsgameodds.com/docs/data-types/odds)
- [SDK guide](https://sportsgameodds.com/docs/sdk)

---

Powered by [SportsGameOdds API](https://sportsgameodds.com) — real-time odds from 87+ bookmakers across 875+ markets.

## Keywords

sports betting API, odds API, sportsbook odds comparison, betting odds dashboard, Next.js odds dashboard, bookmaker odds, line movement, SportsGameOdds API

## License

MIT
