import { NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Series from '@/database/models/Series';
import Match from '@/database/models/Match';
import Performance from '@/database/models/Performance';
import Competition from '@/database/models/Competition';
import Stats from '@/database/models/Stats';
import CareerAnalytics from '@/database/models/CareerAnalytics';
import BattingAnalytics from '@/database/models/BattingAnalytics';
import BowlingAnalytics from '@/database/models/BowlingAnalytics';
import FieldingAnalytics from '@/database/models/FieldingAnalytics';
import AdvancedMetrics from '@/database/models/AdvancedMetrics';
import SeriesParticipation from '@/database/models/SeriesParticipation';

export async function POST() {
    try {
        await connectDB();

        // Delete all records except Players
        await Series.deleteMany({});
        await Match.deleteMany({});
        await Performance.deleteMany({});
        await Competition.deleteMany({});
        await Stats.deleteMany({});
        await CareerAnalytics.deleteMany({});
        await BattingAnalytics.deleteMany({});
        await BowlingAnalytics.deleteMany({});
        await FieldingAnalytics.deleteMany({});
        await AdvancedMetrics.deleteMany({});
        await SeriesParticipation.deleteMany({});

        return NextResponse.json({
            success: true,
            message: 'All data cleared successfully (except Players)'
        });
    } catch (error) {
        console.error('Error clearing database:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to clear database'
        }, { status: 500 });
    }
}
