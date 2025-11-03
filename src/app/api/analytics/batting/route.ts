import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import { AnalyticsCalculator } from '@/lib/analytics/AnalyticsCalculator';
import BattingAnalytics from '@/database/models/BattingAnalytics';

export async function GET() {
  try {
    await connectDB();

    let analytics = await BattingAnalytics.findOne({});
    
    if (!analytics) {
      analytics = await AnalyticsCalculator.calculateBattingAnalytics();
    }

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching batting analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batting analytics' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await connectDB();

    const analytics = await AnalyticsCalculator.calculateBattingAnalytics();

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error calculating batting analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate batting analytics' },
      { status: 500 }
    );
  }
}