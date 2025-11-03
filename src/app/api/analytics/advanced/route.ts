import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import { AnalyticsCalculator } from '@/lib/analytics/AnalyticsCalculator';
import AdvancedMetrics from '@/database/models/AdvancedMetrics';

export async function GET() {
  try {
    await connectDB();

    let analytics = await AdvancedMetrics.findOne({});
    
    if (!analytics) {
      analytics = await AnalyticsCalculator.calculateAdvancedMetrics();
    }

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching advanced metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch advanced metrics' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await connectDB();

    const analytics = await AnalyticsCalculator.calculateAdvancedMetrics();

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('Error calculating advanced metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate advanced metrics' },
      { status: 500 }
    );
  }
}