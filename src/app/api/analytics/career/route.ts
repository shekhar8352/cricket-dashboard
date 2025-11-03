import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import { AnalyticsCalculator } from '@/lib/analytics/AnalyticsCalculator';
import CareerAnalytics from '@/database/models/CareerAnalytics';

export async function GET() {
  try {
    await connectDB();

    // Get existing analytics or calculate if not exists
    let analytics = await CareerAnalytics.findOne({});
    
    if (!analytics) {
      analytics = await AnalyticsCalculator.calculateCareerAnalytics();
    }

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching career analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch career analytics' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await connectDB();

    // Recalculate career analytics
    const analytics = await AnalyticsCalculator.calculateCareerAnalytics();

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error calculating career analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate career analytics' },
      { status: 500 }
    );
  }
}