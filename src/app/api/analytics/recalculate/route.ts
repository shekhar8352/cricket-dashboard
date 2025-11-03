import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import { AnalyticsCalculator } from '@/lib/analytics/AnalyticsCalculator';

export async function POST() {
  try {
    await connectDB();

    // Recalculate all analytics
    await AnalyticsCalculator.recalculateAllAnalytics();

    return NextResponse.json({ 
      success: true, 
      message: 'All analytics recalculated successfully' 
    });
  } catch (error) {
    console.error('Error recalculating analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to recalculate analytics' },
      { status: 500 }
    );
  }
}