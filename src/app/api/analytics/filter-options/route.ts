import { NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Match from '@/database/models/Match';

export async function GET() {
  try {
    await connectDB();

    // Get unique values for filter options
    const matches = await Match.find({});

    const opponents = [...new Set(matches.map(match => match.opponent).filter(Boolean))];
    const venues = [...new Set(matches.map(match => match.venue).filter(Boolean))];
    const countries = [...new Set(matches.map(match => match.country).filter(Boolean))];
    const series = [...new Set(matches.map(match => match.series).filter(Boolean))];
    const tournaments = [...new Set(matches.map(match => match.tournament).filter(Boolean))];

    return NextResponse.json({
      success: true,
      options: {
        opponents: opponents.sort(),
        venues: venues.sort(),
        countries: countries.sort(),
        series: series.sort(),
        tournaments: tournaments.sort(),
      },
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}