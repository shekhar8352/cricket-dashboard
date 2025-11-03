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
    
    // Create the series
    const series = new Series(data);
    await series.save();
    
    // If matches are provided, create them and associate with the series
    if (data.matches && data.matches.length > 0) {
      const matchPromises = data.matches.map(async (matchData: Record<string, unknown>) => {
        const match = new Match({
          ...matchData,
          series: series.name,
          seriesType: series.type,
          totalMatches: series.totalMatches
        });
        await match.save();
        return match._id;
      });
      
      const matchIds = await Promise.all(matchPromises);
      series.matches = matchIds;
      await series.save();
    }
    
    return NextResponse.json({ success: true, series });
  } catch (error) {
    console.error('Error creating series:', error);
    return NextResponse.json({ success: false, error: 'Failed to create series' }, { status: 500 });
  }
}