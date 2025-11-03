import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import { AnalyticsCalculator } from '@/lib/analytics/AnalyticsCalculator';
import BowlingAnalytics from '@/database/models/BowlingAnalytics';

export async function GET() {
  try {
    await connectDB();

    let analytics = await BowlingAnalytics.findOne({});
    
    if (!analytics) {
      analytics = await AnalyticsCalculator.calculateBowlingAnalytics();
    }

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching bowling analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bowling analytics' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await connectDB();

    const analytics = await AnalyticsCalculator.calculateBowlingAnalytics();

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error calculating bowling analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate bowling analytics' },
      { status: 500 }
    );
  }
}