// app/api/odds/route.ts
// Proxy route — keeps your API key server-side and never exposes it to the browser
import { NextResponse } from "next/server";

const API_KEY = process.env.SPORTSGAMEODDS_KEY!;
const API_BASE = "https://api.sportsgameodds.com/v2";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league") || "NBA";

  if (!API_KEY) {
    return NextResponse.json(
      { error: "SPORTSGAMEODDS_KEY environment variable is not set" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${API_BASE}/events?leagueID=${league}&finalized=false&oddsAvailable=true&limit=20`,
      {
        headers: { "x-api-key": API_KEY },
        // Cache response for 30 seconds server-side
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      throw new Error(`SportsGameOdds API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching odds:", error);
    return NextResponse.json(
      { error: "Failed to fetch odds from SportsGameOdds API" },
      { status: 500 }
    );
  }
}
