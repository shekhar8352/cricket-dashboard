import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Match from '@/database/models/Match';
import Series from '@/database/models/Series';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate series is present
    if (!body.series) {
      return NextResponse.json(
        { success: false, error: 'Series/Tournament selection is mandatory' },
        { status: 400 }
      );
    }

    // Check if series exists
    const series = await Series.findOne({ name: body.series });
    if (!series) {
      return NextResponse.json(
        { success: false, error: 'Selected series not found' },
        { status: 404 }
      );
    }

    // Create new match
    const match = new Match({
      ...body,
      date: new Date(body.date),
      series: series.name,
      seriesType: series.type,
      tournament: series.name, // Assuming tournament name is same as series name
    });

    await match.save();

    // Update series with new match
    series.matches.push(match._id);
    series.matchesPlayed = (series.matchesPlayed || 0) + 1;
    await series.save();

    return NextResponse.json({ success: true, match }, { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create match' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const matches = await Match.find({}).sort({ date: -1 });

    return NextResponse.json({ success: true, matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
