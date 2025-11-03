import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import { AnalyticsCalculator } from '@/lib/analytics/AnalyticsCalculator';
import FieldingAnalytics from '@/database/models/FieldingAnalytics';

export async function GET() {
  try {
    await connectDB();

    let analytics = await FieldingAnalytics.findOne({});
    
    if (!analytics) {
      analytics = await AnalyticsCalculator.calculateFieldingAnalytics();
    }

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching fielding analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fielding analytics' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await connectDB();

    const analytics = await AnalyticsCalculator.calculateFieldingAnalytics();

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error calculating fielding analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate fielding analytics' },
      { status: 500 }
    );
  }
}