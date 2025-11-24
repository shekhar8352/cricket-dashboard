import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Series from '@/database/models/Series';
import Match from '@/database/models/Match';

export async function GET() {
  try {
    await connectDB();
    const series = await Series.find().populate('matches').sort({ startDate: -1 });
    return NextResponse.json({ success: true, series });
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch series' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    console.log('Received series data:', data);

    // Check if series with same name already exists
    const existingSeries = await Series.findOne({ name: data.name });
    if (existingSeries) {
      return NextResponse.json({
        success: false,
        error: `A series/tournament with the name "${data.name}" already exists. Please choose a different name.`
      }, { status: 400 });
    }

    // Create the series first
    const seriesData = {
      name: data.name,
      type: data.type,
      format: data.format,
      level: data.level,
      startDate: data.startDate,
      endDate: data.endDate,
      hostCountry: data.hostCountry,
      teams: data.teams,
      totalMatches: data.totalMatches,
      matchTypes: data.matchTypes,
      description: data.description,
      trophy: data.trophy,
      sponsor: data.sponsor,
      status: data.status || 'upcoming',
      matches: []
    };

    const series = new Series(seriesData);
    await series.save();

    console.log('Series created successfully:', series);

    // Matches are no longer created here - they are added one by one later
    console.log(`Successfully created series "${series.name}" - matches to be added manually`);

    return NextResponse.json({ success: true, series });
  } catch (error) {
    console.error('Error creating series:', error);
    console.error('Error details:', error);

    // Handle MongoDB duplicate key error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({
        success: false,
        error: 'A series with this name already exists. Please choose a different name.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create series',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

