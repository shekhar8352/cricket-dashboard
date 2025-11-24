import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Match from '@/database/models/Match';
import Series from '@/database/models/Series';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Aggregate performance by series
        const seriesStats = await Match.aggregate([
            {
                $match: { series: { $exists: true, $ne: null } }
            },
            {
                $lookup: {
                    from: 'performances',
                    localField: '_id',
                    foreignField: 'match',
                    as: 'performances'
                }
            },
            { $unwind: '$performances' },
            {
                $group: {
                    _id: '$series', // Group by series name
                    matches: { $sum: 1 },
                    runs: { $sum: '$performances.runs' },
                    wickets: { $sum: '$performances.wickets' },
                    ballsFaced: { $sum: '$performances.ballsFaced' },
                    overs: { $sum: '$performances.overs' },
                    runsConceded: { $sum: '$performances.runsConceded' },
                    highestScore: { $max: '$performances.runs' },
                    catches: { $sum: '$performances.catches' },
                    stumpings: { $sum: '$performances.stumpings' },
                    runOuts: { $sum: '$performances.runOuts' },
                    fours: { $sum: '$performances.fours' },
                    sixes: { $sum: '$performances.sixes' },
                    inningsBatted: {
                        $sum: {
                            $cond: [{ $gt: ['$performances.ballsFaced', 0] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Enhance with series details
        const enhancedStats = await Promise.all(seriesStats.map(async (stat) => {
            const seriesDetails = await Series.findOne({ name: stat._id });

            // Calculate averages
            // Note: Batting average should ideally use (runs / (innings - notOuts)), but we'll use innings for now as approximation
            // or we need to count dismissals.
            // Let's try to count dismissals if possible, but for now simple average
            const battingAvg = stat.inningsBatted > 0 ? stat.runs / stat.inningsBatted : 0;
            const bowlingAvg = stat.wickets > 0 ? stat.runsConceded / stat.wickets : 0;
            const strikeRate = stat.ballsFaced > 0 ? (stat.runs / stat.ballsFaced) * 100 : 0;
            const economy = stat.overs > 0 ? stat.runsConceded / stat.overs : 0;

            return {
                seriesName: stat._id,
                matches: stat.matches,
                runs: stat.runs,
                wickets: stat.wickets,
                battingAverage: parseFloat(battingAvg.toFixed(2)),
                bowlingAverage: parseFloat(bowlingAvg.toFixed(2)),
                strikeRate: parseFloat(strikeRate.toFixed(2)),
                economy: parseFloat(economy.toFixed(2)),
                highestScore: stat.highestScore,
                fieldingDismissals: (stat.catches || 0) + (stat.stumpings || 0) + (stat.runOuts || 0),
                boundaries: (stat.fours || 0) + (stat.sixes || 0),
                details: seriesDetails
            };
        }));

        return NextResponse.json({ success: true, seriesStats: enhancedStats });
    } catch (error) {
        console.error('Error fetching series analytics:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch series analytics' }, { status: 500 });
    }
}
